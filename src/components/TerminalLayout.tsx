import { useState, useRef, useEffect, type ReactNode } from 'react';
import { projects } from '../data/projects';
import { blogPosts } from '../data/blog';
import { Terminal as TerminalIcon, Sun, Moon, Layout } from 'lucide-react';
import './TerminalLayout.css';

interface TerminalLayoutProps {
  onSwitchToGui: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

interface LogEntry {
  command?: string;
  output: ReactNode;
}

export const TerminalLayout = ({ onSwitchToGui, theme, toggleTheme }: TerminalLayoutProps) => {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<LogEntry[]>([
    {
      output: (
        <div className="terminal-welcome">
          <p className="welcome-ascii">
{` ███████╗██╗██╗██╗  ██╗
 ╚══███╔╝██║██║██║  ██║
   ███╔╝ ██║██║███████║
  ███╔╝  ██║██║██╔══██║
 ███████╗██║██║██║  ██║
 ╚══════╝╚═╝╚═╝╚═╝  ╚═╝`}
          </p>
          <p className="welcome-text">Welcome to ZIJH Shell (v1.0.0)</p>
          <p className="welcome-sub">Type <span className="highlight">help</span> to view available commands. Click <span className="highlight">gui</span> to morph back to grid.</p>
        </div>
      )
    }
  ]);
  
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

  const handleCommandRun = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    const parts = trimmed.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    let output: ReactNode;

    switch (command) {
      case 'help':
      case '?':
        output = (
          <div className="cmd-output-help">
            <p className="section-title">Available Commands:</p>
            <ul className="help-list">
              <li><span className="cmd-name">about</span> - Print info about Ivan (ZIJH) & TUD studies</li>
              <li><span className="cmd-name">projects [--handmade | --vibe]</span> - List creations by type</li>
              <li><span className="cmd-name">blog [list | read &lt;id&gt;]</span> - Show log list or read a specific entry</li>
              <li><span className="cmd-name">gui</span> - Switch layout to Bento Grid GUI</li>
              <li><span className="cmd-name">theme</span> - Toggle light/dark UI themes</li>
              <li><span className="cmd-name">clear</span> - Reset terminal window history</li>
              <li><span className="cmd-name">secret</span> - Run custom system diagnostics</li>
            </ul>
          </div>
        );
        break;

      case 'about':
        output = (
          <div className="cmd-output-about">
            <p><span className="highlight font-bold">Ivan Zharov (ZIJH)</span> - Developer & CS student.</p>
            <p>🎓 Currently in the last semester of my Bachelor degree at <span className="highlight">TU Darmstadt (TUD)</span>.</p>
            <p>📡 Focus: Systems programming, compilers, modular web interfaces, and keyboard layout optimization.</p>
            <p>📧 Email: <a href="mailto:ging19freecss@gmail.com" className="term-link">ging19freecss@gmail.com</a></p>
            <p>🖥️ GitHub: <a href="https://github.com/james19hadley" target="_blank" rel="noopener noreferrer" className="term-link">github.com/james19hadley</a></p>
          </div>
        );
        break;

      case 'projects': {
        const showHandmade = args.includes('--handmade');
        const showVibe = args.includes('--vibe');
        
        let list = projects;
        if (showHandmade) list = projects.filter(p => p.type === 'handmade');
        if (showVibe) list = projects.filter(p => p.type === 'vibecoded');

        output = (
          <div className="cmd-output-projects">
            <p className="section-title">Project Catalog {showHandmade && '(Handmade Only)'} {showVibe && '(Vibe-coded Only)'}:</p>
            <div className="project-rows">
              {list.map(p => (
                <div key={p.id} className="project-row">
                  <div className="row-title-line">
                    <span className="row-title">{p.title}</span>
                    <span className={`row-badge ${p.type}`}>
                      {p.type === 'handmade' ? '🛠️ Handmade' : '⚡ Vibe-coded'}
                    </span>
                  </div>
                  <p className="row-desc">{p.description}</p>
                  <p className="row-tech">Tech: {p.techStack.join(', ')}</p>
                  {p.githubUrl && <p className="row-link">URL: <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="term-link">{p.githubUrl}</a></p>}
                </div>
              ))}
            </div>
          </div>
        );
        break;
      }

      case 'blog': {
        const subAction = args[0] ? args[0].toLowerCase() : 'list';
        
        if (subAction === 'list') {
          output = (
            <div className="cmd-output-blog-list">
              <p className="section-title">Blog Entries:</p>
              <div className="blog-rows">
                {blogPosts.map((post, idx) => (
                  <div key={post.id} className="blog-row">
                    <span className="row-index">[{idx + 1}]</span>
                    <span className="row-id highlight">blog read {post.id}</span>
                    <span className="row-title"> - {post.title} ({post.date})</span>
                  </div>
                ))}
              </div>
            </div>
          );
        } else if (subAction === 'read') {
          const postId = args[1];
          const post = blogPosts.find(p => p.id === postId);
          
          if (post) {
            output = (
              <div className="cmd-output-blog-content">
                <p className="article-title">{post.title}</p>
                <p className="article-meta">Date: {post.date} | Read time: {post.readTime} | Category: {post.category}</p>
                <div className="article-body">
                  {post.content.split('\n\n').map((para, i) => {
                    if (para.startsWith('### ')) {
                      return <p key={i} className="body-heading">{para.replace('### ', '')}</p>;
                    }
                    return <p key={i} className="body-paragraph">{para}</p>;
                  })}
                </div>
              </div>
            );
          } else {
            output = <p className="error-text">Error: Post "{postId}" not found. Type "blog list" to see valid IDs.</p>;
          }
        } else {
          output = <p className="error-text">Usage: blog [list | read &lt;id&gt;]</p>;
        }
        break;
      }

      case 'gui':
        // Transition back
        setTimeout(onSwitchToGui, 200);
        output = <p className="morph-text">Reconfiguring UI modules... switching to grid.</p>;
        break;

      case 'theme':
        toggleTheme();
        output = <p className="highlight">Toggling theme variables... Reload complete.</p>;
        break;

      case 'clear':
        setHistory([]);
        setInputVal('');
        return;

      case 'secret':
        output = (
          <div className="cmd-output-secret">
            <p className="cyber-diag">Running ZIJH diagnostic parameters...</p>
            <p className="cyan-glow">[OK] Mainframes connected to zijh.pages.dev proxy.</p>
            <p className="cyan-glow">[OK] Dvorak layout constraints initialized (a,o,e,u,i,d,h,t,n,s).</p>
            <p className="cyan-glow">[OK] Nen affinity detected: Specialization (Ging Freecss legacy).</p>
            <p className="matrix-ascii">
{`   _     _ _ _     
  (_)   (_| | |    
   _ _____| | |__  
  | (____ | |  _ \\ 
  | / ___ | | | | |
 _| \\_____|\\_|_| |_|
(__/               `}
            </p>
          </div>
        );
        break;

      default:
        output = <p className="error-text">Command not found: "{command}". Type "help" or "?" to show commands.</p>;
    }

    setHistory(prev => [...prev, { command: cmdStr, output }]);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommandRun(inputVal);
    }
  };

  return (
    <div className="terminal-container fade-in" onClick={focusInput}>
      {/* HEADER CONTROLS */}
      <header className="terminal-header-bar">
        <div className="header-meta">
          <TerminalIcon size={14} className="term-icon" />
          <span>james19hadley@zijh-shell: ~</span>
        </div>
        <div className="header-controls">
          <button onClick={toggleTheme} className="term-ctrl-btn" title="Toggle Theme">
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button onClick={onSwitchToGui} className="term-ctrl-btn" title="Switch to Bento GUI">
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
                <span className="prompt-indicator">zijh ~ $</span>
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
        <span className="prompt-indicator">zijh ~ $</span>
        <input
          ref={inputRef}
          type="text"
          className="console-input"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
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
