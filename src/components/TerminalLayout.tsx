import { useState, useRef, useEffect, type ReactNode } from 'react';
import { Terminal as TerminalIcon, Sun, Moon, Layout, Maximize2, Minimize2 } from 'lucide-react';
import { VimEditor } from './VimEditor';
import { MatrixRain } from './MatrixRain';
import { commandsRegistry, type CommandContext, type LogEntry } from './terminalCommands';
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

/**
 * @component TerminalLayout
 * @description Interactive terminal shell simulating a UNIX command line interface.
 * Exposes registry-mapped commands and compiles/interacts with the C++ virtual filesystem.
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
  const [vimActive, setVimActive] = useState(false);
  const [vimFileName, setVimFileName] = useState('');
  const [vimContent, setVimContent] = useState('');

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

  const openVimEditor = (filename: string) => {
    setVimFileName(filename);
    const absolutePath = filename.startsWith('/')
      ? filename
      : (currentPwd === '/' ? '' : currentPwd) + '/' + filename;
    
    let initialText = '';
    if (wasmModule) {
      try {
        const executeFn = wasmModule.cwrap('execute_command', 'string', ['string']);
        const catResult = executeFn(`cat ${absolutePath}`);
        if (!catResult.startsWith('cat: ')) {
          initialText = catResult;
          if (initialText.endsWith('\n')) {
            initialText = initialText.slice(0, -1);
          }
        }
      } catch (err) {
        console.error('Failed to load file for Vim:', err);
      }
    }
    setVimContent(initialText);
    setVimActive(true);
  };

  const handleVimSave = (content: string) => {
    const absolutePath = vimFileName.startsWith('/')
      ? vimFileName
      : (currentPwd === '/' ? '' : currentPwd) + '/' + vimFileName;

    if (wasmModule) {
      try {
        const writeFileFn = wasmModule.cwrap('write_file_raw', null, ['string', 'string']);
        writeFileFn(absolutePath, content);

        const serializeFn = wasmModule.cwrap('serialize_fs', 'string', []);
        const state = serializeFn();
        localStorage.setItem('zijh-fs-state', state);

        setVimContent(content);
      } catch (err) {
        console.error('Failed to save file from Vim:', err);
      }
    }
  };

  const handleVimClose = () => {
    setVimActive(false);
    setVimFileName('');
    setVimContent('');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

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

          const result = executeFn(trimmed);

          const nextPwd = getPwdFn();
          setCurrentPwd(nextPwd);

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
        openVimEditor,
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
      {vimActive && (
        <VimEditor
          filename={vimFileName}
          initialContent={vimContent}
          onSave={handleVimSave}
          onClose={handleVimClose}
        />
      )}
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
