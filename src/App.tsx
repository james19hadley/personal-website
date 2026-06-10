import { useState, useEffect } from 'react';
import { HomeLayout } from './components/HomeLayout';
import { ProjectsLayout } from './components/ProjectsLayout';
import { BlogLayout } from './components/BlogLayout';
import { SpaceLayout } from './components/SpaceLayout';
import { TerminalLayout } from './components/TerminalLayout';
import { PokemonGarden } from './components/PokemonGarden';
import createTmpFSModule from './wasm/tmpfs.js';



function App() {
  const [view, setView] = useState<'home' | 'projects' | 'blog' | 'space' | 'terminal' | 'pokemon-garden'>(() => {
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
    if (view !== 'terminal' && view !== 'pokemon-garden') {
      setPrevNonTermView(view);
    }
    if (view !== 'pokemon-garden') {
      localStorage.setItem('zijh-view', view);
    }
  }, [view]);

  // Reset Vim focus highlight when switching pages
  useEffect(() => {
    setActiveIndex(-1);
  }, [view]);

  // Sync theme attribute to HTML tag
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('zijh-theme', theme);
  }, [theme]);

  // Keep focus visual styles in sync with activeIndex and view state changes after render
  useEffect(() => {
    if (view === 'terminal' || view === 'pokemon-garden') return;

    let selector = 'button, a, .blog-post-card';
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

  // Global keyboard shortcuts (Ctrl+` for Terminal, and Vim keys for navigation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle terminal
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        setView(prev => prev === 'terminal' ? prevNonTermView : 'terminal');
        return;
      }

      if (view === 'terminal' || view === 'pokemon-garden') return;

      const target = e.target as HTMLElement;
      // Skip if user is typing in form inputs (just in case they are added later)
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const key = e.key.toLowerCase();
      const code = e.code;

      // Identify action based on both physical code (layout-independent) and semantic key
      let action: 'forward' | 'backward' | 'confirm' | 'escape' | null = null;
      if (key === 'enter' || code === 'Enter') {
        action = 'confirm';
      } else if (key === 'escape' || code === 'Escape') {
        action = 'escape';
      } else {
        // If the key is a Latin letter, use key mapping (good for standard Latin layouts)
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
          // Fall back to physical code if non-Latin layout (e.g. Russian ЙЦУКЕН)
          if (code === 'KeyJ' || code === 'KeyL') {
            action = 'forward';
          } else if (code === 'KeyK' || code === 'KeyH') {
            action = 'backward';
          } else if (code === 'KeyU' || code === 'KeyQ') {
            action = 'escape';
          }
        }
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
        if (view !== 'home') {
          setView('home');
        }
      } else if (action === 'confirm') {
        if (activeIndex >= 0 && activeIndex < visibleElements.length) {
          e.preventDefault();
          visibleElements[activeIndex].click();
          setActiveIndex(-1);
        }
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
          onNavigateToGarden={() => setView('pokemon-garden')}
          theme={theme}
          toggleTheme={toggleTheme}
          wasmModule={wasmModule}
          currentPwd={currentPwd}
          setCurrentPwd={setCurrentPwd}
          history={terminalHistory}
          setHistory={setTerminalHistory}
        />
      )}
      {view === 'pokemon-garden' && (
        <PokemonGarden 
          onBack={() => setView('terminal')} 
        />
      )}

      {/* Floating keybind helper */}
      <div className="hotkey-hint">
        {view === 'home' ? (
          <>Vim keys active: <code>J</code>/<code>L</code> to select // <code>Ctrl + `</code> for terminal</>
        ) : view === 'terminal' ? (
          <>Press <code>Ctrl + `</code> or type <code>exit</code> / <code>:q</code> to close shell</>
        ) : view === 'pokemon-garden' ? (
          <>Use D-Pad to steer wind // Click A button to spawn Pokémon // B to reset garden</>
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
