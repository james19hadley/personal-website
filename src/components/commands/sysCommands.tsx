import { type Command } from './types';
import { POKEMON_POOL } from '../terminalCommands';
import { InlinePokemonGarden } from '../InlinePokemonGarden';

export const sysCommands: { [key: string]: Command } = {
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
          <li><span className="cmd-name">fullscreen</span> - Toggle window fullscreen mode (also: Alt+Enter / F11)</li>
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
          <li><span className="cmd-name">df</span> - Display virtual disk space usage & limits</li>
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
    execute: (ctx) => sysCommands.help.execute(ctx)
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
    execute: (ctx) => sysCommands.gui.execute(ctx)
  },
  quit: {
    name: 'quit',
    description: 'Switch layout back to home view',
    execute: (ctx) => sysCommands.gui.execute(ctx)
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
    execute: (ctx) => sysCommands.gameboy.execute(ctx)
  },
  clear: {
    name: 'clear',
    description: 'Reset terminal window history',
    execute: ({ clearHistory }) => {
      clearHistory();
      return null;
    }
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
  fullscreen: {
    name: 'fullscreen',
    description: 'Toggle window fullscreen maximization mode',
    execute: ({ toggleFullscreen }) => {
      if (toggleFullscreen) {
        toggleFullscreen();
        return <p className="highlight">Toggling fullscreen layout mode...</p>;
      }
      return <p className="error-text">Fullscreen toggle not available.</p>;
    }
  }
};
