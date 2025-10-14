'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Pin,
  MessageSquare,
  Clock,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
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
    <button
      onClick={onClick}
      className={cn(
        'group relative w-full rounded-lg border p-3 text-left transition-colors',
        'hover:bg-accent/50 hover:border-accent-foreground/10',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        'active:scale-[0.98] transition-transform',
        isActive && 'bg-accent border-accent-foreground/20 shadow-sm'
      )}
    >
      {/* Chat title and timestamp */}
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <h3
          className={cn(
            'line-clamp-1 text-sm font-medium leading-tight',
            chat.isPinned && 'pr-5',
            isActive ? 'text-foreground' : 'text-foreground/90'
          )}
        >
          {chat.title}
        </h3>
        <span className="shrink-0 text-xs text-muted-foreground leading-tight">
          {formatTimestamp(chat.timestamp)}
        </span>
      </div>

      {/* Pinned indicator - positioned absolutely to not affect layout */}
      {chat.isPinned && (
        <div className="absolute top-3 right-3">
          <Pin className="h-3 w-3 text-muted-foreground/60 fill-muted-foreground/20" />
        </div>
      )}

      {/* Chat preview */}
      <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
        {chat.preview}
      </p>

      {/* Unread badge */}
      {chat.unreadCount && chat.unreadCount > 0 && (
        <div className="mt-2 flex items-center">
          <Badge
            variant="default"
            className="h-5 rounded-full px-2 text-[10px] font-medium"
          >
            {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
          </Badge>
        </div>
      )}
    </button>
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
    return null;
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
  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex h-full flex-col">
      {/* Header dengan search */}
      <div className="border-b p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Percakapan</h2>
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
        {/* Empty state - no chats at all */}
        {chats.length === 0 && !searchQuery && (
          <div className="flex h-full flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="mb-3 h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              Belum ada percakapan
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Mulai chat baru untuk memulai
            </p>
          </div>
        )}

        {/* Empty state - search no results */}
        {filteredChats.length === 0 && searchQuery && (
          <div className="flex h-full flex-col items-center justify-center py-12 text-center">
            <Search className="mb-3 h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              Tidak ditemukan
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Tidak ada percakapan yang cocok dengan "{searchQuery}"
            </p>
          </div>
        )}

        {/* Pinned chats section */}
        {pinnedChats.length > 0 && (
          <div className="mb-6">
            <div className="mb-2.5 flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              <Pin className="h-3.5 w-3.5" />
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
              <div className="mb-2.5 flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                <Clock className="h-3.5 w-3.5" />
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
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile: Sheet slide-over (< 768px) */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="left"
          className="w-[85vw] max-w-[320px] p-0 md:hidden"
        >
          <SheetTitle className="sr-only">Percakapan</SheetTitle>
          <SidebarContent isMobile={true} />
        </SheetContent>
      </Sheet>

      {/* Desktop: Collapsible sidebar (>= 768px) */}
      <AnimatePresence mode="wait">
        {open && (
          <motion.aside
            key="sidebar-desktop"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{
              duration: 0.2,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="hidden h-full shrink-0 overflow-hidden border-r bg-background md:block"
          >
            <div className="h-full w-80">
              <SidebarContent isMobile={false} />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
