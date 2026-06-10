interface TerminalShortcutsProps {
  onShortcutClick: (cmd: string) => void;
}

/**
 * @component TerminalShortcuts
 * @description Button shortcuts panel rendered at the bottom of the terminal screen, particularly useful for mobile keyboards.
 */
export const TerminalShortcuts = ({ onShortcutClick }: TerminalShortcutsProps) => {
  return (
    <div className="terminal-shortcuts" onClick={e => e.stopPropagation()}>
      <span className="shortcuts-label">Shortcuts:</span>
      <div className="shortcut-buttons">
        <button onClick={() => onShortcutClick('help')}>help</button>
        <button onClick={() => onShortcutClick('about')}>about</button>
        <button onClick={() => onShortcutClick('projects')}>projects</button>
        <button onClick={() => onShortcutClick('blog list')}>blog</button>
        <button onClick={() => onShortcutClick('secret')}>secret</button>
        <button onClick={() => onShortcutClick('gui')}>gui</button>
      </div>
    </div>
  );
};
