# ZIJH Personal Site & WebAssembly Terminal Shell

This is the developer documentation and repository for the personal website of **Ivan Zharov (zijh)**, featuring a hybrid Bento Grid GUI and an interactive UNIX CLI Terminal powered by a native C++ virtual filesystem (`tmpfs-cpp`) compiled to WebAssembly (Wasm).

## 🚀 Architecture Overview

```mermaid
graph TD
    subgraph Browser Client (Vite + React)
        App[App.tsx - Root State Manager]
        Bento[Home/BentoLayout - Grid GUI]
        CLI[TerminalLayout - Shell UI]
        WasmLoader[createTmpFSModule - Emscripten Loader]
        
        App -->|Mode Toggle: Ctrl + `| Bento
        App -->|Mode Toggle: Ctrl + `| CLI
        App -->|Holds State| WasmLoader
        WasmLoader -->|Props: wasmModule, currentPwd, history| CLI
    end

    subgraph C++ Wasm Layer (decoupled)
        WasmJS[src/wasm/tmpfs.js - base64 Wasm payload]
        WasmInterface[src/wasm/wasm_interface.cpp - C Wrapper]
        MockHeader[cookie_io_functions_t.h - Emscripten fix]
        CppFilesystem[tmpfs-cpp Repository - External Source]
        
        WasmLoader -.->|Instantiates| WasmJS
        WasmJS -->|Compiles from| CppFilesystem
        WasmJS -->|Incorporates| WasmInterface
        WasmInterface -->|Mocks glibc headers via| MockHeader
    end
```

---

## 🛠️ Key Technical Features

### 1. WebAssembly C++ Virtual Filesystem (`tmpfs-cpp`)
Instead of simulating terminal commands in JavaScript, the site runs Ivan's actual C++ in-memory filesystem codebase (`tmpfs-cpp`) directly inside the browser using WebAssembly.

- **Zero-Modification Decoupling**: The website is structured so that the `tmpfs-cpp` repository remains 100% clean and unmodified. 
- **Wasm Interface Wrapper**: [src/wasm/wasm_interface.cpp](file:///home/ging/prog/personal-website/src/wasm/wasm_interface.cpp) defines C-linkage helper functions:
  - `execute_command(const char*)`: Parses arguments and runs filesystem commands inside the C++ engine. It temporarily redirects `std::cout` and `std::cerr` to a `std::stringstream` to capture the native outputs of the commands.
  - `get_pwd()`: Retrieves the current working directory path from C++.
- **Glibc Mock Header**: Emscripten doesn't support the Linux-specific `<bits/types/cookie_io_functions_t.h>` header. We bypassed this without altering the C++ repo by providing an empty mock header at [src/wasm/include/bits/types/cookie_io_functions_t.h](file:///home/ging/prog/personal-website/src/wasm/include/bits/types/cookie_io_functions_t.h) and instructing the compiler to use it via `-I`.
- **State Preservation**: The `wasmModule` instance, command `history` logs, and `currentPwd` path are lifted to the root state (`App.tsx`). This prevents the filesystem state from resetting when switching between GUI and CLI modes.
- **Single-File Bundle**: Compiling with `-s SINGLE_FILE=1` embeds the Wasm binary directly inside the JavaScript file as a base64 string, facilitating fast static hosting with zero network latency or MIME-type configuration issues.

### 2. Layout-Independent Vim Hotkeys
The site features Vim-like keyboard navigation (`HJKL`, `U`, `Q`, `Esc`, `Enter`) to browse and trigger elements without a mouse.

- **Multi-Layout Binding**: Key listeners use `e.code` (e.g., `KeyJ`, `KeyL`) to target the physical keyboard positions, ensuring keyboard navigation works flawlessly regardless of language layout (e.g., Russian ЙЦУКЕН, German QWERTZ).
- **Keyboard Mappings Fallback**: It checks `e.key` (character-based) to maintain native mappings for custom keyboard layouts.
- **Visual Highlighter**: Focused elements receive the `.vim-focused` styling defined in [src/index.css](file:///home/ging/prog/personal-website/src/index.css), creating glassmorphic glowing borders.

---

## 💻 Developer Guide

### Prerequisites
- Node.js & npm (local development)
- Docker (for WebAssembly compilation)

### How to Compile Wasm after modifying `tmpfs-cpp`
If you make changes to the C++ code in `tmpfs-cpp` (e.g., adding features or preparing FUSE integrations), you can compile a new Wasm binary by running:
```bash
npm run build:wasm
```
*Alternatively, you can call the underlying script:*
```bash
./scripts/build-wasm.sh /path/to/your/tmpfs-cpp
```
This script will mount the local C++ source files, compile them using Docker + Emscripten, and output the compiled code directly to `src/wasm/tmpfs.js`.

### Extending Terminal Commands
To register new shell commands:
1. **C++ implementation**: If it is a filesystem operation (e.g., `rm` or `mv`), add the method in `tmpfs-cpp`.
2. **Wasm Interface**: Expose the command routing in `src/wasm/wasm_interface.cpp` inside `execute_command`.
3. **JS frontend**: In `TerminalLayout.tsx`, append your command to `wasmCommands` array to route it automatically to Wasm.
4. **Non-filesystem commands**: For frontend-only controls (e.g., themes, GUI swaps), add them directly to the `switch(command)` block in `TerminalLayout.tsx`.

---

## 👾 Retro Pixel Art & Pokémon Aesthetics (Roadmap)

To implement retro GameBoy / Pokémon FireRed aesthetic elements and Easter eggs, here is the architectural strategy:

### 1. Asset Storage & Rendering
- **Crisp Sprite Rendering**: To render retro sprite sheets without browser blurring, apply CSS styles on `<img>` elements:
  ```css
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  ```
- **Sprite Sheets**: Store small retro sprites (e.g. 64x64 pixel sprites of Bulbasaur or Dragonite) in PNG format under `src/assets/sprites/`. They are extremely lightweight (1-2KB per sprite).
- **Fonts**: Use pixelated Google Fonts like `VT323` or `Press Start 2P` for GameBoy dialogue overlays.

### 2. Creative Easter Eggs & Passes
- **`pokemon <name>` CLI Command**: Add a custom terminal command that queries a Pokémon sprite (either local or from the open-source PokéAPI repository). Use Wasm or React to print a pixelated text/ansi art version, or render an inline retro sprite directly in the console response.
- **GBA Dialogue Box Component**: Create a reusable GameBoy-style popup frame with a dark background, a yellow/white border, and letter-by-letter typing animation for project descriptions.
- **Konami Code Activation**: Bind a sequence listener (e.g., `↑ ↑ ↓ ↓ ← → ← → B A`) to trigger a fullscreen retro GameBoy mock frame running a pixelated mini-game or displaying a cute animated Pokémon.

### 3. Sprite Sources & Generation
- **PokéAPI Github Repository**: Front-facing sprites of Gen 1-3 can be pulled directly from raw git urls on [PokeAPI/sprites](https://github.com/PokeAPI/sprites).
- **AI Sprite Generation**: To generate custom pixel-art assets, use stable diffusion models with a `pixel art sprite sheet` LoRA, prompting with `8-bit pixel art sprite, isolated on solid white background`. Use Python scripts to slice sheets or crop backgrounds automatically.
