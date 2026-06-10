import { useState, useEffect, useRef } from 'react';
import './VimEditor.css';

interface VimEditorProps {
  filename: string;
  initialContent: string;
  onSave: (content: string) => void;
  onClose: () => void;
}

type VimMode = 'NORMAL' | 'INSERT' | 'COMMAND';

export const VimEditor = ({ filename, initialContent, onSave, onClose }: VimEditorProps) => {
  const [content, setContent] = useState(initialContent);
  const [mode, setMode] = useState<VimMode>('NORMAL');
  const [cursorLine, setCursorLine] = useState(1);
  const [cursorCol, setCursorCol] = useState(1);
  const [commandText, setCommandText] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);

  // Sync state modifications
  useEffect(() => {
    setHasUnsavedChanges(content !== initialContent);
  }, [content, initialContent]);

  // Set focus on load
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(0, 0);
    }
    setStatusMessage(`"${filename}" ${initialContent ? '' : '[New File]'}`);
  }, [filename, initialContent]);

  // Focus command input if mode changes to COMMAND
  useEffect(() => {
    if (mode === 'COMMAND' && commandInputRef.current) {
      commandInputRef.current.focus();
      setCommandText('');
    } else if (mode === 'NORMAL' && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [mode]);

  // Helper to extract line and column coordinates
  const getCursorPosition = (text: string, index: number) => {
    const before = text.slice(0, index);
    const lines = before.split('\n');
    const line = lines.length;
    const col = lines[line - 1].length + 1;
    return { line, col };
  };

  const getIndexFromPosition = (text: string, line0: number, col0: number) => {
    const lines = text.split('\n');
    let line = Math.max(0, Math.min(line0, lines.length - 1));
    let col = Math.max(0, Math.min(col0, lines[line].length));
    
    let index = 0;
    for (let i = 0; i < line; i++) {
      index += lines[i].length + 1; // +1 for newline character
    }
    return index + col;
  };

  const updateCursorInfo = (index: number) => {
    const { line, col } = getCursorPosition(content, index);
    setCursorLine(line);
    setCursorCol(col);
  };

  const handleTextareaSelect = (e: any) => {
    updateCursorInfo(e.target.selectionStart);
  };

  const moveCursor = (dir: 'h' | 'j' | 'k' | 'l') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const currentIdx = textarea.selectionStart;
    const { line, col } = getCursorPosition(content, currentIdx);
    const lines = content.split('\n');

    let targetIdx = currentIdx;
    // Vim coordinates are 1-based, we subtract 1 for array indexing
    const lineIdx = line - 1;
    const colIdx = col - 1;

    if (dir === 'h') {
      targetIdx = Math.max(0, currentIdx - 1);
    } else if (dir === 'l') {
      targetIdx = Math.min(content.length, currentIdx + 1);
    } else if (dir === 'k') {
      if (lineIdx > 0) {
        targetIdx = getIndexFromPosition(content, lineIdx - 1, colIdx);
      }
    } else if (dir === 'j') {
      if (lineIdx < lines.length - 1) {
        targetIdx = getIndexFromPosition(content, lineIdx + 1, colIdx);
      }
    }

    textarea.focus();
    // setTimeout to ensure focus is resolved before selection is set
    setTimeout(() => {
      textarea.setSelectionRange(targetIdx, targetIdx);
      updateCursorInfo(targetIdx);
    }, 0);
  };

  const handleGlobalKeyDown = (e: any) => {
    if (mode === 'NORMAL') {
      // Prevent standard typing key inputs in Normal mode
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
      }

      if (e.key === ':') {
        e.preventDefault();
        setMode('COMMAND');
        return;
      }

      if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        setMode('INSERT');
        return;
      }

      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setMode('INSERT');
        if (textareaRef.current) {
          const idx = textareaRef.current.selectionStart;
          textareaRef.current.setSelectionRange(idx + 1, idx + 1);
        }
        return;
      }

      // Cursor movement keys
      if (e.key === 'h' || e.key === 'ArrowLeft') {
        e.preventDefault();
        moveCursor('h');
      } else if (e.key === 'l' || e.key === 'ArrowRight') {
        e.preventDefault();
        moveCursor('l');
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        moveCursor('k');
      } else if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        moveCursor('j');
      } else if (e.key === 'x') {
        // Delete character under cursor
        e.preventDefault();
        if (textareaRef.current) {
          const idx = textareaRef.current.selectionStart;
          if (idx < content.length) {
            const nextContent = content.slice(0, idx) + content.slice(idx + 1);
            setContent(nextContent);
            setTimeout(() => {
              textareaRef.current?.setSelectionRange(idx, idx);
            }, 0);
          }
        }
      }
    } else if (mode === 'INSERT') {
      if (e.key === 'Escape') {
        e.preventDefault();
        setMode('NORMAL');
        setErrorMessage('');
      }
    }
  };

  const handleCommandExecute = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = commandText.trim();
      setCommandText('');
      setMode('NORMAL');
      setErrorMessage('');

      if (cmd === 'w') {
        onSave(content);
        setHasUnsavedChanges(false);
        setStatusMessage(`"${filename}" written successfully`);
      } else if (cmd === 'q') {
        if (hasUnsavedChanges) {
          setErrorMessage('No write since last change (add ! to override)');
        } else {
          onClose();
        }
      } else if (cmd === 'wq') {
        onSave(content);
        onClose();
      } else if (cmd === 'q!') {
        onClose();
      } else {
        setErrorMessage(`Not an editor command: ${cmd}`);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setMode('NORMAL');
    }
  };

  const lines = content.split('\n');

  return (
    <div className="vim-editor-container" onKeyDown={handleGlobalKeyDown} onClick={() => {
      if (mode === 'NORMAL' || mode === 'INSERT') {
        textareaRef.current?.focus();
      }
    }}>
      {/* Gutter Line Numbers */}
      <div className="vim-workspace">
        <div className="vim-gutter">
          {lines.map((_, i) => (
            <div key={i} className={`gutter-num ${i + 1 === cursorLine ? 'active' : ''}`}>
              {i + 1}
            </div>
          ))}
        </div>

        {/* Edit Textarea Buffer */}
        <textarea
          ref={textareaRef}
          className={`vim-textarea ${mode === 'NORMAL' ? 'mode-normal' : ''}`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onSelect={handleTextareaSelect}
          readOnly={mode === 'NORMAL' || mode === 'COMMAND'}
          spellCheck="false"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>

      {/* Status Bar */}
      <div className="vim-status-line">
        <div className="status-left">
          <span className="vim-badge">VIM</span>
          <span className="file-info">
            {filename} {hasUnsavedChanges ? '[+]' : ''}
          </span>
        </div>
        <div className="status-mode">
          {mode === 'NORMAL' && '-- NORMAL --'}
          {mode === 'INSERT' && '-- INSERT --'}
        </div>
        <div className="status-right">
          {cursorLine}:{cursorCol}
        </div>
      </div>

      {/* Command Line Input */}
      <div className="vim-command-line">
        {mode === 'COMMAND' ? (
          <div className="command-input-row">
            <span className="command-prefix">:</span>
            <input
              ref={commandInputRef}
              type="text"
              className="command-input"
              value={commandText}
              onChange={(e) => setCommandText(e.target.value)}
              onKeyDown={handleCommandExecute}
              maxLength={10}
            />
          </div>
        ) : errorMessage ? (
          <span className="error-msg">{errorMessage}</span>
        ) : (
          <span className="status-msg">{statusMessage}</span>
        )}
      </div>
    </div>
  );
};
