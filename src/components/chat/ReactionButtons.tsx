'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReactionButtonsProps {
  /** Callback saat reaction dipilih */
  onReaction: (reaction: 'thumbs_up' | 'thumbs_down') => void;
  /** Reaction yang sudah dipilih (jika ada) */
  selectedReaction?: 'thumbs_up' | 'thumbs_down' | null;
}

/**
 * ReactionButtons Component
 *
 * Component untuk thumbs up/down reactions pada assistant messages.
 * Memastikan touch target minimal 44px × 44px untuk accessibility.
 *
 * @param onReaction - Handler saat reaction dipilih
 * @param selectedReaction - Reaction yang sudah dipilih sebelumnya
 */
export function ReactionButtons({
  onReaction,
  selectedReaction,
}: ReactionButtonsProps) {
  const [localReaction, setLocalReaction] = useState<
    'thumbs_up' | 'thumbs_down' | null
  >(selectedReaction || null);

  const handleReaction = (reaction: 'thumbs_up' | 'thumbs_down') => {
    // Toggle reaction jika sudah dipilih
    const newReaction = localReaction === reaction ? null : reaction;
    setLocalReaction(newReaction);
    onReaction(reaction);
  };

  return (
    <div className="flex items-center gap-1">
      <TooltipProvider delayDuration={300}>
        {/* Thumbs Up Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleReaction('thumbs_up')}
              className={cn(
                'h-8 w-8 hover:bg-muted/80 transition-colors',
                'sm:h-10 sm:w-10', // Ensure 44px touch target on mobile
                localReaction === 'thumbs_up' &&
                  'bg-accent/10 text-accent hover:bg-accent/20'
              )}
              aria-label="Thumbs up"
              aria-pressed={localReaction === 'thumbs_up'}
            >
              <ThumbsUp
                className={cn(
                  'h-4 w-4',
                  localReaction === 'thumbs_up' && 'fill-current'
                )}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            <p>Helpful</p>
          </TooltipContent>
        </Tooltip>

        {/* Thumbs Down Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleReaction('thumbs_down')}
              className={cn(
                'h-8 w-8 hover:bg-muted/80 transition-colors',
                'sm:h-10 sm:w-10', // Ensure 44px touch target on mobile
                localReaction === 'thumbs_down' &&
                  'bg-destructive/10 text-destructive hover:bg-destructive/20'
              )}
              aria-label="Thumbs down"
              aria-pressed={localReaction === 'thumbs_down'}
            >
              <ThumbsDown
                className={cn(
                  'h-4 w-4',
                  localReaction === 'thumbs_down' && 'fill-current'
                )}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            <p>Not helpful</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
