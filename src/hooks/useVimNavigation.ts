import { useState, useEffect } from 'react';

type ViewType = 'home' | 'projects' | 'blog' | 'space' | 'terminal' | 'gameboy';

interface UseVimNavigationProps {
  view: ViewType;
  setView: (view: ViewType) => void;
  prevNonTermView: ViewType;
}

export const useVimNavigation = ({ view, setView, prevNonTermView }: UseVimNavigationProps) => {
  const [activeIndex, setActiveIndex] = useState(-1);

  // Reset focus when view changes
  useEffect(() => {
    setActiveIndex(-1);
  }, [view]);

  // Sync focus visual styles after renders
  useEffect(() => {
    if (view === 'terminal') return;

    let selector = 'button, a:not(.p-tile-actions a), .blog-post-card, .project-tile-card, select';
    const modal = document.querySelector('.blog-modal-content');
    if (modal) {
      selector = '.blog-modal-content button, .blog-modal-content a';
    }

    const elements = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
    const visibleElements = elements.filter(el => el.offsetParent !== null);

    // Remove focus class from all elements
    document.querySelectorAll('.vim-focused').forEach(el => el.classList.remove('vim-focused'));

    // Apply focus class and focus the DOM element
    if (activeIndex >= 0 && activeIndex < visibleElements.length) {
      visibleElements[activeIndex].classList.add('vim-focused');
      visibleElements[activeIndex].focus();
    }
  }, [activeIndex, view]);

  // Key event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle terminal shortcut
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        setView(view === 'terminal' ? prevNonTermView : 'terminal');
        return;
      }

      if (view === 'terminal') return;

      // Skip navigation if typing in inputs or textareas
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable
      ) {
        return;
      }

      // If user is interacting with a select element, let arrow keys/enter work natively
      if (target.tagName === 'SELECT' && (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter')) {
        return;
      }

      const key = e.key.toLowerCase();
      const code = e.code;

      let action: 'forward' | 'backward' | 'confirm' | 'escape' | null = null;
      if (key === 'enter' || code === 'Enter') {
        action = 'confirm';
      } else if (key === 'escape' || code === 'Escape') {
        action = 'escape';
      } else {
        const isLatin = /^[a-z]$/.test(key);
        if (isLatin) {
          if (key === 'j' || key === 'l') {
            action = 'forward';
          } else if (key === 'k' || key === 'h') {
            action = 'backward';
          } else if (key === 'u' || key === 'q') {
            action = 'escape';
          }
        } else {
          // Fall back to physical code if non-Latin layout
          if (code === 'KeyJ' || code === 'KeyL') {
            action = 'forward';
          } else if (code === 'KeyK' || code === 'KeyH') {
            action = 'backward';
          } else if (code === 'KeyU' || code === 'KeyQ') {
            action = 'escape';
          }
        }
      }

      if (!action) return;

      let selector = 'button, a:not(.p-tile-actions a), .blog-post-card, .project-tile-card, select';
      const modal = document.querySelector('.blog-modal-content');
      if (modal) {
        selector = '.blog-modal-content button, .blog-modal-content a';
      }

      const elements = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
      const visibleElements = elements.filter(el => el.offsetParent !== null);

      if (visibleElements.length === 0) return;

      if (action === 'forward') {
        e.preventDefault();
        const newIndex = (activeIndex + 1) % visibleElements.length;
        setActiveIndex(newIndex);
      } else if (action === 'backward') {
        e.preventDefault();
        const newIndex = activeIndex <= 0 ? visibleElements.length - 1 : activeIndex - 1;
        setActiveIndex(newIndex);
      } else if (action === 'escape') {
        e.preventDefault();
        if (view === 'gameboy') {
          setView('terminal');
        } else if (view !== 'home') {
          setView('home');
        }
      } else if (action === 'confirm') {
        if (activeIndex >= 0 && activeIndex < visibleElements.length) {
          e.preventDefault();
          visibleElements[activeIndex].click();
          // If the clicked element is a select box, focus it natively to allow options browsing
          if (visibleElements[activeIndex].tagName === 'SELECT') {
            visibleElements[activeIndex].focus();
          } else {
            setActiveIndex(-1);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, activeIndex, prevNonTermView, setView]);

  return { activeIndex, setActiveIndex };
};
