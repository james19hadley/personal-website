import { type ReactNode } from 'react';

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
  toggleFullscreen?: () => void;
  runCommand?: (cmd: string) => void;
}

export interface Command {
  name: string;
  description: string;
  execute: (ctx: CommandContext) => ReactNode | void;
}

export interface TerminalLayoutProps {
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

