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
    id: 'pulse-monolith-bot',
    title: 'Pulse Monolith Bot',
    description: 'A cognitive-psychology-driven AI accountability partner and deep work tracker. Features natural language task logging, focus session management, smart notification cleanup, and automated accountability reporting via Telegram.',
    type: 'handmade',
    techStack: ['Python', 'FastAPI', 'PostgreSQL', 'Celery', 'Telegram API'],
    githubUrl: 'https://github.com/james19hadley/pulse-monolith-bot',
    status: 'in-progress'
  },
  {
    id: 'caldera-core',
    title: 'Caldera AR Sandbox Backend',
    description: 'A high-performance C++ backend for an Augmented Reality (AR) Sandbox. Integrates Kinect V2 sensor data processing via libfreenect2 and serves depth-map/frame data over HTTP endpoints.',
    type: 'handmade',
    techStack: ['C++', 'CMake', 'libfreenect2', 'cpp-httplib'],
    githubUrl: 'https://github.com/james19hadley/caldera-core',
    status: 'completed'
  },
  {
    id: 'npu-linear-algebra',
    title: 'AMD NPUs Linear Algebra Lab',
    description: 'A systems lab project focused on executing high-performance linear algebra operations on AMD Neural Processing Units (NPUs) using the Ryzen AI software stack and MLIR-based AI Engine toolchain.',
    type: 'handmade',
    techStack: ['C++', 'MLIR-AIE', 'Ryzen AI', 'HLS'],
    status: 'completed'
  },
  {
    id: 'tmpfs-cpp',
    title: 'tmpfs-cpp Virtual Filesystem',
    description: 'A lightweight, sandboxed virtual in-memory file system written in C++ and compiled to WebAssembly. Powers the interactive terminal interface of this website.',
    type: 'handmade',
    techStack: ['C++', 'WebAssembly', 'CMake', 'Emscripten'],
    githubUrl: 'https://github.com/james19hadley/tmpfs-cpp',
    status: 'completed'
  },
  {
    id: 'ag2r',
    title: 'AG2R — Antigravity 2.0 Remote',
    description: 'A lightweight, Android-friendly mobile remote interface for monitoring and interacting with Antigravity AI coding sessions directly from a phone.',
    type: 'vibecoded',
    techStack: ['JavaScript', 'HTML5', 'CSS3', 'Shell'],
    githubUrl: 'https://github.com/james19hadley/ag2r',
    status: 'completed'
  },
  {
    id: 'ch-tg-bot',
    title: 'Chinese Calligraphy & Learning Bot',
    description: 'A Telegram bot designed to assist with learning Chinese. Generates calligraphic images, plays high-quality audio pronunciation using Microsoft Edge Neural TTS, auto-translates text, and sends spaced-repetition dictionary cards.',
    type: 'vibecoded',
    techStack: ['Python', 'Edge Neural TTS', 'Docker', 'SQLite'],
    githubUrl: 'https://github.com/james19hadley/ch_tg_bot',
    status: 'completed'
  },
  {
    id: 'vimemon',
    title: 'Vimémon (FireRed Edition)',
    description: 'A Pokémon-style retro pixel-art RPG designed to teach Vim navigation and editing commands. Move like a cursor using h/j/k/l, fight trainers in text-fixing battles, and defeat Gym Leaders to unlock editing commands. (Coming Soon)',
    type: 'vibecoded',
    techStack: ['Vite', 'React', 'TypeScript', 'Phaser 3'],
    status: 'in-progress'
  },
  {
    id: 'personal-website',
    title: 'zijh.pages.dev Portfolio & Blog',
    description: 'The website you are looking at right now. A premium portfolio that morphs between a glassmorphic visual bento grid and a full-featured UNIX-like interactive terminal.',
    type: 'vibecoded',
    techStack: ['React', 'TypeScript', 'Vite', 'Vanilla CSS'],
    githubUrl: 'https://github.com/james19hadley/personal-website',
    status: 'completed'
  }
];
