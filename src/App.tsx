import { useState, useEffect } from 'react';
import { HomeLayout } from './components/HomeLayout';
import { ProjectsLayout } from './components/ProjectsLayout';
import { BlogLayout } from './components/BlogLayout';
import { SpaceLayout } from './components/SpaceLayout';
import { TerminalLayout } from './components/TerminalLayout';
import { GameBoyConsole } from './components/GameBoyConsole';
import createTmpFSModule from './wasm/tmpfs.js';
import { useVimNavigation } from './hooks/useVimNavigation';



/**
 * @component App
 * @description Root application controller and layout orchestrator. Manages global view state (home, projects, blog, space, terminal, gameboy),
 * theme settings (light/dark), and instantiates/restores the C++ in-memory virtual filesystem WebAssembly module.
 * Integrates useVimNavigation hook to enable global Vim-style keyboard shortcuts.
 */
function App() {
  const [view, setView] = useState<'home' | 'projects' | 'blog' | 'space' | 'terminal' | 'gameboy'>(() => {
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
  useVimNavigation({ view, setView, prevNonTermView });

  // Keep WebAssembly filesystem state alive across UI page swaps
  const [wasmModule, setWasmModule] = useState<any>(null);
  const [currentPwd, setCurrentPwd] = useState('/');
  const [terminalHistory, setTerminalHistory] = useState<any[]>([
    {
      output: (
        <div className="terminal-welcome">
          <p className="welcome-ascii">
{` ███████╗██╗██╗██╗  ██╗
 ╚══███╔╝██║██║██║  ██║
   ███╔╝ ██║██║███████║
  ███╔╝  ██║██║██╔══██║
 ███████╗██║██║██║  ██║
 ╚══════╝╚═╝╚═╝╚═╝  ╚═╝`}
          </p>
          <p className="welcome-text">Welcome to ZIJH Shell (v1.0.0)</p>
          <p className="welcome-sub">Type <span className="highlight">help</span> to view available commands. Click <span className="highlight">gui</span> to morph back to grid.</p>
        </div>
      )
    }
  ]);

  // Load and initialize WebAssembly C++ Filesystem (tmpfs-cpp)
  useEffect(() => {
    createTmpFSModule()
      .then((mod: any) => {
        setWasmModule(mod);

        // Restore filesystem from localStorage if it exists
        try {
          const savedState = localStorage.getItem('zijh-fs-state');
          if (savedState) {
            const items = JSON.parse(savedState);
            if (Array.isArray(items)) {
              const createDirFn = mod.cwrap('create_directory_raw', null, ['string']);
              const writeFileFn = mod.cwrap('write_file_raw', null, ['string', 'string']);

              // Sort items by path length (parents first) to avoid writing to non-existent dirs
              items.sort((a: any, b: any) => a.path.length - b.path.length);

              for (const item of items) {
                if (item.type === 'D') {
                  createDirFn(item.path);
                } else if (item.type === 'F') {
                  writeFileFn(item.path, item.content || '');
                }
              }
              console.log('Restored virtual C++ filesystem from cache.');
            }
          }
        } catch (err) {
          console.error('Failed to restore virtual filesystem:', err);
        }
      })
      .catch((err: any) => {
        console.error('Failed to load WebAssembly tmpfs module:', err);
      });
  }, []);

  useEffect(() => {
    if (view !== 'terminal' && view !== 'gameboy') {
      setPrevNonTermView(view);
    }
    if (view !== 'gameboy') {
      localStorage.setItem('zijh-view', view);
    }
  }, [view]);
  // Prevent mobile browser keyboard scrolling and notch cuts
  useEffect(() => {
    if (view === 'terminal' || view === 'gameboy') {
      const handleScroll = () => {
        if (window.scrollY !== 0) {
          window.scrollTo(0, 0);
        }
      };
      
      window.addEventListener('scroll', handleScroll);
      
      // Lock scroll overflow
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      return () => {
        window.removeEventListener('scroll', handleScroll);
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [view]);

  // Sync theme attribute to HTML tag
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('zijh-theme', theme);
  }, [theme]);

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
          onNavigateToGameBoy={() => setView('gameboy')}
          theme={theme}
          toggleTheme={toggleTheme}
          wasmModule={wasmModule}
          currentPwd={currentPwd}
          setCurrentPwd={setCurrentPwd}
          history={terminalHistory}
          setHistory={setTerminalHistory}
        />
      )}
      {view === 'gameboy' && (
        <GameBoyConsole 
          onBack={() => setView('terminal')} 
        />
      )}

      {/* Floating keybind helper */}
      <div className="hotkey-hint">
        {view === 'home' ? (
          <>Vim keys active: <code>J</code>/<code>L</code> to select // <code>Ctrl + `</code> for terminal</>
        ) : view === 'terminal' ? (
          <>Press <code>Ctrl + `</code> or type <code>exit</code> to close shell</>
        ) : view === 'gameboy' ? (
          <>Standard emulator controls: Arrow keys, Z/X, Enter, Shift // Click inside game to focus</>
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
