'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  Plus,
  Trash2,
  Settings,
  MessageCircle,
  Keyboard,
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';

/**
 * Interface untuk command item
 */
interface CommandItemConfig {
  /** ID unik untuk command */
  id: string;
  /** Label yang ditampilkan */
  label: string;
  /** Deskripsi command */
  description?: string;
  /** Icon component dari lucide-react */
  icon: React.ComponentType<{ className?: string }>;
  /** Handler function saat command dipilih */
  onSelect: () => void;
  /** Keyboard shortcut (opsional) */
  shortcut?: string;
  /** Kategori command */
  category: 'actions' | 'navigation' | 'settings' | 'help';
}

/**
 * Props untuk CommandPalette component
 */
interface CommandPaletteProps {
  /** Apakah command palette terbuka */
  open: boolean;
  /** Callback saat command palette ditutup */
  onOpenChange: (open: boolean) => void;
  /** Callback untuk new chat action */
  onNewChat?: () => void;
  /** Callback untuk clear history action */
  onClearHistory?: () => void;
  /** Callback untuk open settings action */
  onOpenSettings?: () => void;
}

/**
 * CommandPalette - Command palette component dengan fuzzy search
 *
 * Komponen ini menyediakan:
 * - Searchable command menu dengan fuzzy matching
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Command categories (Actions, Navigation, Settings, Help)
 * - Recent commands tracking
 * - Smooth animations dengan Framer Motion
 * - Keyboard shortcuts display
 *
 * @param open - Apakah command palette terbuka
 * @param onOpenChange - Callback saat command palette ditutup
 * @param onNewChat - Callback untuk new chat action
 * @param onClearHistory - Callback untuk clear history action
 * @param onOpenSettings - Callback untuk open settings action
 * @param onToggleTheme - Callback untuk toggle theme action
 */
