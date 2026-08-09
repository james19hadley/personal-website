export interface BlogPost {
  id: string;
  title: string;
  date: string;
  readTime: string;
  summary: string;
  category: string;
  content: string; // Markdown-friendly content
  projectId?: string; // Optional reference to a project id
}

export const blogPosts: BlogPost[] = [];
