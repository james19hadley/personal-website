import { useState, useRef, useEffect, type ReactNode } from 'react';
import { projects } from '../data/projects';
import { blogPosts } from '../data/blog';
import { Terminal as TerminalIcon, Sun, Moon, Layout, Maximize2, Minimize2 } from 'lucide-react';
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

interface CommandContext {
  rawCommand: string;
  args: string[];
  wasmModule: any;
  currentPwd: string;
  setCurrentPwd: (pwd: string) => void;
  setHistory: React.Dispatch<React.SetStateAction<LogEntry[]>>;
  toggleTheme: () => void;
  onSwitchToGui: () => void;
  onNavigateToGameBoy: () => void;
  clearHistory: () => void;
  setTerminalColor: (color: string) => void;
  startCMatrix: () => void;
}

interface Command {
  name: string;
  description: string;
  execute: (ctx: CommandContext) => ReactNode | void;
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

const commandsRegistry: { [key: string]: Command } = {
  help: {
    name: 'help',
    description: 'Display available commands',
    execute: () => (
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
          <li><span className="cmd-name">color &lt;name&gt;</span> - Customize terminal text color theme</li>
          <li><span className="cmd-name">cmatrix</span> - Launch canvas falling matrix digital rain</li>
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
    )
  },
  '?': {
    name: '?',
    description: 'Display available commands',
    execute: (ctx) => commandsRegistry.help.execute(ctx)
  },
  whoami: {
    name: 'whoami',
    description: 'Display current user identity & aliases',
    execute: () => (
      <div className="cmd-output-whoami">
        <p><span className="highlight font-bold">identity:</span> Ivan Zharov (zijh)</p>
        <p><span className="highlight font-bold">systems-user:</span> ging</p>
        <p><span className="highlight font-bold">cmdr:</span> Jack Heather (Elite Dangerous)</p>
        <p><span className="highlight font-bold">github:</span> james19hadley</p>
      </div>
    )
  },
  about: {
    name: 'about',
    description: 'Print details about Ivan (ZIJH) & TUD studies',
    execute: () => (
      <div className="cmd-output-about">
        <p><span className="highlight font-bold">Ivan Zharov (ZIJH)</span> - Developer & CS student.</p>
        <p>🎓 Currently in the last semester of my Bachelor degree at <span className="highlight">TU Darmstadt (TUD)</span>.</p>
        <p>📡 Focus: Systems programming, compilers, modular web interfaces, and keyboard layout optimization.</p>
        <p>📧 Email: <a href="mailto:ging19freecss@gmail.com" className="term-link">ging19freecss@gmail.com</a></p>
        <p>🖥️ GitHub: <a href="https://github.com/james19hadley" target="_blank" rel="noopener noreferrer" className="term-link">github.com/james19hadley</a></p>
      </div>
    )
  },
  pokemon: {
    name: 'pokemon',
    description: 'View animated sprites or render garden inline',
    execute: ({ args }) => {
      const subAction = args[0] ? args[0].toLowerCase() : '';
      if (subAction === 'garden') {
        return <InlinePokemonGarden />;
      } else if (subAction === 'view') {
        const targetName = args[1] ? args[1].toLowerCase() : 'bulbasaur';
        const pokeObj = POKEMON_POOL.find(p => p.name === targetName || p.id === parseInt(targetName));
        if (pokeObj) {
          const gifUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pokeObj.id}.gif`;
          return (
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
          return <p className="error-text">Pokémon "{targetName}" not found. Try: bulbasaur, pikachu, gyarados, dragonite, gengar, snorlax, eevee, mew, charizard, rayquaza.</p>;
        }
      } else {
        return (
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
    }
  },
  projects: {
    name: 'projects',
    description: 'List creations by type',
    execute: ({ args }) => {
      const showHandmade = args.includes('--handmade');
      const showVibe = args.includes('--vibe');
      
      let list = projects;
      if (showHandmade) list = projects.filter(p => p.type === 'handmade');
      if (showVibe) list = projects.filter(p => p.type === 'vibecoded');

      return (
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
    }
  },
  blog: {
    name: 'blog',
    description: 'Show log list or read a specific entry',
    execute: ({ args }) => {
      const subAction = args[0] ? args[0].toLowerCase() : 'list';
      
      if (subAction === 'list') {
        return (
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
          return (
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
          return <p className="error-text">Error: Post "{postId}" not found. Type "blog list" to see valid IDs.</p>;
        }
      } else {
        return <p className="error-text">Usage: blog [list | read &lt;id&gt;]</p>;
      }
    }
  },
  gui: {
    name: 'gui',
    description: 'Switch layout back to home view',
    execute: ({ onSwitchToGui }) => {
      setTimeout(onSwitchToGui, 200);
      return <p className="morph-text">Reconfiguring UI modules... returning home.</p>;
    }
  },
  exit: {
    name: 'exit',
    description: 'Switch layout back to home view',
    execute: (ctx) => commandsRegistry.gui.execute(ctx)
  },
  quit: {
    name: 'quit',
    description: 'Switch layout back to home view',
    execute: (ctx) => commandsRegistry.gui.execute(ctx)
  },
  theme: {
    name: 'theme',
    description: 'Toggle light/dark UI themes',
    execute: ({ toggleTheme }) => {
      toggleTheme();
      return <p className="highlight">Toggling theme variables... Reload complete.</p>;
    }
  },
  gameboy: {
    name: 'gameboy',
    description: 'Launch standalone GameBoy GBA Emulator (plays FireRed)',
    execute: ({ onNavigateToGameBoy }) => {
      setTimeout(onNavigateToGameBoy, 200);
      return <p className="morph-text">Booting Retro GBA Console modules... Launching GameBoy GBA Emulator.</p>;
    }
  },
  play: {
    name: 'play',
    description: 'Launch standalone GameBoy GBA Emulator (plays FireRed)',
    execute: (ctx) => commandsRegistry.gameboy.execute(ctx)
  },
  clear: {
    name: 'clear',
    description: 'Reset terminal window history',
    execute: ({ clearHistory }) => {
      clearHistory();
      return null;
    }
  },
  secret: {
    name: 'secret',
    description: 'Run custom system diagnostics',
    execute: () => (
      <div className="cmd-output-secret">
        <p className="cyber-diag">Running ZIJH diagnostic parameters...</p>
        <p className="cyan-glow">[OK] Mainframes connected to zijh.pages.dev proxy.</p>
        <p className="cyan-glow">[OK] Keyboard layouts and shortcuts map resolved.</p>
        <p className="cyan-glow">[OK] Nen affinity detected: Specialization (Ging Freecss legacy).</p>
        <div className="matrix-ascii">
          <pre>{`   _     _ _ _     
  (_)   (_| | |    
   _ _____| | |__  
  | (____ | |  _ \ 
  | / ___ | | | | |
  _| \_____|\_|_| |_|
 (__/               `}</pre>
        </div>
      </div>
    )
  },
  color: {
    name: 'color',
    description: 'Customize terminal text color theme',
    execute: ({ args, setTerminalColor }) => {
      const colorName = args[0] ? args[0].toLowerCase() : '';
      if (!colorName) {
        return (
          <div className="cmd-output-color-help">
            <p className="section-title">Color Command Customizer:</p>
            <p>Usage: <span className="highlight">color &lt;color-name&gt;</span></p>
            <p>Available colors:</p>
            <ul className="help-list">
              <li><span className="cmd-name">default</span> - Standard theme accent colors</li>
              <li><span className="cmd-name">green</span> - Retro green hacker theme</li>
              <li><span className="cmd-name">amber</span> - Amber CRT display theme</li>
              <li><span className="cmd-name">cyan</span> - Cyan cyberpunk highlight theme</li>
              <li><span className="cmd-name">violet</span> - Velvet purple glow theme</li>
              <li><span className="cmd-name">red</span> - Alert red console theme</li>
            </ul>
          </div>
        );
      }
      setTerminalColor(colorName);
      return <p className="highlight">Terminal text color theme reconfigured to: {colorName}.</p>;
    }
  },
  cmatrix: {
    name: 'cmatrix',
    description: 'Launch canvas falling matrix digital rain',
    execute: ({ startCMatrix }) => {
      startCMatrix();
      return <p className="morph-text">Launching digital rain system overlay...</p>;
    }
  }
};

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
  const [isMaximized, setIsMaximized] = useState(false);
  const [cursorIndex, setCursorIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(true);
  const [termColor, setTerminalColor] = useState('default');
  const [cmatrixActive, setCmatrixActive] = useState(false);

  const getTerminalColors = () => {
    switch (termColor) {
      case 'green':
        return { text: '#22c55e', accent: '#4ade80' };
      case 'amber':
      case 'yellow':
        return { text: '#fbbf24', accent: '#f59e0b' };
      case 'cyan':
        return { text: '#22d3ee', accent: '#06b6d4' };
      case 'violet':
      case 'purple':
        return { text: '#c084fc', accent: '#8b5cf6' };
      case 'red':
        return { text: '#ef4444', accent: '#f87171' };
      default:
        return null;
    }
  };

  const customColors = getTerminalColors();
  const termStyles = customColors ? {
    '--terminal-text': customColors.text,
    '--terminal-accent': customColors.accent,
    '--terminal-input': customColors.text,
  } as React.CSSProperties : {};

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);
    setCursorIndex(e.target.selectionStart || 0);
  };

  const handleInputKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCursorIndex((e.target as HTMLInputElement).selectionStart || 0);
  };

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    setCursorIndex((e.target as HTMLInputElement).selectionStart || 0);
  };


  
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
    } else if (commandsRegistry[command]) {
      const ctx: CommandContext = {
        rawCommand: trimmed,
        args,
        wasmModule,
        currentPwd,
        setCurrentPwd,
        setHistory,
        toggleTheme,
        onSwitchToGui,
        onNavigateToGameBoy,
        clearHistory: () => setHistory([]),
        setTerminalColor,
        startCMatrix: () => setCmatrixActive(true),
      };
      
      const res = commandsRegistry[command].execute(ctx);
      if (res === null && command === 'clear') {
        setInputVal('');
        return;
      }
      output = res || null;
    } else {
      output = <p className="error-text">Command not found: "{command}". Type "help" or "?" to show commands.</p>;
    }

    setHistory(prev => [...prev, { command: cmdStr, pwd: currentPwd, output }]);
    setInputVal('');
    setCursorIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommandRun(inputVal);
    } else {
      setTimeout(() => {
        if (inputRef.current) {
          setCursorIndex(inputRef.current.selectionStart || 0);
        }
      }, 0);
    }
  };

  return (
    <div 
      className={`terminal-container fade-in ${isMaximized ? 'maximized' : ''}`} 
      onClick={focusInput}
      style={termStyles}
    >
      {cmatrixActive && <MatrixRain onExit={() => setCmatrixActive(false)} />}
      {/* HEADER CONTROLS */}
      <header className="terminal-header-bar">
        <div className="header-meta">
          <TerminalIcon size={14} className="term-icon" />
          <span>james19hadley@zijh-shell: ~</span>
        </div>
        <div className="header-controls">
          <button 
            onClick={() => setIsMaximized(!isMaximized)} 
            className="term-ctrl-btn" 
            title={isMaximized ? "Restore Window" : "Maximize Terminal"}
          >
            {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
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
        <div className="input-wrapper">
          <input
            ref={inputRef}
            type="text"
            className="console-input"
            value={inputVal}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onKeyUp={handleInputKeyUp}
            onClick={handleInputClick}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          <div className="input-display">
            <span>{inputVal.slice(0, cursorIndex)}</span>
            <span className={`block-cursor ${isFocused ? 'blinking' : 'solid'}`}>
              {inputVal.slice(cursorIndex, cursorIndex + 1) || '\u00A0'}
            </span>
            <span>{inputVal.slice(cursorIndex + 1)}</span>
          </div>
        </div>
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

export const MatrixRain = ({ onExit }: { onExit: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set dimensions
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Characters
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZアイウエオカキクケコサシスセソタチツテト';
    const charArr = chars.split('');

    const fontSize = 14;
    let columns = Math.floor(canvas.width / fontSize);
    if (columns <= 0) columns = 1;

    // Y position for each column
    let drops: number[] = Array(columns).fill(1);

    const draw = () => {
      // Clear slightly transparent to create trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0f0'; // bright green text
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = charArr[Math.floor(Math.random() * charArr.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(char, x, y);

        // Reset drop to top randomly after it hits bottom
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);

    // Key handlers to exit
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'q' || e.key === 'Q' || (e.ctrlKey && e.key === 'c')) {
        e.preventDefault();
        onExit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onExit]);

  return (
    <div className="matrix-rain-overlay" style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: '#000',
      zIndex: 100,
      color: '#0f0',
      fontFamily: 'monospace'
    }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '18px',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '0.8rem',
        border: '1px solid #0f0',
        pointerEvents: 'none',
        zIndex: 101,
        fontFamily: 'var(--font-mono)'
      }}>
        [ cmatrix active — press Q or ESC to exit ]
      </div>
    </div>
  );
};
