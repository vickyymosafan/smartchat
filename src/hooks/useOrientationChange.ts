import { useEffect } from 'react';

/**
 * Hook to handle orientation changes smoothly
 * Ensures layout adapts properly when device orientation changes
 */
export function useOrientationChange() {
  useEffect(() => {
    // Handle orientation change
    const handleOrientationChange = () => {
      // Force a reflow to ensure smooth transition
      document.body.style.height = `${window.innerHeight}px`;

      // Reset after transition
      setTimeout(() => {
        document.body.style.height = '';
      }, 300);
    };

    // Listen for orientation change events
    window.addEventListener('orientationchange', handleOrientationChange);

    // Also listen for resize events (covers more cases)
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleOrientationChange, 100);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);
}
