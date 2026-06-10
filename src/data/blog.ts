export interface BlogPost {
  id: string;
  title: string;
  date: string;
  readTime: string;
  summary: string;
  category: string;
  content: string; // Markdown-friendly content
}

export const blogPosts: BlogPost[] = [
  {
    id: 'vibe-coding-philosophy',
    title: 'The Philosophy of Vibe-Coding vs. Handmade Code',
    date: '2026-06-08',
    readTime: '4 min',
    summary: 'An honest look at the rise of AI-assisted engineering. Why fast iteration shouldn\'t mean losing your fundamental programming muscles.',
    category: 'Engineering',
    content: `### The Rise of the "Vibe-Coder"

With the advent of advanced LLM reasoning models, the speed of web development has skyrocketed. I can describe an interface, and within seconds, I have a fully functioning prototype. This is what we call **Vibe-Coding**: building software at the speed of thought, steering the AI rather than typing syntax.

But this speed comes with a hidden cost: **atrophy of the builder's muscle**.

### Why "Handmade" Still Matters

When you vibe-code, you rely on the LLM to understand context, handle edge cases, and design database schemas. However:
1. **Debugging the Unknown**: When the AI-generated code breaks in a complex way, you cannot fix it unless you understand it at a low, "handmade" level.
2. **Architectural Cohesion**: LLMs are great at local components, but struggle with global architecture.
3. **The Joy of Craft**: There is an intrinsic satisfaction in writing code line-by-line, solving a puzzle, and knowing exactly why every byte is there.

### The Hybrid Approach: ZIJH's Creed

On this site, I classify all my projects into two buckets:
*   🛠️ **Handmade**: Classic engineering, built without AI code-gen. Deep understanding.
*   ⚡ **Vibe-coded**: Highly optimized speed-run projects built in collaboration with AI.

As developers in 2026, we shouldn't reject AI, nor should we become dependent on it. The goal is to master both. Use the vibe to prototype, use the handmade muscle to scale and polish.`
  },
  {
    id: 'dvorak-journey',
    title: 'Rebuilding Muscle Memory: My Dvorak Journey',
    date: '2026-05-28',
    readTime: '3 min',
    summary: 'Why I decided to switch keyboard layouts after years of QWERTY, the pain of the transition, and how I built a custom trainer to help.',
    category: 'Productivity',
    content: `### Why Switch layouts?

I've been typing on QWERTY since I was a kid. I could hit 95-100 WPM without looking. So why subject myself to the torture of switching to **Dvorak**?

Two words: **Ergonomics and Flow**.

QWERTY was designed to prevent physical typewriter jams by placing common letters far apart. Dvorak, on the other hand, puts the most common keys on the home row (AOEUIDHTNS). Your fingers travel significantly less.

### The Pain of the Transition

The first week of Dvorak is brutal. Your brain knows what it wants to write, but your fingers refuse to move. You feel like you've forgotten how to spell. Typing a simple git command takes 30 seconds.

To make my practice more structured, I built a simple **Dvorak Keyboard Trainer** (which you can find in my projects section). It uses custom letter pools (starting with home row keys only) to slowly build muscle memory.

### Current Status

I'm currently writing paragraphs with home-row constraints. The speed is slowly picking up. Is it worth it? Yes. Even at a lower speed, my hands feel much more relaxed, and the typing motion feels like playing a smooth instrument rather than hammering on plastic.

If you're thinking of switching: be prepared for 2 weeks of frustration, but your wrists will thank you later.`
  }
];
