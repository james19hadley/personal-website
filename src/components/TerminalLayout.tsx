import { useState, useRef, useEffect, type ReactNode } from 'react';
import { projects } from '../data/projects';
import { blogPosts } from '../data/blog';
import { Terminal as TerminalIcon, Sun, Moon, Layout } from 'lucide-react';
import { InlinePokemonGarden } from './InlinePokemonGarden';
import './TerminalLayout.css';


interface TerminalLayoutProps {
  onSwitchToGui: () => void;
  onNavigateToGameBoy: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  wasmModule: any;
  currentPwd: string;
  setCurrentPwd: (pwd: string) => void;
  history: LogEntry[];
  setHistory: React.Dispatch<React.SetStateAction<LogEntry[]>>;
}

interface LogEntry {
  command?: string;
  pwd?: string;
  output: ReactNode;
}

const POKEMON_POOL = [
  { id: 1, name: 'bulbasaur' },
  { id: 4, name: 'charmander' },
  { id: 7, name: 'squirtle' },
  { id: 25, name: 'pikachu' },
  { id: 130, name: 'gyarados' },
  { id: 149, name: 'dragonite' },
  { id: 94, name: 'gengar' },
  { id: 143, name: 'snorlax' },
  { id: 133, name: 'eevee' },
  { id: 151, name: 'mew' },
  { id: 6, name: 'charizard' },
  { id: 384, name: 'rayquaza' }
];

/**
 * @component TerminalLayout
 * @description Interactive terminal shell simulating a UNIX command line interface.
 * Exposes commands (whoami, about, projects, blog, gui, theme, secret, pokemon, gameboy) and compiles/interacts with
 * the C++ in-memory filesystem (tmpfs-cpp) loaded via WebAssembly. Implements automatic state serialization and caching in localStorage.
 * @param {() => void} onSwitchToGui - Callback to swap layout back to Bento grid GUI
 * @param {() => void} onNavigateToGameBoy - Callback to load GameBoy console layout
 * @param {'dark' | 'light'} theme - Current active UI color theme
 * @param {() => void} toggleTheme - Color theme toggle helper
 * @param {any} wasmModule - Instantiated C++ WebAssembly filesystem module
 * @param {string} currentPwd - Active shell path inside C++ filesystem
 * @param {(pwd: string) => void} setCurrentPwd - Prompt working path updater
 * @param {LogEntry[]} history - History array storing executed commands and outputs
 * @param {React.Dispatch<any>} setHistory - State dispatcher for console log history
 */
