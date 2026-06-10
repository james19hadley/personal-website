import { useState } from 'react';
import { projects } from '../data/projects';
import { ArrowLeft, ExternalLink, Hammer, Sparkles } from 'lucide-react';
import './ProjectsLayout.css';

interface ProjectsLayoutProps {
  onBack: () => void;
}

export const ProjectsLayout = ({ onBack }: ProjectsLayoutProps) => {
  const [filter, setFilter] = useState<'all' | 'handmade' | 'vibecoded'>('all');

  const filtered = projects.filter(p => {
    if (filter === 'handmade') return p.type === 'handmade';
    if (filter === 'vibecoded') return p.type === 'vibecoded';
    return true;
  });

  return (
    <div className="layout-container fade-in">
      <header className="layout-header">
        <button onClick={onBack} className="back-btn">
          <ArrowLeft size={16} />
          <span>back</span>
        </button>
        <span className="layout-logo">zijh</span>
      </header>

      <main className="layout-main">
        <div className="section-header">
          <h2 className="section-title">featured projects</h2>
          <div className="projects-filter-bar">
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              all
            </button>
            <button 
              className={`filter-tab ${filter === 'handmade' ? 'active' : ''}`}
              onClick={() => setFilter('handmade')}
            >
              🛠️ handmade
            </button>
            <button 
              className={`filter-tab ${filter === 'vibecoded' ? 'active' : ''}`}
              onClick={() => setFilter('vibecoded')}
            >
              ⚡ vibe-coded
            </button>
          </div>
        </div>

        <div className="projects-grid-list">
          {filtered.map(p => (
            <article key={p.id} className="project-card-item glassmorphism">
              <div className="p-card-body">
                <div className="p-card-title-row">
                  <h3>{p.title}</h3>
                  <span className={`p-badge ${p.type}`}>
                    {p.type === 'handmade' ? (
                      <>
                        <Hammer size={10} />
                        <span>handmade</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={10} />
                        <span>vibe-coded</span>
                      </>
                    )}
                  </span>
                </div>
                <p className="p-card-desc">{p.description}</p>
                <div className="p-card-tech">
                  {p.techStack.map(t => (
                    <span key={t} className="tech-tag">{t}</span>
                  ))}
                </div>
              </div>
              <div className="p-card-actions">
                {p.githubUrl && (
                  <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" title="source code">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                    </svg>
                  </a>
                )}
                {p.liveUrl && (
                  <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" title="live demo">
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
};
