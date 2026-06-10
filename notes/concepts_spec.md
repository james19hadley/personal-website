# Personal Website Concepts & Prompts Specification

This document details two parallel concepts for Ivan's personal website. Both concepts are designed as independent frontend web applications and can be developed in parallel sub-directories:
1. **Concept A (Bento Grid)** in `concept-bento/`
2. **Concept B (Interactive CLI Terminal)** in `concept-terminal/`

---

## 🧑‍💻 User Context & Requirements Baseline

- **User**: Ivan Zharov (known online as **ZIJH** / Ivan James Hadley)
- **Status**: Final semester student at TU Darmstadt (TUD), Germany.
- **GitHub Username**: `james19hadley`
- **Main Domain**: `https://zijh.pages.dev/` (Cloudflare Pages)
- **Integrations**: 
  - Dynamic GitHub repository loading via GitHub API (with support for client-side token or public repository fetching).
  - Since many repositories might be private or incomplete, the website must allow a **curated projects configuration file (JSON/JS)** to manually display, enrich, or mock projects (e.g., custom images, descriptions, tags) alongside fetched public repos.
- **The Core Feature: "Handmade vs. Vibe-coded"**:
  - Every project must have a clear badge/indicator showing how it was built:
    - **Handmade (Ручная работа)**: Written line-by-line, classical coding, deep logic control.
    - **Vibe-coded (Навайбкодил)**: AI-assisted, generated, built quickly using LLMs or prompt engineering.
- **Stack Recommendation**: 
  - **Next.js (React) + Vanilla CSS / CSS Modules** (Recommended for SSG, SEO, and blog readability)
  - OR **Vite (React) + Vanilla CSS** (For lightweight single-page application structure).
- **Hosting**: Cloudflare Pages (configured via `https://zijh.pages.dev/`).

---

## 🎨 Concept A: Bento Grid Website (Bento Box Interface)

### 1. Visual & Interactive Style
- **Aesthetic**: Premium Glassmorphism. Sleek dark mode by default with dynamic light mode toggle. Rounded cards with subtle borders (`1px solid rgba(255, 255, 255, 0.1)`), deep shadows, and grid layout.
- **Animations**: Cards tilt slightly on hover (3D card effect). Micro-animations on hover (e.g., tech stack icons rotate or scale, status indicator glows).
- **Layout**: CSS Grid representing a Bento Box. Responsive layout collapse into a single-column layout on mobile.

### 2. Grid Blocks (Widgets)
1. **Bio Block**: "Ivan" + "TU Darmstadt Student (Last Semester)" + location, short bio.
2. **GitHub Activity**: Dynamically showing the last commit/recent push or GitHub stats card.
3. **Projects Showcase Grid**: A grid section showcasing cards. Each project has:
   - Visual card with a tech stack, links (GitHub/Live).
   - Distinct classification badge: "Handmade" 🛠️ vs "Vibe-coded" ⚡.
   - Filter/Toggle to show only Handmade or only Vibe-coded.
4. **Blog Preview**: A block displaying the latest blog post (clicking it opens the post).
5. **Interactive Tech Stack**: A group of interactive tiles showing logos of technologies Ivan uses.
6. **Social Links / Contact**: Quick copy email button, LinkedIn/GitHub links.

---

## 📟 Concept B: Interactive CLI Terminal Portfolio

### 1. Visual & Interactive Style
- **Aesthetic**: Retro-cyberpunk developer console. Dark slate or deep dark theme, neon green/cyan terminal fonts (`JetBrains Mono` or `Fira Code`). Scanline effects, CRT flicker (subtle and toggleable).
- **Console Interface**: A main terminal window that dominates the landing page. Users can type commands in a real input prompt (e.g. `james19hadley ~ $ _`).
- **Graphical Sidebar/Layout**: A split-screen layout or a beautiful hybrid GUI. If the user doesn't want to type, they can click navigation buttons in a floating sidebar or click command shortcuts at the bottom of the screen (e.g., clicking `[about]` automatically types and runs the `about` command).

