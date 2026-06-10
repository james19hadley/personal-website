import { useState, useEffect } from 'react';
import { BentoLayout } from './components/BentoLayout';
import { TerminalLayout } from './components/TerminalLayout';

function App() {
  const [mode, setMode] = useState<'gui' | 'cli'>(() => {
    const saved = localStorage.getItem('zijh-mode');
    return (saved === 'cli' ? 'cli' : 'gui');
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('zijh-theme');
    return (saved === 'light' ? 'light' : 'dark');
  });

  // Sync theme attribute to HTML tag
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('zijh-theme', theme);
  }, [theme]);

  // Sync mode to local storage
  useEffect(() => {
    localStorage.setItem('zijh-mode', mode);
  }, [mode]);

  // Global hotkey listener (Ctrl + `) to toggle mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        setMode(prev => prev === 'gui' ? 'cli' : 'gui');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

      {/* Dynamic Switcher */}
      {mode === 'gui' ? (
        <BentoLayout 
          onSwitchToCli={() => setMode('cli')} 
          theme={theme}
          toggleTheme={toggleTheme}
        />
      ) : (
        <TerminalLayout 
          onSwitchToGui={() => setMode('gui')} 
          theme={theme}
          toggleTheme={toggleTheme}
        />
      )}

      {/* Micro floating switch indicator at the very bottom corner */}
      <div className="hotkey-hint">
        Press <code>Ctrl + `</code> to toggle interface
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
