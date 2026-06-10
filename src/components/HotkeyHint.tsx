/**
 * @component HotkeyHint
 * @description Floating question-mark icon in the bottom-right corner. On hover, reveals a detailed glassmorphic cheat sheet panel of all site-wide keyboard shortcuts.
 */
export const HotkeyHint = () => {
  return (
    <>
      <div className="hotkey-hint-container">
        <button className="hotkey-trigger" aria-label="Keyboard Shortcuts">
          <span className="question-mark">❔</span>
          <span className="trigger-text">Shortcuts</span>
        </button>
        <div className="hotkey-dropdown">
          <p className="dropdown-title">🎹 Keyboard Shortcuts</p>
          
          <div className="shortcut-section">
            <p className="section-name">Global Navigation</p>
            <div className="shortcut-item"><code>Alt + H</code><span>Go to Home</span></div>
            <div className="shortcut-item"><code>Alt + T</code><span>Open Terminal</span></div>
            <div className="shortcut-item"><code>Alt + G</code><span>Open GameBoy</span></div>
            <div className="shortcut-item"><code>Alt + P</code><span>Open Projects</span></div>
            <div className="shortcut-item"><code>Alt + B</code><span>Open Blog</span></div>
            <div className="shortcut-item"><code>Alt + S</code><span>Open Space</span></div>
            <div className="shortcut-item"><code>Ctrl + `</code><span>Toggle Terminal</span></div>
          </div>

          <div className="shortcut-section">
            <p className="section-name">Vim-style GUI Navigation</p>
            <div className="shortcut-item"><code>J</code> / <code>L</code><span>Next item / Link</span></div>
            <div className="shortcut-item"><code>K</code> / <code>H</code><span>Previous item / Link</span></div>
            <div className="shortcut-item"><code>Enter</code><span>Confirm / Click</span></div>
            <div className="shortcut-item"><code>Esc</code> / <code>Q</code><span>Go back / Home</span></div>
          </div>

          <div className="shortcut-section">
            <p className="section-name">Terminal Shell</p>
            <div className="shortcut-item"><code>Alt + Enter</code> / <code>F11</code><span>Toggle Fullscreen</span></div>
            <div className="shortcut-item"><code>↑</code> / <code>↓</code><span>Command History</span></div>
            <div className="shortcut-item"><code>Esc</code> / <code>exit</code><span>Close Terminal</span></div>
          </div>

          <div className="shortcut-section" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>
            <p className="section-name">GameBoy Console</p>
            <div className="shortcut-item"><code>Arrow Keys</code><span>D-Pad Direction</span></div>
            <div className="shortcut-item"><code>Z</code> / <code>X</code><span>A / B Buttons</span></div>
            <div className="shortcut-item"><code>Enter</code> / <code>Shift</code><span>Start / Select</span></div>
          </div>
        </div>
      </div>

      <style>{`
        .hotkey-hint-container {
          position: fixed;
          bottom: 16px;
          right: 16px;
          z-index: 1000;
          font-family: var(--font-sans);
        }
        .hotkey-trigger {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 6px 12px;
          border-radius: 20px;
          cursor: pointer;
          color: var(--text-muted);
          font-family: inherit;
          font-size: 0.75rem;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          outline: none;
        }
        .hotkey-trigger:hover,
        .hotkey-trigger.vim-focused {
          color: var(--accent-cyan);
          border-color: var(--accent-cyan);
          background: rgba(0, 0, 0, 0.8);
          box-shadow: 0 4px 16px rgba(34, 211, 238, 0.15);
        }
        .hotkey-dropdown {
          position: absolute;
          bottom: 40px;
          right: 0;
          width: 280px;
          background: rgba(10, 10, 10, 0.95);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 14px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(10px);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }
        .hotkey-hint-container:hover .hotkey-dropdown,
        .hotkey-hint-container:focus-within .hotkey-dropdown {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        .dropdown-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 6px;
        }
        .shortcut-section {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 8px;
          margin-bottom: 8px;
        }
        .section-name {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--accent-cyan);
          font-weight: 700;
          margin-bottom: 6px;
        }
        .shortcut-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.7rem;
          margin-bottom: 4px;
          color: var(--text-muted);
        }
        .shortcut-item code {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 1px 5px;
          border-radius: 4px;
          color: #e2e8f0;
          font-family: var(--font-mono);
          font-size: 0.65rem;
        }
        :root[data-theme='light'] .hotkey-trigger {
          background: rgba(255, 255, 255, 0.85);
          border-color: rgba(0, 0, 0, 0.08);
          color: var(--text-secondary);
        }
        :root[data-theme='light'] .hotkey-trigger:hover,
        :root[data-theme='light'] .hotkey-trigger.vim-focused {
          background: #ffffff;
          color: var(--accent-cyan);
          border-color: var(--accent-cyan);
        }
        :root[data-theme='light'] .hotkey-dropdown {
          background: rgba(255, 255, 255, 0.98);
          border-color: rgba(0, 0, 0, 0.08);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        :root[data-theme='light'] .dropdown-title {
          color: var(--text-primary);
          border-bottom-color: rgba(0, 0, 0, 0.08);
        }
        :root[data-theme='light'] .shortcut-section {
          border-bottom-color: rgba(0, 0, 0, 0.05);
        }
        :root[data-theme='light'] .shortcut-item {
          color: var(--text-secondary);
        }
        :root[data-theme='light'] .shortcut-item code {
          background: rgba(0, 0, 0, 0.04);
          border-color: rgba(0, 0, 0, 0.04);
          color: var(--text-primary);
        }
      `}</style>
    </>
  );
};