export function CommandPalette({
  open,
  onOpenChange,
  onNewChat,
  onClearHistory,
  onOpenSettings,
}: CommandPaletteProps) {
  // State untuk search query
  const [search, setSearch] = useState('');

  // State untuk recent commands (max 5)
  const [recentCommands, setRecentCommands] = useState<string[]>([]);

  /**
   * Load recent commands dari localStorage saat component mount
   */
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentCommands');
      if (stored) {
        setRecentCommands(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load recent commands:', error);
    }
  }, []);

  /**
   * Save recent command ke localStorage
   */
  const saveRecentCommand = useCallback((commandId: string) => {
    setRecentCommands(prev => {
      // Remove duplicate if exists
      const filtered = prev.filter(id => id !== commandId);
      // Add to beginning
      const updated = [commandId, ...filtered].slice(0, 5); // Keep max 5

      // Save to localStorage
      try {
        localStorage.setItem('recentCommands', JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save recent commands:', error);
      }

      return updated;
    });
  }, []);

  /**
   * Handle command selection
   */
  const handleSelect = useCallback(
    (commandId: string, handler: () => void) => {
      // Save to recent commands
      saveRecentCommand(commandId);

      // Execute handler
      handler();

      // Close command palette
      onOpenChange(false);

      // Reset search
      setSearch('');
    },
    [onOpenChange, saveRecentCommand]
  );

  /**
   * Define all available commands
   */
  const commands: CommandItemConfig[] = [
    // Actions
    {
      id: 'new-chat',
      label: 'New Chat',
      description: 'Start a new conversation',
      icon: Plus,
      onSelect: () => onNewChat?.(),
      shortcut: '⌘N',
      category: 'actions',
    },
    {
      id: 'clear-history',
      label: 'Clear History',
      description: 'Clear all messages in current chat',
      icon: Trash2,
      onSelect: () => onClearHistory?.(),
      category: 'actions',
    },

    // Navigation
    {
      id: 'focus-input',
      label: 'Focus Input',
      description: 'Focus message input field',
      icon: MessageCircle,
      onSelect: () => {
        const textarea = document.querySelector(
          'textarea[aria-label="Message input"]'
        ) as HTMLTextAreaElement;
        if (textarea) {
          textarea.focus();
        }
      },
      shortcut: '/',
      category: 'navigation',
    },

    // Settings
    {
      id: 'open-settings',
      label: 'Open Settings',
      description: 'Open settings dialog',
      icon: Settings,
      onSelect: () => onOpenSettings?.(),
      category: 'settings',
    },

    // Help
    {
      id: 'keyboard-shortcuts',
      label: 'Keyboard Shortcuts',
      description: 'View all keyboard shortcuts',
      icon: Keyboard,
      onSelect: () => {
        // TODO: Open keyboard shortcuts modal
        console.log('Show keyboard shortcuts');
      },
      category: 'help',
    },
    {
      id: 'help',
      label: 'Help & Documentation',
      description: 'View help documentation',
      icon: HelpCircle,
      onSelect: () => {
        // TODO: Open help documentation
        console.log('Show help documentation');
      },
      category: 'help',
    },
  ];

  /**
   * Get recent commands yang masih valid
   */
  const recentCommandItems = recentCommands
    .map(id => commands.find(cmd => cmd.id === id))
    .filter((cmd): cmd is CommandItemConfig => cmd !== undefined)
    .slice(0, 3); // Show max 3 recent commands

  /**
   * Group commands by category
   */
  const commandsByCategory = {
    actions: commands.filter(cmd => cmd.category === 'actions'),
    navigation: commands.filter(cmd => cmd.category === 'navigation'),
    settings: commands.filter(cmd => cmd.category === 'settings'),
    help: commands.filter(cmd => cmd.category === 'help'),
  };

  /**
   * Reset search saat dialog ditutup
   */
  useEffect(() => {
    if (!open) {
      setSearch('');
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <CommandDialog
          open={open}
          onOpenChange={onOpenChange}
          title="Command Palette"
          description="Search for commands to run"
        >
          <CommandInput
            placeholder="Type a command or search..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            {/* Recent Commands */}
            {recentCommandItems.length > 0 && !search && (
              <>
                <CommandGroup heading="Recent">
                  {recentCommandItems.map(command => {
                    const Icon = command.icon;
                    return (
                      <CommandItem
                        key={command.id}
                        value={command.label}
                        onSelect={() =>
                          handleSelect(command.id, command.onSelect)
                        }
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        <div className="flex flex-col">
                          <span>{command.label}</span>
                          {command.description && (
                            <span className="text-xs text-muted-foreground">
                              {command.description}
                            </span>
                          )}
                        </div>
                        {command.shortcut && (
                          <CommandShortcut>{command.shortcut}</CommandShortcut>
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {/* Actions */}
            <CommandGroup heading="Actions">
              {commandsByCategory.actions.map(command => {
                const Icon = command.icon;
                return (
                  <CommandItem
                    key={command.id}
                    value={command.label}
                    onSelect={() => handleSelect(command.id, command.onSelect)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span>{command.label}</span>
                      {command.description && (
                        <span className="text-xs text-muted-foreground">
                          {command.description}
                        </span>
                      )}
                    </div>
                    {command.shortcut && (
                      <CommandShortcut>{command.shortcut}</CommandShortcut>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>

            <CommandSeparator />

            {/* Navigation */}
            <CommandGroup heading="Navigation">
              {commandsByCategory.navigation.map(command => {
                const Icon = command.icon;
                return (
                  <CommandItem
                    key={command.id}
                    value={command.label}
                    onSelect={() => handleSelect(command.id, command.onSelect)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span>{command.label}</span>
                      {command.description && (
                        <span className="text-xs text-muted-foreground">
                          {command.description}
                        </span>
                      )}
                    </div>
                    {command.shortcut && (
                      <CommandShortcut>{command.shortcut}</CommandShortcut>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>

            <CommandSeparator />

            {/* Settings */}
            <CommandGroup heading="Settings">
              {commandsByCategory.settings.map(command => {
                const Icon = command.icon;
                return (
                  <CommandItem
                    key={command.id}
                    value={command.label}
                    onSelect={() => handleSelect(command.id, command.onSelect)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span>{command.label}</span>
                      {command.description && (
                        <span className="text-xs text-muted-foreground">
                          {command.description}
                        </span>
                      )}
                    </div>
                    {command.shortcut && (
                      <CommandShortcut>{command.shortcut}</CommandShortcut>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>

            <CommandSeparator />

            {/* Help */}
            <CommandGroup heading="Help">
              {commandsByCategory.help.map(command => {
                const Icon = command.icon;
                return (
                  <CommandItem
                    key={command.id}
                    value={command.label}
                    onSelect={() => handleSelect(command.id, command.onSelect)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span>{command.label}</span>
                      {command.description && (
                        <span className="text-xs text-muted-foreground">
                          {command.description}
                        </span>
                      )}
                    </div>
                    {command.shortcut && (
                      <CommandShortcut>{command.shortcut}</CommandShortcut>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      )}
    </AnimatePresence>
  );
}
