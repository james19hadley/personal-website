import { useMemo } from 'react';

interface VimHighlighterProps {
  value: string;
}

/**
 * @component VimHighlighter
 * @description Lightweight, regex-based code syntax highlighter for the Vim editor.
 * Tokenizes and styles JavaScript/TypeScript keywords, strings, comments, numbers, and brackets.
 */
export const VimHighlighter = ({ value }: VimHighlighterProps) => {
  const tokens = useMemo(() => {
    // Capturing groups:
    // 1: Comments (// ... or /* ... */)
    // 2: Strings ("..." or '...' or `...`)
    // 3: Keywords (const, let, function, etc.)
    // 4: Numbers (decimal/int)
    // 5: Brackets ({ } ( ) [ ])
    const tokenRegex = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\b(?:const|let|var|function|return|class|import|export|if|else|for|while|try|catch|default|switch|case|break|continue|new|typeof|instanceof|yield|await|async|from|as)\b)|(\b\d+(?:\.\d+)?\b)|([{}[\]()])/g;

    const parts = value.split(tokenRegex);
    const result = [];

    for (let i = 0; i < parts.length; i += 6) {
      if (parts[i]) {
        result.push(<span key={`txt-${i}`}>{parts[i]}</span>);
      }
      if (i + 1 < parts.length) {
        if (parts[i + 1] !== undefined) {
          result.push(<span key={`cmt-${i}`} className="vh-comment">{parts[i + 1]}</span>);
        } else if (parts[i + 2] !== undefined) {
          result.push(<span key={`str-${i}`} className="vh-string">{parts[i + 2]}</span>);
        } else if (parts[i + 3] !== undefined) {
          result.push(<span key={`kw-${i}`} className="vh-keyword">{parts[i + 3]}</span>);
        } else if (parts[i + 4] !== undefined) {
          result.push(<span key={`num-${i}`} className="vh-number">{parts[i + 4]}</span>);
        } else if (parts[i + 5] !== undefined) {
          result.push(<span key={`brk-${i}`} className="vh-bracket">{parts[i + 5]}</span>);
        }
      }
    }
    return result;
  }, [value]);

  return (
    <pre className="vim-highlight-overlay" aria-hidden="true">
      <code>{tokens}</code>
    </pre>
  );
};
