import { type ReactNode } from 'react';

/**
 * Parses inline markdown elements: bold (**bold**), links ([text](url)), and inline code (`code`).
 */
const parseInlineMarkdown = (text: string): ReactNode[] => {
  // Groups:
  // 1, 2: **bold**
  // 3, 4: `code`
  // 5, 6, 7: ![alt](url) (image)
  // 8, 9, 10: [label](url) (link)
  const regex = /(\*\*([^*]+)\*\*)|(`([^`]+)`)|(!\[([^\]]*)\]\(([^)]+)\))|(\[([^\]]+)\]\(([^)]+)\))/g;
  const parts = text.split(regex);
  const result: ReactNode[] = [];

  for (let i = 0; i < parts.length; i += 11) {
    if (parts[i]) {
      result.push(parts[i]);
    }
    if (i + 1 < parts.length) {
      if (parts[i + 2] !== undefined) {
        result.push(<strong key={i}>{parts[i + 2]}</strong>);
      } else if (parts[i + 4] !== undefined) {
        result.push(<code key={i} className="vh-number" style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 5px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.85em' }}>{parts[i + 4]}</code>);
      } else if (parts[i + 6] !== undefined && parts[i + 7] !== undefined) {
        result.push(
          <img 
            key={i} 
            src={parts[i + 7]} 
            alt={parts[i + 6]} 
            className="blog-image" 
            style={{ 
              maxWidth: '100%', 
              borderRadius: '8px', 
              margin: '16px auto', 
              display: 'block', 
              boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.08)'
            }} 
          />
        );
      } else if (parts[i + 9] !== undefined && parts[i + 10] !== undefined) {
        result.push(
          <a key={i} href={parts[i + 10]} target="_blank" rel="noopener noreferrer" className="term-link">
            {parts[i + 9]}
          </a>
        );
      }
    }
  }
  return result;
};

/**
 * Parses markdown block elements (Headings #, ##, ###, Lists *, -, Paragraphs) and renders them as JSX.
 */
export const renderMarkdown = (content: string): ReactNode => {
  const blocks = content.split('\n\n');
  return (
    <>
      {blocks.map((block, index) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith('### ')) {
          return <h3 key={index} className="vh-keyword" style={{ margin: '14px 0 6px 0', fontSize: '1.1rem' }}>{parseInlineMarkdown(trimmed.slice(4))}</h3>;
        }
        if (trimmed.startsWith('## ')) {
          return <h2 key={index} className="vh-keyword" style={{ margin: '18px 0 8px 0', fontSize: '1.3rem' }}>{parseInlineMarkdown(trimmed.slice(3))}</h2>;
        }
        if (trimmed.startsWith('# ')) {
          return <h1 key={index} className="vh-keyword" style={{ margin: '22px 0 10px 0', fontSize: '1.6rem' }}>{parseInlineMarkdown(trimmed.slice(2))}</h1>;
        }
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('*   ')) {
          const lines = trimmed.split('\n');
          return (
            <ul key={index} style={{ paddingLeft: '20px', margin: '8px 0', listStyleType: 'square' }}>
              {lines.map((line, i) => {
                const cleanLine = line.replace(/^(\*\s*|-\s*|\*\s{3,})/, '');
                return <li key={i} style={{ marginBottom: '4px' }}>{parseInlineMarkdown(cleanLine)}</li>;
              })}
            </ul>
          );
        }
        return <p key={index} style={{ margin: '8px 0', lineHeight: '1.6' }}>{parseInlineMarkdown(trimmed)}</p>;
      })}
    </>
  );
};
