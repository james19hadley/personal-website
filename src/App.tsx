import { useState, useEffect } from 'react';
import { HomeLayout } from './components/HomeLayout';
import { ProjectsLayout } from './components/ProjectsLayout';
import { BlogLayout } from './components/BlogLayout';
import { SpaceLayout } from './components/SpaceLayout';
import { TerminalLayout } from './components/TerminalLayout';
import { GameBoyConsole } from './components/GameBoyConsole';
import createTmpFSModule from './wasm/tmpfs.js';
import { useVimNavigation } from './hooks/useVimNavigation';
import { HotkeyHint } from './components/HotkeyHint';



/**
 * @component App
 * @description Root application controller and layout orchestrator. Manages global view state (home, projects, blog, space, terminal, gameboy),
 * theme settings (light/dark), and instantiates/restores the C++ in-memory virtual filesystem WebAssembly module.
 * Integrates useVimNavigation hook to enable global Vim-style keyboard shortcuts.
 */
function App() {
  const [view, setView] = useState<'home' | 'projects' | 'blog' | 'space' | 'terminal' | 'gameboy'>(() => {
    const hash = window.location.hash.replace('#/', '');
    if (['projects', 'blog', 'space', 'terminal', 'gameboy'].includes(hash)) {
      return hash as any;
    }
    const saved = localStorage.getItem('zijh-view');
    if (saved === 'projects' || saved === 'blog' || saved === 'space' || saved === 'terminal') {
      return saved as any;
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

  // Sync view state to URL hash
  useEffect(() => {
    if (view === 'home') {
      window.history.pushState(null, '', window.location.pathname);
    } else {
      window.location.hash = `#/${view}`;
    }
  }, [view]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '');
      if (['home', 'projects', 'blog', 'space', 'terminal', 'gameboy'].includes(hash)) {
        setView(hash as any);
      } else if (!hash) {
        setView('home');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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
      <HotkeyHint />
    </>
  );
}

export default App;
