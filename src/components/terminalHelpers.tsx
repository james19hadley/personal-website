import { type ReactNode } from 'react';
import { commandsRegistry } from './terminalCommands';

/**
 * Renders colored lists of files/folders mimicking real terminal 'ls' styling.
 */
export const renderColoredLs = (targetPath: string, wasmModule: any, currentPwd: string): ReactNode => {
  if (!wasmModule) return <p className="error-text">Wasm not loaded</p>;

  let resolvedPath = targetPath.trim();
  if (!resolvedPath) resolvedPath = currentPwd;
  if (!resolvedPath.startsWith('/')) {
    resolvedPath = (currentPwd === '/' ? '' : currentPwd) + '/' + resolvedPath;
  }
  resolvedPath = resolvedPath.replace(/\/+/g, '/');
  if (resolvedPath.endsWith('/') && resolvedPath !== '/') {
    resolvedPath = resolvedPath.slice(0, -1);
  }

  try {
    const serializeFn = wasmModule.cwrap('serialize_fs', 'string', []);
    const stateStr = serializeFn();
    const items = JSON.parse(stateStr);
    
    const targetDirExists = resolvedPath === '/' || items.some((item: any) => item.type === 'D' && item.path === resolvedPath);
    if (!targetDirExists) {
      const isFile = items.some((item: any) => item.type === 'F' && item.path === resolvedPath);
      if (isFile) {
        const parts = resolvedPath.split('/');
        return <span className="ls-file">📄 {parts[parts.length - 1]}</span>;
      }
      return <p className="error-text">ls: cannot access '{targetPath}': No such file or directory</p>;
    }

    const children = items.filter((item: any) => {
      const parentPath = item.path.substring(0, item.path.lastIndexOf('/')) || '/';
      return parentPath === resolvedPath;
    });

    if (children.length === 0) return null;

    children.sort((a: any, b: any) => {
      if (a.type !== b.type) return a.type === 'D' ? -1 : 1;
      return a.path.localeCompare(b.path);
    });

    return (
      <div className="ls-output-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontFamily: 'var(--font-mono)' }}>
        {children.map((child: any) => {
          const name = child.path.substring(child.path.lastIndexOf('/') + 1);
          const isDir = child.type === 'D';
          return (
            <span 
              key={child.path} 
              className={isDir ? 'ls-dir highlight' : 'ls-file'}
              style={{ 
                color: isDir ? 'var(--accent-cyan)' : 'inherit',
                fontWeight: isDir ? 'bold' : 'normal',
                textShadow: isDir ? '0 0 8px rgba(34, 211, 238, 0.25)' : 'none'
              }}
            >
              {isDir ? `${name}/` : name}
            </span>
          );
        })}
      </div>
    );
  } catch (err: any) {
    return <p className="error-text">ls error: {err.message || String(err)}</p>;
  }
};

export interface TabCompletionResult {
  newInputVal?: string;
  historyOutput?: ReactNode;
}

/**
 * Computes autocomplete results for commands, folders, or files.
 */
export const getTabCompletion = (
  inputVal: string, 
  currentPwd: string, 
  wasmModule: any
): TabCompletionResult => {
  const trimmed = inputVal.trimStart();
  const parts = trimmed.split(' ');
  
  const commands = Object.keys(commandsRegistry);
  const wasmCommands = ['pwd', 'cd', 'mkdir', 'touch', 'echo', 'cat', 'ln'];
  const allCommands = [...commands, 'ls', ...wasmCommands];

  if (parts.length === 1 && !inputVal.includes(' ')) {
    const prefix = parts[0].toLowerCase();
    const matches = allCommands.filter(c => c.startsWith(prefix));
    
    if (matches.length === 1) {
      return { newInputVal: matches[0] + ' ' };
    } else if (matches.length > 1) {
      return {
        historyOutput: (
          <div className="ls-output-grid" style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {matches.map(m => <span key={m}>{m}</span>)}
          </div>
        )
      };
    }
  } else if (parts.length > 1 && wasmModule) {
    const lastPart = parts[parts.length - 1];
    let searchDir = currentPwd;
    let filePrefix = lastPart;
    
    if (lastPart.includes('/')) {
      const lastSlash = lastPart.lastIndexOf('/');
      const dirPart = lastPart.substring(0, lastSlash);
      filePrefix = lastPart.substring(lastSlash + 1);
      
      if (dirPart.startsWith('/')) {
        searchDir = dirPart;
      } else {
        searchDir = (currentPwd === '/' ? '' : currentPwd) + '/' + dirPart;
      }
    }
    
    searchDir = searchDir.replace(/\/+/g, '/');
    if (searchDir.endsWith('/') && searchDir !== '/') searchDir = searchDir.slice(0, -1);
    
    try {
      const serializeFn = wasmModule.cwrap('serialize_fs', 'string', []);
      const stateStr = serializeFn();
      const items = JSON.parse(stateStr);
      
      const children = items.filter((item: any) => {
        const parentPath = item.path.substring(0, item.path.lastIndexOf('/')) || '/';
        return parentPath === searchDir;
      });
      
      const matches = children.filter((child: any) => {
        const name = child.path.substring(child.path.lastIndexOf('/') + 1);
        return name.startsWith(filePrefix);
      });
      
      if (matches.length === 1) {
        const child = matches[0];
        const name = child.path.substring(child.path.lastIndexOf('/') + 1);
        const isDir = child.type === 'D';
        
        const completedPart = lastPart.includes('/')
          ? lastPart.substring(0, lastPart.lastIndexOf('/') + 1) + name
          : name;
        
        parts[parts.length - 1] = completedPart + (isDir ? '/' : ' ');
        return { newInputVal: parts.join(' ') };
      } else if (matches.length > 1) {
        return {
          historyOutput: (
            <div className="ls-output-grid" style={{ display: 'flex', gap: '20px', fontFamily: 'var(--font-mono)' }}>
              {matches.map((child: any) => {
                const name = child.path.substring(child.path.lastIndexOf('/') + 1);
                const isDir = child.type === 'D';
                return (
                  <span 
                    key={child.path}
                    style={{ color: isDir ? 'var(--accent-cyan)' : 'inherit', fontWeight: isDir ? 'bold' : 'normal' }}
                  >
                    {name}{isDir ? '/' : ''}
                  </span>
                );
              })}
            </div>
          )
        };
      }
    } catch (err) {
      console.error('Tab completion processing error:', err);
    }
  }
  return {};
};

/**
 * Computes the Levenshtein edit distance between two strings.
 */
const getLevenshteinDistance = (a: string, b: string): number => {
  const tmp: number[][] = [];
  for (let i = 0; i <= a.length; i++) tmp[i] = [i];
  for (let j = 0; j <= b.length; j++) tmp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1,
        tmp[i][j - 1] + 1,
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return tmp[a.length][b.length];
};

/**
 * Finds the closest matching terminal command if a user makes a typo.
 */
export const getClosestCommand = (command: string): string | null => {
  const commands = Object.keys(commandsRegistry);
  const wasmCommands = ['pwd', 'cd', 'mkdir', 'touch', 'echo', 'cat', 'ln', 'ls'];
  const allCommands = [...commands, ...wasmCommands];
  
  let bestMatch: string | null = null;
  let minDistance = 999;
  for (const c of allCommands) {
    const dist = getLevenshteinDistance(command, c);
    if (dist < minDistance) {
      minDistance = dist;
      bestMatch = c;
    }
  }
  return minDistance <= 2 ? bestMatch : null;
};
