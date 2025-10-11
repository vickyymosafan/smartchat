'use client';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TooltipButtonProps {
  /** Icon component dari lucide-react */
  icon: LucideIcon;
  /** Label untuk tooltip */
  label: string;
  /** Callback saat button diklik */
  onClick: () => void;
  /** Apakah button dalam state loading */
  isLoading?: boolean;
  /** Custom className */
  className?: string;
  /** Aria label untuk accessibility */
  ariaLabel?: string;
}

/**
 * TooltipButton Component
 *
 * Reusable button dengan tooltip untuk action buttons pada message.
 * Memastikan touch target minimal 44px × 44px untuk accessibility.
 *
 * @param icon - Icon component dari lucide-react
 * @param label - Label yang ditampilkan di tooltip
 * @param onClick - Handler saat button diklik
 * @param isLoading - Status loading button
 * @param className - Custom className untuk styling tambahan
 * @param ariaLabel - Aria label untuk screen readers
 */
export function TooltipButton({
  icon: Icon,
  label,
  onClick,
  isLoading = false,
  className,
  ariaLabel,
}: TooltipButtonProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClick}
            disabled={isLoading}
            className={cn(
              'h-8 w-8 hover:bg-muted/80 transition-colors',
              'sm:h-10 sm:w-10', // Ensure 44px touch target on mobile
              className
            )}
            aria-label={ariaLabel || label}
          >
            <Icon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
