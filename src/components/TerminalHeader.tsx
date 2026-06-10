import { Terminal as TerminalIcon, Sun, Moon, Layout, Maximize2, Minimize2 } from 'lucide-react';

interface TerminalHeaderProps {
  isMaximized: boolean;
  setIsMaximized: (val: boolean) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  onSwitchToGui: () => void;
}

/**
 * @component TerminalHeader
 * @description Header control bar for the interactive terminal. Houses window state toggles (maximize, theme switcher, GUI mode switch).
 */
export const TerminalHeader = ({
  isMaximized,
  setIsMaximized,
  theme,
  toggleTheme,
  onSwitchToGui
}: TerminalHeaderProps) => {
  return (
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
  );
};
