'use client';

import { motion } from 'framer-motion';

/**
 * TypingIndicator Component
 *
 * Menampilkan animated dots indicator saat assistant sedang mengetik.
 * Menggunakan Framer Motion untuk smooth bounce animation dengan staggered delay.
 *
 * Features:
 * - 3 animated dots dengan bounce effect
 * - Staggered delay (0ms, 150ms, 300ms) untuk natural typing effect
 * - Opacity animation untuk subtle pulsing
 * - Infinite loop animation
 * - Wrapped dalam message bubble layout (left-aligned, muted background)
 *
 * Animation specs:
 * - Y-axis bounce: [0, -8, 0]
 * - Opacity: [0.5, 1, 0.5]
 * - Duration: 0.6s
 * - Easing: easeInOut
 */
export function TypingIndicator() {
  return (
    <div className="flex justify-start px-4 sm:px-6 lg:px-8">
      <div
        className="flex items-center gap-1 rounded-2xl rounded-bl-md border bg-muted px-4 py-3"
        role="status"
        aria-live="polite"
        aria-label="Assistant is typing"
      >
        {/* Render 3 dots dengan staggered animation */}
        {[0, 1, 2].map(index => (
          <motion.div
            key={index}
            className="h-2 w-2 rounded-full bg-muted-foreground"
            animate={{
              y: [0, -8, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: index * 0.15, // Staggered delay: 0ms, 150ms, 300ms
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
}
