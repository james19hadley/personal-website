import { projects } from '../data/projects';
import { ArrowLeft, ExternalLink, Hammer, Sparkles, BookOpen } from 'lucide-react';
import { blogPosts } from '../data/blog';
import './ProjectsLayout.css';

interface ProjectsLayoutProps {
  onBack: () => void;
  onNavigateToBlog?: (projectId: string) => void;
}

/**
 * @component ProjectsLayout
 * @description Project list layout with classification filters. Houses lists of Handmade 🛠️ vs Vibe-coded ⚡ creations,
 * with tech stacks and GitHub repository details. Card-level click handlers navigate to external URLs.
 */
export const ProjectsLayout = ({ onBack, onNavigateToBlog }: ProjectsLayoutProps) => {
  const vibeProjects = projects.filter(p => p.type === 'vibecoded');
  const handmadeProjects = projects.filter(p => p.type === 'handmade');

  const handleProjectClick = (p: typeof projects[0]) => {
    const url = p.liveUrl || p.githubUrl;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const projectHasBlog = (projectId: string) => {
    return blogPosts.some(post => post.projectId === projectId);
  };

  return (
    <div className="layout-container projects-layout-container fade-in">
      <header className="layout-header">
        <button onClick={onBack} className="back-btn">
          <ArrowLeft size={16} />
          <span>back</span>
        </button>
        <span className="layout-logo">zijh</span>
      </header>

      <main className="layout-main projects-main">
        <h2 className="section-title projects-title">featured projects</h2>

        <div className="projects-split-view">
          
          {/* VIBE-CODED COLUMN (LEFT) */}
          <div className="projects-column vibe-column">
            <div className="column-header-title">
              <Sparkles size={16} className="column-icon violet-glow" />
              <h3>⚡ vibe-coded</h3>
            </div>
            <p className="column-subtitle-desc">rapid prototypes & scripts built in collaboration with AI</p>
            
            <div className="projects-tiles-grid">
              {vibeProjects.map(p => (
                <article 
                  key={p.id} 
                  className="project-tile-card glassmorphism"
                  onClick={() => handleProjectClick(p)}
                >
                  <div className="p-tile-body">
                    <h4>{p.title}</h4>
                    <p>{p.description}</p>
                    <div className="p-tile-tech">
                      {p.techStack.map(t => (
                        <span key={t} className="tech-tag">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="p-tile-actions">
                    {p.githubUrl && (
                      <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" title="source code" onClick={e => e.stopPropagation()}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                        </svg>
                      </a>
                    )}
                    {p.liveUrl && (
                      <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" title="live demo" onClick={e => e.stopPropagation()}>
                        <ExternalLink size={16} />
                      </a>
                    )}
                    {projectHasBlog(p.id) && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onNavigateToBlog) onNavigateToBlog(p.id);
                        }} 
                        className="project-blog-btn"
                        title="read dev logs"
                      >
                        <BookOpen size={16} />
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* HANDMADE COLUMN (RIGHT) */}
          <div className="projects-column handmade-column">
            <div className="column-header-title">
              <Hammer size={16} className="column-icon emerald-glow" />
              <h3>🛠️ handmade</h3>
            </div>
            <p className="column-subtitle-desc">classic line-by-line craftsmanship with deep system logic</p>
            
            <div className="projects-tiles-grid">
              {handmadeProjects.map(p => (
                <article 
                  key={p.id} 
                  className="project-tile-card glassmorphism"
                  onClick={() => handleProjectClick(p)}
                >
                  <div className="p-tile-body">
                    <h4>{p.title}</h4>
                    <p>{p.description}</p>
                    <div className="p-tile-tech">
                      {p.techStack.map(t => (
                        <span key={t} className="tech-tag">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="p-tile-actions">
                    {p.githubUrl && (
                      <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" title="source code" onClick={e => e.stopPropagation()}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                        </svg>
                      </a>
                    )}
                    {p.liveUrl && (
                      <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" title="live demo" onClick={e => e.stopPropagation()}>
                        <ExternalLink size={16} />
                      </a>
                    )}
                    {projectHasBlog(p.id) && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onNavigateToBlog) onNavigateToBlog(p.id);
                        }} 
                        className="project-blog-btn"
                        title="read dev logs"
                      >
                        <BookOpen size={16} />
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};
