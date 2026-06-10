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

export const projects: Project[] = [
  {
    id: 'dvorak-trainer',
    title: 'Dvorak Keyboard Trainer',
    description: 'An interactive minimal keyboard training app designed specifically for mastering the Dvorak layout. Tracks character accuracy and typing speed.',
    type: 'handmade',
    techStack: ['React', 'TypeScript', 'Web Audio API'],
    githubUrl: 'https://github.com/james19hadley/dvorak-trainer',
    status: 'completed'
  },
  {
    id: 'tud-compiler',
    title: 'TUD Custom Language Compiler',
    description: 'A compiler for a simplified procedural programming language, featuring lexical analysis, AST construction, code optimization, and x86 target code generation. Built for a compiler design course at TU Darmstadt.',
    type: 'handmade',
    techStack: ['C++', 'LLVM', 'Flex/Bison'],
    status: 'completed'
  },
  {
    id: 'hunter-rpg',
    title: 'Hunter x Hunter Console RPG',
    description: 'A text-based retro rogue-like role-playing game set in the Hunter x Hunter universe. Features combat mechanics, Nen type discovery test, and procedurally generated dungeons.',
    type: 'handmade',
    techStack: ['Rust', 'Crossterm'],
    githubUrl: 'https://github.com/james19hadley/hunter-rpg',
    status: 'in-progress'
  },
  {
    id: 'ed-hud-router',
    title: 'Elite Dangerous HUD Customizer',
    description: 'A utility to parse game logs, customize HUD matrix values dynamically, and route navigation data to secondary devices. Designed for Commander Jack Heather.',
    type: 'vibecoded',
    techStack: ['Node.js', 'Electron', 'TailwindCSS'],
    githubUrl: 'https://github.com/james19hadley/ed-hud-router',
    liveUrl: 'https://inara.cz/elite/cmdr/463635/',
    status: 'completed'
  },
  {
    id: 'zijh-portfolio',
    title: 'zijh.pages.dev Portfolio & Blog',
    description: 'The website you are looking at right now. A premium hybrid portfolio that morphs between a Glassmorphism Bento Grid layout and an interactive retro CLI terminal.',
    type: 'vibecoded',
    techStack: ['React', 'TypeScript', 'Vite', 'CSS Modules'],
    githubUrl: 'https://github.com/james19hadley/personal-website',
    liveUrl: 'https://zijh.pages.dev',
    status: 'completed'
  }
];
