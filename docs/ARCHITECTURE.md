# Codebase Architecture Map (Auto-generated)

This file contains the auto-generated layout registry of major components, hooks, and directory structures. It updates automatically when compiling the project.

---

## 📁 Directory Structure

Below is an overview of the key directories in the project:

- `src/` - Core application source code.
  - `src/components/` - Modular UI layout views (Home, Projects, Blog, Space, Terminal, GameBoy console).
  - `src/hooks/` - Custom React hooks for global features like keyboard navigation.
  - `src/data/` - Structured static data models (blog posts, projects list).
  - `src/wasm/` - Emscripten compiled WebAssembly artifacts for the C++ virtual filesystem (`tmpfs-cpp`).
- `scripts/` - Utility execution scripts (compilers, documentation builders).
- `notes/` - Developer journals and layout optimization logs.

---

## 🛠️ Components Registry

Component details extracted from code JSDoc annotations:

### 🧩 `App`
- **Source File**: [App.tsx](file:///home/ging/prog/personal-website/src/App.tsx)
- **Description**: Root application controller and layout orchestrator. Manages global view state (home, projects, blog, space, terminal, gameboy),
theme settings (light/dark), and instantiates/restores the C++ in-memory virtual filesystem WebAssembly module.
Integrates useVimNavigation hook to enable global Vim-style keyboard shortcuts.

### 🧩 `BlogLayout`
- **Source File**: [BlogLayout.tsx](file:///home/ging/prog/personal-website/src/components/BlogLayout.tsx)
- **Description**: Blog dashboard showing article cards with read times and pagination support.
Displays articles in a modal reader interface upon card selection.
- **Props / Parameters**:
  - `onBack` (`() => void`): Navigation callback returning to the home screen

### 🧩 `GameBoyConsole`
- **Source File**: [GameBoyConsole.tsx](file:///home/ging/prog/personal-website/src/components/GameBoyConsole.tsx)
- **Description**: Retro GameBoy Advance emulator component. Hosts a collection of Pokemon GBA ROMs via embedded emulator iframes.
Features a persistent iframe to prevent game state reloads during fullscreen toggling, mapping of physical key events to visual handheld buttons, and save state guidance.
- **Props / Parameters**:
  - `onBack` (`() => void`): Navigation handler returning back to terminal shell

### 🧩 `HomeLayout`
- **Source File**: [HomeLayout.tsx](file:///home/ging/prog/personal-website/src/components/HomeLayout.tsx)
- **Description**: Bento Grid GUI home layout. Presents the biography (CS student at TUD), tech stack widgets,
project category access, blog previews, and a copyable email contact card.
- **Props / Parameters**:
  - `onNavigate` (`(view: 'projects' | 'blog' | 'space' | 'terminal') => void`): Navigation view switcher
  - `theme` (`'dark' | 'light'`): Current UI color theme
  - `toggleTheme` (`() => void`): Theme toggle handler

### 🧩 `InlinePokemonGarden`
- **Source File**: [InlinePokemonGarden.tsx](file:///home/ging/prog/personal-website/src/components/InlinePokemonGarden.tsx)
- **Description**: Inline retro Pokémon Garden meadow. Renders a grid-based garden containing animated Pokémon sprites
that walk around randomly and play retro synthesize sound effects/cries on click.

### 🧩 `MatrixRain`
- **Source File**: [MatrixRain.tsx](file:///home/ging/prog/personal-website/src/components/MatrixRain.tsx)
- **Description**: Fullscreen canvas overlay displaying the iconic falling Matrix digital rain code effect.
Listens for key events (ESC/Q/Ctrl+C) to exit and return control back to the host terminal shell.
- **Props / Parameters**:
  - `onExit` (`() => void`): Callback triggered when exiting the matrix effect overlay

### 🧩 `ProjectsLayout`
- **Source File**: [ProjectsLayout.tsx](file:///home/ging/prog/personal-website/src/components/ProjectsLayout.tsx)
- **Description**: Project list layout with classification filters. Houses lists of Handmade 🛠️ vs Vibe-coded ⚡ creations,
with tech stacks and GitHub repository details. Card-level click handlers navigate to external URLs.
- **Props / Parameters**:
  - `onBack` (`() => void`): Navigation callback returning to the home screen

### 🧩 `SpaceLayout`
- **Source File**: [SpaceLayout.tsx](file:///home/ging/prog/personal-website/src/components/SpaceLayout.tsx)
- **Description**: Space and interests dashboard. Showcases external projects, setup details,
and key references that inspire the developer (such as Elite Dangerous, terminal tools, retro UI aesthetics).
- **Props / Parameters**:
  - `onBack` (`() => void`): Navigation callback returning to the home screen

### 🧩 `TerminalHeader`
- **Source File**: [TerminalHeader.tsx](file:///home/ging/prog/personal-website/src/components/TerminalHeader.tsx)
- **Description**: Header control bar for the interactive terminal. Houses window state toggles (maximize, theme switcher, GUI mode switch).

### 🧩 `TerminalLayout`
- **Source File**: [TerminalLayout.tsx](file:///home/ging/prog/personal-website/src/components/TerminalLayout.tsx)
- **Description**: Interactive terminal shell simulating a UNIX command line interface.
Exposes registry-mapped commands and compiles/interacts with the C++ virtual filesystem.

### 🧩 `TerminalShortcuts`
- **Source File**: [TerminalShortcuts.tsx](file:///home/ging/prog/personal-website/src/components/TerminalShortcuts.tsx)
- **Description**: Button shortcuts panel rendered at the bottom of the terminal screen, particularly useful for mobile keyboards.

### 🧩 `VimEditor`
- **Source File**: [VimEditor.tsx](file:///home/ging/prog/personal-website/src/components/VimEditor.tsx)
- **Description**: Built-in retro text editor simulating key features of Vim (Normal, Insert, and Command modes).
Supports cursor movement (h/j/k/l), deleting characters (x), writing changes (:w), and exiting (:q / :q!).
- **Props / Parameters**:
  - `filename` (`string`): The relative/absolute name of the file being edited
  - `initialContent` (`string`): Original file buffer string loaded on editor startup
  - `onSave` (`(content: string) => void`): Callback handler invoked to commit saved content back to the filesystem
  - `onClose` (`() => void`): Callback handler to dismiss editor and return focus back to the terminal prompt

---

## ⚓ Custom Hooks Registry

Custom hooks details extracted from code JSDoc annotations:

### 🎣 `useVimNavigation`
- **Source File**: [useVimNavigation.ts](file:///home/ging/prog/personal-website/src/hooks/useVimNavigation.ts)
- **Description**: Centralized Vim keyboard navigation controller. Binds layout-independent shortcuts (j/k/h/l, Esc, Enter)
to navigate and confirm interactive items (buttons, links, selects, cards). Supports non-Latin layouts (e.g. Russian) via physical KeyCode fallbacks.
- **Parameters**:
  - `view` (`ViewType`): Current active layout view
  - `setView` (`(view: ViewType) => void`): Navigation layout callback
  - `prevNonTermView` (`ViewType`): Previous layout before entering terminal
- **Returns** (`{ activeIndex: number, setActiveIndex: (idx: number) => void`): } Focus index states

---

*Last generated: 2026-06-10T20:21:04.372Z*