### 2. Terminal Commands List
- `help` / `?`: Lists all available commands with descriptions.
- `about`: Prints Ivan's bio, education (TU Darmstadt), and contact info.
- `projects`: Prints the list of projects, grouped by tags or filterable by type (`--handmade` or `--vibe-coded`).
- `blog`: Lists latest blog posts. Typing `blog view <id>` renders the blog post right in the terminal or opens a reader modal.
- `github`: Displays GitHub statistics and public repo list for `james19hadley`.
- `clear`: Clears the screen.
- `socials`: Renders clickable terminal links to GitHub, LinkedIn, Email.
- `secret`: A fun easter egg or retro ASCII art.

---

## 📋 Copy-Paste Prompts for Bootstrapping

Ivan, you can paste the prompts below directly into new AI chats to create these websites.

### 📋 PROMPT FOR CONCEPT A (BENTO GRID)
```markdown
You are a premium web developer and designer. Build a stunning personal website/portfolio in a directory called `concept-bento`.

Tech Stack:
- Next.js (React) or Vite (React)
- Vanilla CSS or CSS Modules (NO TailwindCSS unless requested later. Clean, modern, responsive CSS variables, HSL-based colors).
- Font: Inter or Outfit from Google Fonts.

Core Theme & Aesthetic:
- Premium Bento Grid layout with Glassmorphism (dark mode default, toggleable light mode).
- Subtle 3D tilt hover effects on grid cards, micro-animations, neon-glowing active state indicators.
- CSS Grid layout that collapses to a clean single column on mobile.

Website Content & Features:
1. Bio Block: Highlight "Ivan, Student at TU Darmstadt (Last Semester)".
2. Projects Grid: Load projects from a config file (and support GitHub API fetching for user "james19hadley" with a fallback).
3. "Handmade vs Vibe-coded" Badges: Every project MUST have a clear indicator/badge:
   - "Handmade" 🛠️ (written by hand, classic coding)
   - "Vibe-coded" ⚡ (AI-assisted / prompt engineered)
   - Include a toggle button to filter projects by these badges.
4. Blog Section: Markdown-based blog posts. Render them inside a beautiful, highly readable layout with a progress-bar of reading.
5. Tech Stack Widget: Interactive grid of tech skills.
6. Social Icons & "Copy Email" dynamic button.

Please initialize the project, write the core CSS styles and structure, and build the components. Ensure a WOW effect at first glance. No placeholders, make it immediately functional and premium.
```

### 📋 PROMPT FOR CONCEPT B (TERMINAL CLI)
```markdown
You are a creative frontend developer. Build a retro-futuristic personal website/portfolio in a directory called `concept-terminal`.

Tech Stack:
- Next.js (React) or Vite (React)
- Vanilla CSS (custom styled terminal components, CRT flicker scanlines toggleable, glowing neon text, custom cursor animation).
- Font: JetBrains Mono, Fira Code, or another developer monospaced font.

Core Interface & Aesthetic:
- Hybrid CLI/GUI: A dominant central retro-terminal console where users can interact via typed commands.
- Interactive Command Shortcuts: Below the terminal input, include clickable command badges (e.g. `[about]`, `[projects]`, `[blog]`, `[clear]`) which automatically type and execute the command for non-technical or lazy visitors.
- Custom cursor blinking and typing effects.

Terminal CLI Commands:
- `help` / `?`: List commands.
- `about`: Display bio (Ivan, student at TU Darmstadt last semester) and contact links.
- `projects`: Render a styled list of projects. Projects must show:
  - "Handmade" 🛠️ vs "Vibe-coded" ⚡ badges.
  - Commands to filter, e.g. `projects --handmade` or `projects --vibe`.
- `blog`: List recent articles. Command `blog read <number>` loads the article in the console with formatted markdown syntax.
- `github`: Fetch and render public info for user "james19hadley".
- `clear`: Clear screen.
- `secret`: Retro ASCII art easter egg.

Please initialize the project, build the command parser, retro terminal UI, and integrate the data sources. Make sure it feels like a real UNIX shell but polished and accessible.
```
