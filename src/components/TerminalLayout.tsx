import { useState, useRef, useEffect, type ReactNode } from 'react';
import { VimEditor } from './VimEditor';
import { MatrixRain } from './MatrixRain';
import { TerminalHeader } from './TerminalHeader';
import { TerminalShortcuts } from './TerminalShortcuts';
import { commandsRegistry, type CommandContext, type TerminalLayoutProps } from './terminalCommands';
import { renderColoredLs, getTabCompletion } from './terminalHelpers';
import './TerminalLayout.css';

const TERMINAL_COLORS_MAP: Record<string, { text: string; accent: string }> = { green: { text: '#22c55e', accent: '#4ade80' }, amber: { text: '#fbbf24', accent: '#f59e0b' }, yellow: { text: '#fbbf24', accent: '#f59e0b' }, cyan: { text: '#22d3ee', accent: '#06b6d4' }, violet: { text: '#c084fc', accent: '#8b5cf6' }, purple: { text: '#c084fc', accent: '#8b5cf6' }, red: { text: '#ef4444', accent: '#f87171' } };

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
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [inputDraft, setInputDraft] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('zijh-terminal-history') || '[]'); } catch { return []; }
  });

  const consoleEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [history]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Keyboard shortcut to toggle fullscreen (Alt + Enter or F11)
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      // Don't intercept when sub-overlays (Vim/cmatrix) are active
      if (vimActive || cmatrixActive) return;
      
      if ((e.key === 'Enter' && e.altKey) || e.key === 'F11') {
        e.preventDefault();
        setIsMaximized(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [vimActive, cmatrixActive]);

  const openVimEditor = (filename: string) => {
    setVimFileName(filename);
    const path = filename.startsWith('/') ? filename : `${currentPwd === '/' ? '' : currentPwd}/${filename}`;
    let text = '';
    if (wasmModule) {
      try {
        const res = wasmModule.cwrap('execute_command', 'string', ['string'])(`cat ${path}`);
        if (!res.startsWith('cat: ')) text = res.endsWith('\n') ? res.slice(0, -1) : res;
      } catch (e) { console.error('Failed to load file for Vim:', e); }
    }
    setVimContent(text);
    setVimActive(true);
  };

  const handleVimSave = (content: string) => {
    const path = vimFileName.startsWith('/') ? vimFileName : `${currentPwd === '/' ? '' : currentPwd}/${vimFileName}`;
    if (wasmModule) {
      try {
        wasmModule.cwrap('write_file_raw', null, ['string', 'string'])(path, content);
        localStorage.setItem('zijh-fs-state', wasmModule.cwrap('serialize_fs', 'string', [])());
        setVimContent(content);
      } catch (e) { console.error('Failed to save file from Vim:', e); }
    }
  };

  const handleVimClose = () => { setVimActive(false); setVimFileName(''); setVimContent(''); setTimeout(() => inputRef.current?.focus(), 50); };

  const cc = TERMINAL_COLORS_MAP[termColor];
  const termStyles = cc ? { '--terminal-text': cc.text, '--terminal-accent': cc.accent, '--terminal-input': cc.text } as React.CSSProperties : {};

  const handleInputChange = (e: any) => { setInputVal(e.target.value); setCursorIndex(e.target.selectionStart || 0); };
  const updateCursor = (e: any) => setCursorIndex(e.target.selectionStart || 0);

  const handleCommandRun = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    setCommandHistory(prev => {
      const next = [...prev, cmdStr];
      try { localStorage.setItem('zijh-terminal-history', JSON.stringify(next)); } catch {}
      return next;
    });

    const parts = trimmed.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);
    let output: ReactNode;
    const wasmCommands = ['pwd', 'cd', 'mkdir', 'touch', 'echo', 'cat', 'ln'];

    if (command === 'ls') {
      output = renderColoredLs(args.join(' '), wasmModule, currentPwd);
    } else if (wasmCommands.includes(command)) {
      if (!wasmModule) {
        output = <p className="error-text">WebAssembly tmpfs module is still initializing. Please wait a moment...</p>;
      } else {
        try {
          const result = wasmModule.cwrap('execute_command', 'string', ['string'])(trimmed);
          setCurrentPwd(wasmModule.cwrap('get_pwd', 'string', [])());
          try {
            localStorage.setItem('zijh-fs-state', wasmModule.cwrap('serialize_fs', 'string', [])());
          } catch {}
          output = result ? <pre className="wasm-output">{result}</pre> : null;
        } catch (err: any) {
          output = <p className="error-text">Wasm error: {err.message || String(err)}</p>;
        }
      }
    } else if (commandsRegistry[command]) {
      const ctx: CommandContext = {
        rawCommand: trimmed, args, wasmModule, currentPwd, setCurrentPwd, setHistory, toggleTheme,
        onSwitchToGui, onNavigateToGameBoy, clearHistory: () => setHistory([]), setTerminalColor,
        startCMatrix: () => setCmatrixActive(true), openVimEditor, toggleFullscreen: () => setIsMaximized(prev => !prev),
        runCommand: handleCommandRun,
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
    setHistoryIndex(-1);
    setInputDraft('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') return handleCommandRun(inputVal);
    if (e.key === 'Tab') {
      e.preventDefault();
      const res = getTabCompletion(inputVal, currentPwd, wasmModule);
      if (res.newInputVal !== undefined) {
        setInputVal(res.newInputVal);
        setTimeout(() => {
          inputRef.current?.setSelectionRange(res.newInputVal!.length, res.newInputVal!.length);
          setCursorIndex(res.newInputVal!.length);
        }, 0);
      } else if (res.historyOutput) {
        setHistory(prev => [...prev, { command: inputVal, pwd: currentPwd, output: res.historyOutput }]);
      }
      return;
    }
    const cmds = commandHistory;
    if (cmds.length === 0 && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) return;

    const setCursor = (val: string) => {
      setInputVal(val);
      setTimeout(() => {
        inputRef.current?.setSelectionRange(val.length, val.length);
        setCursorIndex(val.length);
      }, 0);
    };

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const nextIdx = historyIndex === -1 ? cmds.length - 1 : Math.max(0, historyIndex - 1);
      if (historyIndex === -1) setInputDraft(inputVal);
      setHistoryIndex(nextIdx);
      setCursor(cmds[nextIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx < cmds.length) {
        setHistoryIndex(nextIdx);
        setCursor(cmds[nextIdx]);
      } else {
        setHistoryIndex(-1);
        setCursor(inputDraft);
      }
    } else {
      setTimeout(() => setCursorIndex(inputRef.current?.selectionStart || 0), 0);
    }
  };

  return (
    <div 
      className={`terminal-container fade-in ${isMaximized ? 'maximized' : ''}`} 
      onClick={() => inputRef.current?.focus()}
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
      
      <TerminalHeader
        isMaximized={isMaximized}
        setIsMaximized={setIsMaximized}
        theme={theme}
        toggleTheme={toggleTheme}
        onSwitchToGui={onSwitchToGui}
      />

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
            onKeyUp={updateCursor}
            onClick={updateCursor}
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

      <TerminalShortcuts onShortcutClick={handleCommandRun} />
    </div>
  );
};
