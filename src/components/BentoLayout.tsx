import { useState } from 'react';
import { projects } from '../data/projects';
import { blogPosts, type BlogPost } from '../data/blog';
import { 
  Mail, 
  ExternalLink, 
  Cpu, 
  BookOpen, 
  Sparkles, 
  Hammer, 
  Check, 
  Copy, 
  Clock, 
  ArrowLeft,
  Terminal,
  Sun,
  Moon
} from 'lucide-react';
import './BentoLayout.css';

interface BentoLayoutProps {
  onSwitchToCli: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const BentoLayout = ({ onSwitchToCli, theme, toggleTheme }: BentoLayoutProps) => {
  const [projectFilter, setProjectFilter] = useState<'all' | 'handmade' | 'vibecoded'>('all');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const filteredProjects = projects.filter(p => {
    if (projectFilter === 'handmade') return p.type === 'handmade';
    if (projectFilter === 'vibecoded') return p.type === 'vibecoded';
    return true;
  });

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('ging19freecss@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="bento-container fade-in">
      {/* HEADER SECTION */}
      <header className="bento-header">
        <div className="header-logo">ZIJH</div>
        <div className="header-actions">
          <button 
            className="header-btn" 
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button 
            className="header-btn mode-switch-btn" 
            onClick={onSwitchToCli}
            title="Switch to CLI Terminal Mode"
          >
            <Terminal size={18} />
            <span>CLI Mode</span>
          </button>
        </div>
      </header>

      {/* BENTO GRID */}
      <main className="bento-grid">
        
        {/* BIO CARD */}
        <section className="bento-card bio-card glassmorphism">
          <div className="status-indicator">
            <span className="pulse-dot"></span>
            <span>📡 Studying at TU Darmstadt</span>
          </div>
          <h1>Ivan Zharov</h1>
          <p className="bio-title">Developer // Student // Creator</p>
          <p className="bio-desc">
            Currently finishing my final semester in Computer Science at **TU Darmstadt (TUD)**. 
            I build systems, play with compiler construction, and explore layouts.
          </p>
        </section>

        {/* CONTROLS CARD / ALTER EGOS */}
        <section className="bento-card ego-card glassmorphism">
          <h3>Personas & Handles</h3>
          <ul className="ego-list">
            <li>
              <span className="ego-label">GitHub:</span>
              <a href="https://github.com/james19hadley" target="_blank" rel="noopener noreferrer" className="ego-value">
                james19hadley <ExternalLink size={12} />
              </a>
            </li>
            <li>
              <span className="ego-label">CLI:</span>
              <span className="ego-value highlight">zijh</span>
            </li>
            <li>
              <span className="ego-label">Sys/OS:</span>
              <span className="ego-value font-mono">ging</span>
            </li>
            <li>
              <span className="ego-label">Commander:</span>
              <span className="ego-value">Jack Heather</span>
            </li>
          </ul>
        </section>

        {/* PROJECTS CARD */}
        <section className="bento-card projects-card glassmorphism">
          <div className="card-header">
            <h2>Featured Projects</h2>
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${projectFilter === 'all' ? 'active' : ''}`}
                onClick={() => setProjectFilter('all')}
              >
                All
              </button>
              <button 
                className={`filter-btn ${projectFilter === 'handmade' ? 'active' : ''}`}
                onClick={() => setProjectFilter('handmade')}
                title="Only projects coded by hand"
              >
                🛠️ Handmade
              </button>
              <button 
                className={`filter-btn ${projectFilter === 'vibecoded' ? 'active' : ''}`}
                onClick={() => setProjectFilter('vibecoded')}
                title="Only projects built with AI assistance"
              >
                ⚡ Vibe-coded
              </button>
            </div>
          </div>

          <div className="projects-list">
            {filteredProjects.map(project => (
              <article key={project.id} className="project-item">
                <div className="project-meta">
                  <div className="project-title-wrapper">
                    <h3>{project.title}</h3>
                    <span className={`badge ${project.type}`}>
                      {project.type === 'handmade' ? (
                        <>
                          <Hammer size={12} />
                          <span>Handmade</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={12} />
                          <span>Vibe-coded</span>
                        </>
                      )}
                    </span>
                  </div>
                  <p>{project.description}</p>
                  <div className="project-tech">
                    {project.techStack.map(t => (
                      <span key={t} className="tech-pill">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="project-links">
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" title="View Source on GitHub">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                      </svg>
                    </a>
                  )}
                  {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" title="View Live Project">
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* BLOG CARD */}
        <section className="bento-card blog-card glassmorphism">
          <div className="card-header">
            <h2>Blog & Thought Logs</h2>
            <BookOpen size={20} className="header-icon" />
          </div>
          <div className="blog-list">
            {blogPosts.map(post => (
              <article 
                key={post.id} 
                className="blog-item"
                onClick={() => setSelectedPost(post)}
              >
                <div className="blog-meta">
                  <span className="blog-category">{post.category}</span>
                  <span className="blog-date">{post.date}</span>
                </div>
                <h3>{post.title}</h3>
                <p>{post.summary}</p>
                <div className="read-more">
                  <Clock size={12} />
                  <span>{post.readTime} read</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* TECH STACK CARD */}
        <section className="bento-card tech-card glassmorphism">
          <div className="card-header">
            <h2>Primary Stack</h2>
            <Cpu size={20} className="header-icon" />
          </div>
          <div className="tech-grid">
            <div className="tech-category">
              <h4>Systems & Compilers</h4>
              <div className="tech-items">
                <span className="tech-item-pill">C++</span>
                <span className="tech-item-pill">Rust</span>
                <span className="tech-item-pill">LLVM</span>
                <span className="tech-item-pill">Flex/Bison</span>
              </div>
            </div>
            <div className="tech-category">
              <h4>Web & Tooling</h4>
              <div className="tech-items">
                <span className="tech-item-pill">TypeScript</span>
                <span className="tech-item-pill">React</span>
                <span className="tech-item-pill">Vite</span>
                <span className="tech-item-pill">Node.js</span>
                <span className="tech-item-pill">Git</span>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT / EMAIL CARD */}
        <section className="bento-card contact-card glassmorphism" onClick={handleCopyEmail}>
          <div className="contact-icon">
            <Mail size={32} />
          </div>
          <h3>Let's Connect</h3>
          <p className="email-display">ging19freecss@gmail.com</p>
          <button className={`copy-btn ${copiedEmail ? 'copied' : ''}`}>
            {copiedEmail ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiedEmail ? 'Copied!' : 'Copy Email'}</span>
          </button>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bento-footer">
        <p>© 2026 ZIJH // Ivan Zharov. Crafted dynamically.</p>
      </footer>

      {/* BLOG ARTICLE VIEW MODAL */}
      {selectedPost && (
        <div className="blog-modal-overlay" onClick={() => setSelectedPost(null)}>
          <div className="blog-modal-content glassmorphism" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedPost(null)}>
              <ArrowLeft size={16} />
              <span>Back to Bento</span>
            </button>
            <div className="modal-body">
              <header className="modal-header">
                <div className="blog-meta">
                  <span className="blog-category">{selectedPost.category}</span>
                  <span className="blog-date">{selectedPost.date}</span>
                  <span className="blog-read-time">{selectedPost.readTime} read</span>
                </div>
                <h2>{selectedPost.title}</h2>
              </header>
              <div className="modal-article-content">
                {/* Parse simple markdown tags manually */}
                {selectedPost.content.split('\n\n').map((paragraph, index) => {
                  if (paragraph.startsWith('### ')) {
                    return <h3 key={index}>{paragraph.replace('### ', '')}</h3>;
                  }
                  if (paragraph.startsWith('*   ')) {
                    return (
                      <ul key={index}>
                        {paragraph.split('\n').map((li, i) => (
                          <li key={i}>{li.replace('*   ', '').replace('- ', '')}</li>
                        ))}
                      </ul>
                    );
                  }
                  return <p key={index}>{paragraph}</p>;
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
