import { useState, useEffect } from 'react';
import { HomeLayout } from './components/HomeLayout';
import { ProjectsLayout } from './components/ProjectsLayout';
import { BlogLayout } from './components/BlogLayout';
import { TerminalLayout } from './components/TerminalLayout';

function App() {
  const [view, setView] = useState<'home' | 'projects' | 'blog' | 'terminal'>(() => {
    const saved = localStorage.getItem('zijh-view');
    if (saved === 'projects' || saved === 'blog' || saved === 'terminal') {
      return saved as 'projects' | 'blog' | 'terminal';
    }
    return 'home';
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('zijh-theme');
    return (saved === 'light' ? 'light' : 'dark');
  });

  // Track previous view for terminal hotkey toggle
  const [prevNonTermView, setPrevNonTermView] = useState<'home' | 'projects' | 'blog'>('home');

  useEffect(() => {
    if (view !== 'terminal') {
      setPrevNonTermView(view);
    }
    localStorage.setItem('zijh-view', view);
  }, [view]);

  // Sync theme attribute to HTML tag
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('zijh-theme', theme);
  }, [theme]);

  // Global hotkey listener (Ctrl + `) to toggle Terminal mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        setView(prev => prev === 'terminal' ? prevNonTermView : 'terminal');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevNonTermView]);

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
      {view === 'terminal' && (
        <TerminalLayout 
          onSwitchToGui={() => setView(prevNonTermView)} 
          theme={theme}
          toggleTheme={toggleTheme}
        />
      )}

      {/* Floating hotkey helper */}
      <div className="hotkey-hint">
        Press <code>Ctrl + `</code> to toggle terminal
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
