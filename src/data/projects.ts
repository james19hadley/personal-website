export interface Project {
  id: string;
  title: string;
  description: string;
  type: 'handmade' | 'vibecoded';
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  status: 'completed' | 'in-progress' | 'archived';
  detailsUrl?: string;
}

export const projects: Project[] = [];
