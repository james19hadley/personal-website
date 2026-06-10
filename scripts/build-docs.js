import fs from 'fs';
import path from 'path';

const SRC_DIR = './src';
const OUTPUT_FILE = './docs/ARCHITECTURE.md';

// Create docs directory if it doesn't exist
const docsDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

// Helper to recursively list files
function getFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getFiles(filePath, files);
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      files.push(filePath);
    }
  }
  return files;
}

const allFiles = getFiles(SRC_DIR);
const components = [];
const hooks = [];

// JSDoc parse regex
const jsDocBlockRegex = /\/\*\*([\s\S]*?)\*\//g;

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  let match;
  
  while ((match = jsDocBlockRegex.exec(content)) !== null) {
    const block = match[1];
    
    // Check if it's a @component or @hook
    const isComponent = block.includes('@component');
    const isHook = block.includes('@hook');
    
    if (!isComponent && !isHook) continue;
    
    // Parse name
    const nameMatch = isComponent ? block.match(/@component\s+([a-zA-Z0-9_]+)/) : block.match(/@hook\s+([a-zA-Z0-9_]+)/);
    const name = nameMatch ? nameMatch[1].trim() : path.basename(file, path.extname(file));
    
    // Parse description
    const descMatch = block.match(/@description\s+([\s\S]*?)(?=@|$)/);
    const description = descMatch ? descMatch[1].replace(/^\s*\* ?/gm, '').trim() : 'No description provided.';
    
    // Parse params
    const params = [];
    const paramRegex = /@param\s+(?:{([^}]+)})?\s*([a-zA-Z0-9_]+)?\s*-\s*(.*)/g;
    let pMatch;
    while ((pMatch = paramRegex.exec(block)) !== null) {
      params.push({
        type: pMatch[1] ? pMatch[1].trim() : 'any',
        name: pMatch[2] ? pMatch[2].trim() : 'param',
        desc: pMatch[3].trim()
      });
    }
    
    // Parse returns
    const returnsMatch = block.match(/@returns\s+(?:{([^}]+)})?\s*(.*)/);
    const returns = returnsMatch ? {
      type: returnsMatch[1] ? returnsMatch[1].trim() : 'void',
      desc: returnsMatch[2].trim()
    } : null;
    
    const entry = {
      name,
      file: file.replace(/\\/g, '/'),
      description,
      params,
      returns
    };
    
    if (isComponent) {
      components.push(entry);
    } else {
      hooks.push(entry);
    }
  }
});

// Now generate Markdown
let markdown = `# Codebase Architecture Map (Auto-generated)

This file contains the auto-generated layout registry of major components, hooks, and directory structures. It updates automatically when compiling the project.

---

## 📁 Directory Structure

Below is an overview of the key directories in the project:

- \`src/\` - Core application source code.
  - \`src/components/\` - Modular UI layout views (Home, Projects, Blog, Space, Terminal, GameBoy console).
  - \`src/hooks/\` - Custom React hooks for global features like keyboard navigation.
  - \`src/data/\` - Structured static data models (blog posts, projects list).
  - \`src/wasm/\` - Emscripten compiled WebAssembly artifacts for the C++ virtual filesystem (\`tmpfs-cpp\`).
- \`scripts/\` - Utility execution scripts (compilers, documentation builders).
- \`notes/\` - Developer journals and layout optimization logs.

---

## 🛠️ Components Registry

Component details extracted from code JSDoc annotations:

`;

components.forEach(comp => {
  markdown += `### 🧩 \`${comp.name}\`
- **Source File**: [${path.basename(comp.file)}](file://${path.resolve(comp.file)})
- **Description**: ${comp.description}
`;
  if (comp.params.length > 0) {
    markdown += `- **Props / Parameters**:\n`;
    comp.params.forEach(p => {
      markdown += `  - \`${p.name}\` (\`${p.type}\`): ${p.desc}\n`;
    });
  }
  markdown += `\n`;
});

markdown += `---

## ⚓ Custom Hooks Registry

Custom hooks details extracted from code JSDoc annotations:

`;

hooks.forEach(hook => {
  markdown += `### 🎣 \`${hook.name}\`
- **Source File**: [${path.basename(hook.file)}](file://${path.resolve(hook.file)})
- **Description**: ${hook.description}
`;
  if (hook.params.length > 0) {
    markdown += `- **Parameters**:\n`;
    hook.params.forEach(p => {
      markdown += `  - \`${p.name}\` (\`${p.type}\`): ${p.desc}\n`;
    });
  }
  if (hook.returns) {
    markdown += `- **Returns** (\`${hook.returns.type}\`): ${hook.returns.desc}\n`;
  }
  markdown += `\n`;
});

markdown += `---

*Last generated: ${new Date().toISOString()}*
`;

fs.writeFileSync(OUTPUT_FILE, markdown);
console.log(`Successfully generated architecture documentation at ${OUTPUT_FILE}`);
