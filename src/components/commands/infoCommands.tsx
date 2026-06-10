import { type Command } from './types';
import { projects } from '../../data/projects';
import { blogPosts } from '../../data/blog';

export const infoCommands: { [key: string]: Command } = {
  whoami: {
    name: 'whoami',
    description: 'Display current user identity & aliases',
    execute: () => (
      <div className="cmd-output-whoami">
        <p><span className="highlight font-bold">identity:</span> Ivan Zharov (zijh)</p>
        <p><span className="highlight font-bold">systems-user:</span> ging</p>
        <p><span className="highlight font-bold">cmdr:</span> Jack Heather (Elite Dangerous)</p>
        <p><span className="highlight font-bold">github:</span> james19hadley</p>
      </div>
    )
  },
  about: {
    name: 'about',
    description: 'Print details about Ivan (ZIJH) & TUD studies',
    execute: () => (
      <div className="cmd-output-about">
        <p><span className="highlight font-bold">Ivan Zharov (ZIJH)</span> - Developer & CS student.</p>
        <p>🎓 Currently in the last semester of my Bachelor degree at <span className="highlight">TU Darmstadt (TUD)</span>.</p>
        <p>📡 Focus: Systems programming, compilers, modular web interfaces, and keyboard layout optimization.</p>
        <p>📧 Email: <a href="mailto:ging19freecss@gmail.com" className="term-link">ging19freecss@gmail.com</a></p>
        <p>🖥️ GitHub: <a href="https://github.com/james19hadley" target="_blank" rel="noopener noreferrer" className="term-link">github.com/james19hadley</a></p>
      </div>
    )
  },
  projects: {
    name: 'projects',
    description: 'List creations by type',
    execute: ({ args }) => {
      const showHandmade = args.includes('--handmade');
      const showVibe = args.includes('--vibe');
      
      let list = projects;
      if (showHandmade) list = projects.filter(p => p.type === 'handmade');
      if (showVibe) list = projects.filter(p => p.type === 'vibecoded');

      return (
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
    }
  },
  blog: {
    name: 'blog',
    description: 'Show log list or read a specific entry',
    execute: ({ args }) => {
      const subAction = args[0] ? args[0].toLowerCase() : 'list';
      
      if (subAction === 'list') {
        return (
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
          return (
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
          return <p className="error-text">Error: Post "{postId}" not found. Type "blog list" to see valid IDs.</p>;
        }
      } else {
        return <p className="error-text">Usage: blog [list | read &lt;id&gt;]</p>;
      }
    }
  },
  secret: {
    name: 'secret',
    description: 'Run custom system diagnostics',
    execute: () => (
      <div className="cmd-output-secret">
        <p className="cyber-diag">Running ZIJH diagnostic parameters...</p>
        <p className="cyan-glow">[OK] Mainframes connected to zijh.pages.dev proxy.</p>
        <p className="cyan-glow">[OK] Keyboard layouts and shortcuts map resolved.</p>
        <p className="cyan-glow">[OK] Nen affinity detected: Specialization (Ging Freecss legacy).</p>
        <div className="matrix-ascii">
          <pre>{`   _     _ _ _     
  (_)   (_| | |    
   _ _____| | |__  
  | (____ | |  _ \\ 
  | / ___ | | | | |
  _| \\_____|\\_|_| |_|
  (__/               `}</pre>
        </div>
      </div>
    )
  },
  search: {
    name: 'search',
    description: 'Search across projects, blog posts, and virtual files',
    execute: ({ args, wasmModule, runCommand }) => {
      const q = args.join(' ').trim().toLowerCase();
      if (!q) {
        return <p className="error-text">Usage: search &lt;query&gt;</p>;
      }

      // 1. Filter Projects
      const matchedProjects = projects.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.techStack.some(t => t.toLowerCase().includes(q))
      );

      // 2. Filter Blog Posts
      const matchedBlogs = blogPosts.filter(b => 
        b.title.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.content.toLowerCase().includes(q)
      );

      // 3. Filter Virtual Files
      let vfsFiles: { path: string; content?: string }[] = [];
      if (wasmModule) {
        try {
          const stateStr = wasmModule.cwrap('serialize_fs', 'string', [])();
          const items = JSON.parse(stateStr || '[]');
          if (Array.isArray(items)) {
            vfsFiles = items.filter((item: any) => item.type === 'F');
          }
        } catch {}
      }

      const matchedFiles = vfsFiles.filter(f => 
        f.path.toLowerCase().includes(q) ||
        (f.content && f.content.toLowerCase().includes(q))
      );

      if (matchedProjects.length === 0 && matchedBlogs.length === 0 && matchedFiles.length === 0) {
        return <p className="error-text">No matches found for "{q}" across projects, blog posts, or files.</p>;
      }

      return (
        <div className="cmd-output-search">
          <p className="section-title">Search Results for "{q}":</p>
          
          {matchedProjects.length > 0 && (
            <div className="search-group" style={{ marginBottom: '10px' }}>
              <p className="highlight font-bold" style={{ color: 'var(--accent-cyan)' }}>Projects:</p>
              <ul className="help-list" style={{ paddingLeft: '14px', listStyleType: 'square' }}>
                {matchedProjects.map(p => (
                  <li key={p.id}>
                    {p.githubUrl ? (
                      <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="term-link">
                        {p.title}
                      </a>
                    ) : (
                      <span className="highlight">{p.title}</span>
                    )}{' '}
                    - {p.description.slice(0, 75)}...
                  </li>
                ))}
              </ul>
            </div>
          )}

          {matchedBlogs.length > 0 && (
            <div className="search-group" style={{ marginBottom: '10px' }}>
              <p className="highlight font-bold" style={{ color: 'var(--accent-cyan)' }}>Blog Entries:</p>
              <ul className="help-list" style={{ paddingLeft: '14px', listStyleType: 'square' }}>
                {matchedBlogs.map(b => (
                  <li key={b.id}>
                    <button onClick={() => runCommand?.(`blog read ${b.id}`)} className="term-link-btn">
                      blog read {b.id}
                    </button>{' '}
                    - {b.title}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {matchedFiles.length > 0 && (
            <div className="search-group">
              <p className="highlight font-bold" style={{ color: 'var(--accent-cyan)' }}>Virtual Files:</p>
              <ul className="help-list" style={{ paddingLeft: '14px', listStyleType: 'square' }}>
                {matchedFiles.map(f => (
                  <li key={f.path}>
                    <button onClick={() => runCommand?.(`cat ${f.path}`)} className="term-link-btn">
                      {f.path}
                    </button>
                    {' '}(
                    <button onClick={() => runCommand?.(`vim ${f.path}`)} className="term-link-btn" style={{ fontSize: '0.8rem' }}>
                      edit
                    </button>
                    )
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }
  },
  find: {
    name: 'find',
    description: 'Search across projects, blog posts, and virtual files',
    execute: (ctx) => infoCommands.search.execute(ctx)
  }
};