export const TerminalLayout = ({ 
  onSwitchToGui, 
  onNavigateToGameBoy,
  theme, 
  toggleTheme,
  wasmModule,
  currentPwd,
  setCurrentPwd,
  history,
  setHistory
}: TerminalLayoutProps) => {
  const [inputVal, setInputVal] = useState('');


  
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom of console
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Focus input on terminal click
  const focusInput = () => {
    inputRef.current?.focus();
  };

  useEffect(() => {
    focusInput();
  }, []);

  const handleCommandRun = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    const parts = trimmed.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    let output: ReactNode;
    const wasmCommands = ['ls', 'pwd', 'cd', 'mkdir', 'touch', 'echo', 'cat', 'ln'];

    if (wasmCommands.includes(command)) {
      if (!wasmModule) {
        output = <p className="error-text">WebAssembly tmpfs module is still initializing. Please wait a moment...</p>;
      } else {
        try {
          const executeFn = wasmModule.cwrap('execute_command', 'string', ['string']);
          const getPwdFn = wasmModule.cwrap('get_pwd', 'string', []);

          // Run C++ function
          const result = executeFn(trimmed);

          // Retrieve updated directory
          const nextPwd = getPwdFn();
          setCurrentPwd(nextPwd);

          // Serialize and save to cache
          try {
            const serializeFn = wasmModule.cwrap('serialize_fs', 'string', []);
            const state = serializeFn();
            localStorage.setItem('zijh-fs-state', state);
          } catch (serializeErr) {
            console.error('Failed to serialize filesystem state:', serializeErr);
          }

          output = result ? (
            <pre className="wasm-output">{result}</pre>
          ) : null;
        } catch (err: any) {
          output = <p className="error-text">Wasm error: {err.message || String(err)}</p>;
        }
      }
    } else {
      switch (command) {
        case 'help':
        case '?':
          output = (
            <div className="cmd-output-help">
              <p className="section-title">Available Commands:</p>
              <ul className="help-list">
                <li><span className="cmd-name">whoami</span> - Display current user identity & aliases</li>
                <li><span className="cmd-name">about</span> - Print details about Ivan (ZIJH) & TUD studies</li>
                <li><span className="cmd-name">projects [--handmade | --vibe]</span> - List creations by type</li>
                <li><span className="cmd-name">blog [list | read &lt;id&gt;]</span> - Show log list or read a specific entry</li>
                <li><span className="cmd-name">gui</span> / <span className="cmd-name">exit</span> - Switch layout back to home view</li>
                <li><span className="cmd-name">theme</span> - Toggle light/dark UI themes</li>
                <li><span className="cmd-name">clear</span> - Reset terminal window history</li>
                <li><span className="cmd-name">secret</span> - Run custom system diagnostics</li>
                <li><span className="cmd-name">pokemon [garden | view &lt;name&gt;]</span> - View animated sprites or render garden inline</li>
                <li><span className="cmd-name">gameboy</span> - Launch standalone GameBoy GBA Emulator (plays FireRed)</li>
              </ul>
              <p className="section-title" style={{ marginTop: '16px' }}>C++ Virtual Filesystem (tmpfs-cpp Wasm):</p>
              <ul className="help-list">
                <li><span className="cmd-name">ls [path]</span> - List contents of current or specified directory</li>
                <li><span className="cmd-name">cd &lt;path&gt;</span> - Change current working directory</li>
                <li><span className="cmd-name">pwd</span> - Print absolute path of current directory</li>
                <li><span className="cmd-name">mkdir &lt;path&gt;</span> - Create a new subdirectory</li>
                <li><span className="cmd-name">touch &lt;path&gt;</span> - Create a new empty file</li>
                <li><span className="cmd-name">echo &lt;content&gt; &lt;path&gt;</span> - Write text content to a file</li>
                <li><span className="cmd-name">cat &lt;path&gt;</span> - View contents of a file</li>
                <li><span className="cmd-name">ln -s &lt;target&gt; &lt;link&gt;</span> - Create a symbolic link</li>
              </ul>
            </div>
          );
          break;


      case 'whoami':
        output = (
          <div className="cmd-output-whoami">
            <p><span className="highlight font-bold">identity:</span> Ivan Zharov (zijh)</p>
            <p><span className="highlight font-bold">systems-user:</span> ging</p>
            <p><span className="highlight font-bold">cmdr:</span> Jack Heather (Elite Dangerous)</p>
            <p><span className="highlight font-bold">github:</span> james19hadley</p>
          </div>
        );
        break;

      case 'about':
        output = (
          <div className="cmd-output-about">
            <p><span className="highlight font-bold">Ivan Zharov (ZIJH)</span> - Developer & CS student.</p>
            <p>🎓 Currently in the last semester of my Bachelor degree at <span className="highlight">TU Darmstadt (TUD)</span>.</p>
            <p>📡 Focus: Systems programming, compilers, modular web interfaces, and keyboard layout optimization.</p>
            <p>📧 Email: <a href="mailto:ging19freecss@gmail.com" className="term-link">ging19freecss@gmail.com</a></p>
            <p>🖥️ GitHub: <a href="https://github.com/james19hadley" target="_blank" rel="noopener noreferrer" className="term-link">github.com/james19hadley</a></p>
          </div>
        );
        break;

      case 'pokemon': {
        const subAction = args[0] ? args[0].toLowerCase() : '';
        if (subAction === 'garden') {
          output = <InlinePokemonGarden />;
        } else if (subAction === 'view') {
          const targetName = args[1] ? args[1].toLowerCase() : 'bulbasaur';
          const pokeObj = POKEMON_POOL.find(p => p.name === targetName || p.id === parseInt(targetName));
          if (pokeObj) {
            const gifUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pokeObj.id}.gif`;
            output = (
              <div className="cmd-output-pokemon-view">
                <p>Viewing <span className="highlight text-capitalize">{pokeObj.name}</span> in console:</p>
                <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', display: 'inline-block' }}>
                  <img 
                    src={gifUrl} 
                    alt={pokeObj.name} 
                    style={{ imageRendering: 'pixelated', width: '64px', height: '64px', objectFit: 'contain' }} 
                  />
                </div>
              </div>
            );
          } else {
            output = <p className="error-text">Pokémon "{targetName}" not found. Try: bulbasaur, pikachu, gyarados, dragonite, gengar, snorlax, eevee, mew, charizard, rayquaza.</p>;
          }
        } else {
          output = (
            <div className="cmd-output-pokemon-help">
              <p className="section-title">Pokémon Command Line System:</p>
              <ul className="help-list">
                <li><span className="cmd-name">pokemon garden</span> - Render the animated pixel-art Pokémon Garden inline</li>
                <li><span className="cmd-name">pokemon view &lt;name&gt;</span> - Spawn & view a live animated sprite in terminal</li>
              </ul>
              <p style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Valid Pokémon names: bulbasaur, charmander, squirtle, pikachu, gyarados, dragonite, gengar, snorlax, eevee, mew, charizard, rayquaza.
              </p>
            </div>
          );
        }
        break;
      }

      case 'projects': {
        const showHandmade = args.includes('--handmade');
        const showVibe = args.includes('--vibe');
        
        let list = projects;
        if (showHandmade) list = projects.filter(p => p.type === 'handmade');
        if (showVibe) list = projects.filter(p => p.type === 'vibecoded');

        output = (
          <div className="cmd-output-projects">
            <p className="section-title">Project Catalog {showHandmade && '(Handmade Only)'} {showVibe && '(Vibe-coded Only)'}:</p>
            <div className="project-rows">
              {list.map(p => (
                <div key={p.id} className="project-row">
                  <div className="row-title-line">
                    <span className="row-title">{p.title}</span>
                    <span className={`row-badge ${p.type}`}>
                      {p.type === 'handmade' ? '🛠️ Handmade' : '⚡ Vibe-coded'}
                    </span>
                  </div>
                  <p className="row-desc">{p.description}</p>
                  <p className="row-tech">Tech: {p.techStack.join(', ')}</p>
                  {p.githubUrl && <p className="row-link">URL: <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="term-link">{p.githubUrl}</a></p>}
                </div>
              ))}
            </div>
          </div>
        );
        break;
      }

      case 'blog': {
        const subAction = args[0] ? args[0].toLowerCase() : 'list';
        
        if (subAction === 'list') {
          output = (
            <div className="cmd-output-blog-list">
              <p className="section-title">Blog Entries:</p>
              <div className="blog-rows">
                {blogPosts.map((post, idx) => (
                  <div key={post.id} className="blog-row">
                    <span className="row-index">[{idx + 1}]</span>
                    <span className="row-id highlight">blog read {post.id}</span>
                    <span className="row-title"> - {post.title} ({post.date})</span>
                  </div>
                ))}
              </div>
            </div>
          );
        } else if (subAction === 'read') {
          const postId = args[1];
          const post = blogPosts.find(p => p.id === postId);
          
          if (post) {
            output = (
              <div className="cmd-output-blog-content">
                <p className="article-title">{post.title}</p>
                <p className="article-meta">Date: {post.date} | Read time: {post.readTime} | Category: {post.category}</p>
                <div className="article-body">
                  {post.content.split('\n\n').map((para, i) => {
                    if (para.startsWith('### ')) {
                      return <p key={i} className="body-heading">{para.replace('### ', '')}</p>;
                    }
                    return <p key={i} className="body-paragraph">{para}</p>;
                  })}
                </div>
              </div>
            );
          } else {
            output = <p className="error-text">Error: Post "{postId}" not found. Type "blog list" to see valid IDs.</p>;
          }
        } else {
          output = <p className="error-text">Usage: blog [list | read &lt;id&gt;]</p>;
        }
        break;
      }

      case 'gui':
      case 'exit':
      case 'quit':
        // Transition back
        setTimeout(onSwitchToGui, 200);
        output = <p className="morph-text">Reconfiguring UI modules... returning home.</p>;
        break;

      case 'theme':
        toggleTheme();
        output = <p className="highlight">Toggling theme variables... Reload complete.</p>;
        break;

      case 'gameboy':
      case 'play':
        setTimeout(onNavigateToGameBoy, 200);
        output = <p className="morph-text">Booting Retro GBA Console modules... Launching GameBoy GBA Emulator.</p>;
        break;

      case 'clear':
        setHistory([]);
        setInputVal('');
        return;

      case 'secret':
        output = (
          <div className="cmd-output-secret">
            <p className="cyber-diag">Running ZIJH diagnostic parameters...</p>
            <p className="cyan-glow">[OK] Mainframes connected to zijh.pages.dev proxy.</p>
            <p className="cyan-glow">[OK] Keyboard layouts and shortcuts map resolved.</p>
            <p className="cyan-glow">[OK] Nen affinity detected: Specialization (Ging Freecss legacy).</p>
            <p className="matrix-ascii">
{`   _     _ _ _     
  (_)   (_| | |    
   _ _____| | |__  
  | (____ | |  _ \\ 
  | / ___ | | | | |
 _| \\_____|\\_|_| |_|
(__/               `}
            </p>
          </div>
        );
        break;

      default:
        output = <p className="error-text">Command not found: "{command}". Type "help" or "?" to show commands.</p>;
    }
  }

    setHistory(prev => [...prev, { command: cmdStr, pwd: currentPwd, output }]);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommandRun(inputVal);
    }
  };

  return (
    <div className="terminal-container fade-in" onClick={focusInput}>
      {/* HEADER CONTROLS */}
      <header className="terminal-header-bar">
        <div className="header-meta">
          <TerminalIcon size={14} className="term-icon" />
          <span>james19hadley@zijh-shell: ~</span>
        </div>
        <div className="header-controls">
          <button onClick={toggleTheme} className="term-ctrl-btn" title="Toggle Theme">
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button onClick={onSwitchToGui} className="term-ctrl-btn" title="Switch to Home GUI">
            <Layout size={14} />
          </button>
        </div>
      </header>

      {/* CONSOLE DISPLAY */}
      <div className="console-display">
        {history.map((log, idx) => (
          <div key={idx} className="log-group">
            {log.command !== undefined && (
              <div className="input-prompt">
                <span className="prompt-indicator">zijh {log.pwd || '/'} $</span>
                <span className="entered-command">{log.command}</span>
              </div>
            )}
            <div className="command-response">{log.output}</div>
          </div>
        ))}
        <div ref={consoleEndRef} />
      </div>

      {/* INPUT BAR */}
      <div className="console-input-bar">
        <span className="prompt-indicator">zijh {currentPwd} $</span>
        <input
          ref={inputRef}
          type="text"
          className="console-input"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
      </div>

      {/* SHORTCUT BAR FOR MOBILE */}
      <div className="terminal-shortcuts" onClick={e => e.stopPropagation()}>
        <span className="shortcuts-label">Shortcuts:</span>
        <div className="shortcut-buttons">
          <button onClick={() => handleCommandRun('help')}>help</button>
          <button onClick={() => handleCommandRun('about')}>about</button>
          <button onClick={() => handleCommandRun('projects')}>projects</button>
          <button onClick={() => handleCommandRun('blog list')}>blog</button>
          <button onClick={() => handleCommandRun('secret')}>secret</button>
          <button onClick={() => handleCommandRun('gui')}>gui</button>
        </div>
      </div>
    </div>
  );
};
