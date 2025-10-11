'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Pin,
  MessageSquare,
  Clock,
  ChevronLeft,
  X,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * Interface untuk chat item
 */
export interface ChatItem {
  id: string;
  title: string;
  preview: string;
  timestamp: number;
  unreadCount?: number;
  isPinned?: boolean;
}

/**
 * Interface untuk props SidePanel
 */
export interface SidePanelProps {
  /** Apakah sidebar terbuka */
  open: boolean;
  /** Callback saat sidebar dibuka/ditutup */
  onOpenChange: (open: boolean) => void;
  /** Daftar chat items */
  chats?: ChatItem[];
  /** ID chat yang sedang aktif */
  activeChatId?: string;
  /** Callback saat chat item diklik */
  onChatSelect?: (chatId: string) => void;
}

/**
 * Component untuk individual chat item
 */
function ChatItemComponent({
  chat,
  isActive,
  onClick,
}: {
  chat: ChatItem;
  isActive: boolean;
  onClick: () => void;
}) {
  // Format timestamp menjadi relative time
  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}j`;
    if (days < 7) return `${days}h`;
    return new Date(timestamp).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'group relative w-full rounded-lg border p-3 text-left transition-all',
        'hover:bg-accent hover:border-accent-foreground/20',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isActive && 'bg-accent border-accent-foreground/20'
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
    >
      {/* Pinned indicator */}
      {chat.isPinned && (
        <div className="absolute top-2 right-2">
          <Pin className="h-3 w-3 text-muted-foreground" />
        </div>
      )}

      {/* Chat title */}
      <div className="mb-1 flex items-start justify-between gap-2">
        <h3
          className={cn(
            'line-clamp-1 text-sm font-medium',
            isActive ? 'text-foreground' : 'text-foreground/90'
          )}
        >
          {chat.title}
        </h3>
        <span className="shrink-0 text-xs text-muted-foreground">
          {formatTimestamp(chat.timestamp)}
        </span>
      </div>

      {/* Chat preview */}
      <p className="line-clamp-2 text-xs text-muted-foreground">
        {chat.preview}
      </p>

      {/* Unread badge */}
      {chat.unreadCount && chat.unreadCount > 0 && (
        <div className="mt-2">
          <Badge variant="default" className="h-5 px-2 text-xs">
            {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
          </Badge>
        </div>
      )}
    </motion.button>
  );
}

/**
 * Component untuk chat list
 */
function ChatList({
  chats,
  activeChatId,
  onChatSelect,
}: {
  chats: ChatItem[];
  activeChatId?: string;
  onChatSelect?: (chatId: string) => void;
}) {
  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MessageSquare className="mb-3 h-12 w-12 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">Belum ada percakapan</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {chats.map(chat => (
        <ChatItemComponent
          key={chat.id}
          chat={chat}
          isActive={chat.id === activeChatId}
          onClick={() => onChatSelect?.(chat.id)}
        />
      ))}
    </div>
  );
}

/**
 * SidePanel Component - Sidebar untuk chat history
 *
 * Features:
 * - Mobile: Slide-over dengan Sheet component (< 768px)
 * - Desktop: Collapsible sidebar (>= 768px)
 * - Search input untuk filter chats
 * - Pinned chats section
 * - Chat items dengan title, preview, timestamp
 * - Unread badge untuk new messages
 * - Hover effects dan animations
 * - Responsive behavior
 */
export function SidePanel({
  open,
  onOpenChange,
  chats = [],
  activeChatId,
  onChatSelect,
}: SidePanelProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter chats berdasarkan search query
  const filteredChats = chats.filter(
    chat =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Separate pinned and regular chats
  const pinnedChats = filteredChats.filter(chat => chat.isPinned);
  const regularChats = filteredChats.filter(chat => !chat.isPinned);

  /**
   * Sidebar content yang akan digunakan di mobile (Sheet) dan desktop (collapsible)
   */
  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Header dengan search */}
      <div className="border-b p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Percakapan</h2>
          {/* Close button untuk mobile */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            onClick={() => onOpenChange(false)}
            aria-label="Tutup sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari percakapan..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
            aria-label="Cari percakapan"
          />
        </div>
      </div>

      {/* Chat lists */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Pinned chats section */}
        {pinnedChats.length > 0 && (
          <div className="mb-6">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Pin className="h-3 w-3" />
              <span>Disematkan</span>
            </div>
            <ChatList
              chats={pinnedChats}
              activeChatId={activeChatId}
              onChatSelect={onChatSelect}
            />
          </div>
        )}

        {/* Regular chats section */}
        {regularChats.length > 0 && (
          <div>
            {pinnedChats.length > 0 && (
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Terbaru</span>
              </div>
            )}
            <ChatList
              chats={regularChats}
              activeChatId={activeChatId}
              onChatSelect={onChatSelect}
            />
          </div>
        )}

        {/* Empty state saat search tidak menemukan hasil */}
        {filteredChats.length === 0 && searchQuery && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="mb-3 h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Tidak ada percakapan yang cocok dengan "{searchQuery}"
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile: Sheet slide-over (< 768px) */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-[85%] p-0 sm:max-w-sm md:hidden">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop: Collapsible sidebar (>= 768px) */}
      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{
              duration: 0.24,
              ease: [0, 0, 0.2, 1], // ease-out
            }}
            className="hidden h-full w-80 border-r bg-background md:block"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
