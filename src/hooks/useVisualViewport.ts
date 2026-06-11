import { useState, useEffect } from 'react';

/**
 * Hook to track visual viewport height on mobile devices,
 * preventing layout issues when the virtual keyboard is toggled.
 */
export const useVisualViewport = (enabled: boolean = true) => {
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !window.visualViewport) {
      setViewportHeight(null);
      return;
    }
    const handleResize = () => {
      if (window.innerWidth <= 600) {
        setViewportHeight(window.visualViewport ? window.visualViewport.height : window.innerHeight);
        window.scrollTo(0, 0);
      } else {
        setViewportHeight(null);
      }
    };
    const vv = window.visualViewport;
    vv.addEventListener('resize', handleResize);
    vv.addEventListener('scroll', handleResize);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      vv.removeEventListener('resize', handleResize);
      vv.removeEventListener('scroll', handleResize);
      window.removeEventListener('resize', handleResize);
    };
  }, [enabled]);

  return viewportHeight;
};
