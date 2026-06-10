import { type ReactNode } from 'react';
import { projects } from '../data/projects';
import { blogPosts } from '../data/blog';
import { InlinePokemonGarden } from './InlinePokemonGarden';

export interface LogEntry {
  command?: string;
  pwd?: string;
  output: ReactNode;
}

export interface CommandContext {
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
  openVimEditor: (filename: string) => void;
}

export interface Command {
  name: string;
  description: string;
  execute: (ctx: CommandContext) => ReactNode | void;
}

export const POKEMON_POOL = [
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

export const commandsRegistry: { [key: string]: Command } = {
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
          <li><span className="cmd-name">vim &lt;path&gt;</span> - Edit file with built-in retro Vim editor</li>
          <li><span className="cmd-name">upload</span> - Upload file from computer to current VFS directory</li>
          <li><span className="cmd-name">download &lt;path&gt;</span> - Download file from VFS to computer</li>
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
  },
  download: {
    name: 'download',
    description: 'Download a file from the virtual filesystem',
    execute: ({ args, wasmModule, currentPwd }) => {
      const filename = args[0];
      if (!filename) {
        return <p className="error-text">Usage: download &lt;filename&gt;</p>;
      }

      if (!wasmModule) {
        return <p className="error-text">Wasm module not loaded.</p>;
      }

      const absolutePath = filename.startsWith('/')
        ? filename
        : (currentPwd === '/' ? '' : currentPwd) + '/' + filename;

      try {
        const executeFn = wasmModule.cwrap('execute_command', 'string', ['string']);
        const catResult = executeFn(`cat ${absolutePath}`);

        if (catResult.startsWith('cat: ')) {
          return <p className="error-text">{catResult.trim()}</p>;
        }

        const blob = new Blob([catResult], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);

        return <p className="highlight">Downloading file: {filename}...</p>;
      } catch (err: any) {
        return <p className="error-text">Failed to download file: {err.message || String(err)}</p>;
      }
    }
  },
  upload: {
    name: 'upload',
    description: 'Upload a file from your computer into the virtual filesystem',
    execute: ({ wasmModule, currentPwd, setHistory }) => {
      if (!wasmModule) {
        return <p className="error-text">Wasm module not loaded.</p>;
      }

      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '*/*';

      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          const absolutePath = (currentPwd === '/' ? '' : currentPwd) + '/' + file.name;

          try {
            const writeFileFn = wasmModule.cwrap('write_file_raw', null, ['string', 'string']);
            writeFileFn(absolutePath, content);

            const serializeFn = wasmModule.cwrap('serialize_fs', 'string', []);
            const state = serializeFn();
            localStorage.setItem('zijh-fs-state', state);

            setHistory(prev => [
              ...prev,
              {
                output: <p className="highlight">Successfully uploaded file "{file.name}" to {absolutePath} ({content.length} bytes).</p>
              }
            ]);
          } catch (err: any) {
            setHistory(prev => [
              ...prev,
              {
                output: <p className="error-text">Failed to save uploaded file: {err.message || String(err)}</p>
              }
            ]);
          }
        };

        reader.onerror = () => {
          setHistory(prev => [
            ...prev,
            {
              output: <p className="error-text">Failed to read file: {file.name}</p>
            }
          ]);
        };

        reader.readAsText(file);
      };

      input.click();
      return <p className="morph-text">Opening file dialog... Please select a file to upload.</p>;
    }
  },
  vim: {
    name: 'vim',
    description: 'Open built-in Vim text editor',
    execute: ({ args, openVimEditor }) => {
      const filename = args[0];
      if (!filename) {
        return <p className="error-text">Usage: vim &lt;filename&gt;</p>;
      }
      openVimEditor(filename);
      return <p className="morph-text">Opening Vim editor: {filename}...</p>;
    }
  }
};
