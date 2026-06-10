import { useState, useEffect } from 'react';
import { HomeLayout } from './components/HomeLayout';
import { ProjectsLayout } from './components/ProjectsLayout';
import { BlogLayout } from './components/BlogLayout';
import { SpaceLayout } from './components/SpaceLayout';
import { TerminalLayout } from './components/TerminalLayout';

function App() {
  const [view, setView] = useState<'home' | 'projects' | 'blog' | 'space' | 'terminal'>(() => {
    const saved = localStorage.getItem('zijh-view');
    if (saved === 'projects' || saved === 'blog' || saved === 'space' || saved === 'terminal') {
      return saved as 'projects' | 'blog' | 'space' | 'terminal';
    }
    return 'home';
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('zijh-theme');
    return (saved === 'light' ? 'light' : 'dark');
  });

  // Track previous view for terminal hotkey toggle
  const [prevNonTermView, setPrevNonTermView] = useState<'home' | 'projects' | 'blog' | 'space'>('home');
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    if (view !== 'terminal') {
      setPrevNonTermView(view);
    }
    localStorage.setItem('zijh-view', view);
  }, [view]);

  // Reset Vim focus highlight when switching pages
  useEffect(() => {
    document.querySelectorAll('.vim-focused').forEach(el => el.classList.remove('vim-focused'));
    setActiveIndex(-1);
  }, [view]);

  // Sync theme attribute to HTML tag
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('zijh-theme', theme);
  }, [theme]);

  // Global keyboard shortcuts (Ctrl+` for Terminal, and Vim keys for navigation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle terminal
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        setView(prev => prev === 'terminal' ? prevNonTermView : 'terminal');
        return;
      }

      if (view === 'terminal') return;

      const target = e.target as HTMLElement;
      // Skip if user is typing in form inputs (just in case they are added later)
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const key = e.key.toLowerCase();
      const code = e.code;

      // Identify action based on both physical code (layout-independent) and semantic key (Dvorak/English)
      let action: 'forward' | 'backward' | 'back' | 'confirm' | 'escape' | null = null;
      if (key === 'enter' || code === 'Enter') {
        action = 'confirm';
      } else if (key === 'escape' || code === 'Escape') {
        action = 'escape';
      } else if (key === 'j' || code === 'KeyJ' || key === 'l' || code === 'KeyL') {
        action = 'forward';
      } else if (key === 'k' || code === 'KeyK') {
        action = 'backward';
      } else if (key === 'h' || code === 'KeyH' || key === 'u' || code === 'KeyU' || key === 'q' || code === 'KeyQ') {
        action = 'back';
      }

      if (!action) {
        return;
      }

      // Query current list of interactive items
      let selector = 'button, a, .blog-post-card';
      const modal = document.querySelector('.blog-modal-content');
      if (modal) {
        selector = '.blog-modal-content button, .blog-modal-content a';
      }

      const elements = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
      const visibleElements = elements.filter(el => el.offsetParent !== null);

      if (visibleElements.length === 0) return;

      let newIndex = activeIndex;

      if (action === 'forward') {
        e.preventDefault();
        newIndex = (activeIndex + 1) % visibleElements.length;
        setActiveIndex(newIndex);
      } else if (action === 'backward') {
        e.preventDefault();
        newIndex = activeIndex <= 0 ? visibleElements.length - 1 : activeIndex - 1;
        setActiveIndex(newIndex);
      } else if (action === 'back' || action === 'escape') {
        e.preventDefault();
        // If we are currently focusing an element on a content page, H/K acts as navigation unless index is -1
        // Let's make H/U/Q/Esc go back to home if we are on a page, or navigate if they are focused
        if (view !== 'home') {
          setView('home');
          return;
        }
        
        // If on home page, H can move backward
        newIndex = activeIndex <= 0 ? visibleElements.length - 1 : activeIndex - 1;
        setActiveIndex(newIndex);
      } else if (action === 'confirm') {
        if (activeIndex >= 0 && activeIndex < visibleElements.length) {
          e.preventDefault();
          visibleElements[activeIndex].click();
          setActiveIndex(-1);
        }
      }

      // Sync focus visual styles
      visibleElements.forEach(el => el.classList.remove('vim-focused'));
      if (newIndex >= 0 && newIndex < visibleElements.length) {
        visibleElements[newIndex].classList.add('vim-focused');
        visibleElements[newIndex].focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, activeIndex, prevNonTermView]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      {/* Background Ambient Orbs */}
      <div className="ambient-glows">
        <div className="ambient-orb orb-violet"></div>
        <div className="ambient-orb orb-cyan"></div>
      </div>

      {/* Dynamic View Switching */}
      {view === 'home' && (
        <HomeLayout 
          onNavigate={setView} 
          theme={theme}
          toggleTheme={toggleTheme}
        />
      )}
      {view === 'projects' && (
        <ProjectsLayout 
          onBack={() => setView('home')} 
        />
      )}
      {view === 'blog' && (
        <BlogLayout 
          onBack={() => setView('home')} 
        />
      )}
      {view === 'space' && (
        <SpaceLayout 
          onBack={() => setView('home')} 
        />
      )}
      {view === 'terminal' && (
        <TerminalLayout 
          onSwitchToGui={() => setView(prevNonTermView)} 
          theme={theme}
          toggleTheme={toggleTheme}
        />
      )}

      {/* Floating keybind helper */}
      <div className="hotkey-hint">
        {view === 'home' ? (
          <>Vim keys active: <code>J</code>/<code>L</code> to select // <code>Ctrl + `</code> for terminal</>
        ) : view === 'terminal' ? (
          <>Press <code>Ctrl + `</code> or type <code>exit</code> / <code>:q</code> to close shell</>
        ) : (
          <>Vim keys: <code>J</code>/<code>K</code> select // <code>H</code>, <code>U</code>, <code>Q</code>, or <code>Esc</code> to go back</>
        )}
      </div>

      <style>{`
        .hotkey-hint {
          position: fixed;
          bottom: 12px;
          right: 12px;
          font-size: 0.7rem;
          color: var(--text-muted);
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 4px 10px;
          border-radius: 8px;
          pointer-events: none;
          z-index: 90;
          font-family: var(--font-sans);
        }
        :root[data-theme='light'] .hotkey-hint {
          background: rgba(255, 255, 255, 0.7);
          border-color: rgba(0, 0, 0, 0.05);
          color: var(--text-secondary);
        }
        .hotkey-hint code {
          background: rgba(255, 255, 255, 0.1);
          padding: 1px 4px;
          border-radius: 4px;
          font-size: 0.65rem;
          color: var(--accent-cyan);
        }
      `}</style>
    </>
  );
}

export default App;
