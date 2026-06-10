import { useState } from 'react';
import { Mail, Terminal, Sun, Moon, FolderGit, BookOpen, Check } from 'lucide-react';
import './HomeLayout.css';

interface HomeLayoutProps {
  onNavigate: (view: 'projects' | 'blog' | 'terminal') => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const HomeLayout = ({ onNavigate, theme, toggleTheme }: HomeLayoutProps) => {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText('ging19freecss@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="home-container fade-in">
      <header className="home-header">
        <button 
          className="theme-btn" 
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </header>

      <main className="home-main">
        <div className="home-logo-wrapper">
          <h1 className="home-logo">zijh</h1>
          <div className="status-badge">
            <span className="pulse-dot"></span>
            <span>online // building</span>
          </div>
        </div>

        <p className="home-subtitle">
          student @ tu darmstadt // developer
        </p>

        <nav className="home-nav">
          <button onClick={() => onNavigate('projects')} className="nav-link-btn">
            <FolderGit size={14} />
            <span>projects</span>
          </button>
          <button onClick={() => onNavigate('blog')} className="nav-link-btn">
            <BookOpen size={14} />
            <span>blog</span>
          </button>
          <button onClick={() => onNavigate('terminal')} className="nav-link-btn">
            <Terminal size={14} />
            <span>terminal</span>
          </button>
        </nav>
      </main>

      <footer className="home-footer">
        <a 
          href="https://github.com/james19hadley" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="footer-link"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
          </svg>
          <span>github</span>
        </a>
        <button onClick={handleCopyEmail} className="footer-link email-btn">
          {copiedEmail ? <Check size={14} /> : <Mail size={14} />}
          <span>{copiedEmail ? 'copied!' : 'email'}</span>
        </button>
      </footer>
    </div>
  );
};
