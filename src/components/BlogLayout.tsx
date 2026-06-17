import { useState } from 'react';
import { blogPosts, type BlogPost } from '../data/blog';
import { projects } from '../data/projects';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import { renderMarkdown } from './markdownHelpers';
import './BlogLayout.css';

interface BlogLayoutProps {
  onBack: () => void;
  projectFilter?: string | null;
  setProjectFilter?: (filter: string | null) => void;
}

/**
 * @component BlogLayout
 * @description Blog dashboard showing article cards with read times and pagination support.
 * Displays articles in a modal reader interface upon card selection.
 */
export const BlogLayout = ({ onBack, projectFilter, setProjectFilter }: BlogLayoutProps) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const POSTS_PER_PAGE = 5; 
  
  const filteredPosts = projectFilter
    ? blogPosts.filter(post => post.projectId === projectFilter)
    : blogPosts;

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const activeProject = projects.find(p => p.id === projectFilter);
  const projectTitle = activeProject ? activeProject.title : projectFilter;

  if (selectedPost) {
    return (
      <div className="layout-container fade-in">
        <header className="layout-header">
          <button onClick={() => setSelectedPost(null)} className="back-btn">
            <ArrowLeft size={16} />
            <span>back to blog</span>
          </button>
          <span className="layout-logo">zijh</span>
        </header>

        <main className="layout-main">
          <article className="blog-article-full">
            <header className="article-header">
              <div className="article-meta-row">
                <span className="article-category-tag">{selectedPost.category}</span>
                <span className="article-meta-item">
                  <Calendar size={12} />
                  <span>{selectedPost.date}</span>
                </span>
                <span className="article-meta-item">
                  <Clock size={12} />
                  <span>{selectedPost.readTime} read</span>
                </span>
              </div>
              <h1 className="article-main-title">{selectedPost.title}</h1>
            </header>

            <div className="article-content-body">
              {renderMarkdown(selectedPost.content)}
            </div>
          </article>
        </main>
      </div>
    );
  }

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
        <h2 className="section-title">thought logs</h2>

        {projectFilter && (
          <div className="blog-filter-banner glassmorphism">
            <span>
              Showing logs for: <strong className="highlight-color">{projectTitle}</strong>
            </span>
            <button 
              onClick={() => setProjectFilter && setProjectFilter(null)}
              className="clear-filter-btn"
            >
              clear filter
            </button>
          </div>
        )}

        <div className="blog-posts-list">
          {paginatedPosts.length > 0 ? (
            paginatedPosts.map(post => (
              <article 
                key={post.id} 
                className="blog-post-card glassmorphism"
                onClick={() => setSelectedPost(post)}
              >
                <div className="post-meta-line">
                  <span className="post-cat">{post.category}</span>
                  <span className="post-date">{post.date}</span>
                </div>
                <h3 className="post-title">{post.title}</h3>
                <p className="post-summary">{post.summary}</p>
                <div className="post-footer">
                  <Clock size={12} />
                  <span>{post.readTime} read</span>
                </div>
              </article>
            ))
          ) : (
            <p className="post-summary" style={{ textAlign: 'center', marginTop: '24px' }}>No blog entries found for this project yet.</p>
          )}
        </div>

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="blog-pagination">
            <button 
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              prev
            </button>
            <span className="pagination-info">
              page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              next
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
