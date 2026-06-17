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

export const blogPosts: BlogPost[] = [
  {
    id: 'caldera-core-reboot',
    title: 'Caldera Core: Rebuilding the AR Sandbox C++ Backend from Scratch',
    date: '2026-06-17',
    readTime: '6 min',
    summary: 'First dev log entry detailing the architectural reboot of the AR Sandbox C++ backend. Transitioning to C++20, structuring the hardware abstraction layer (HAL), and laying the foundation for thread-safe sensor capture and validation.',
    category: 'Engineering',
    projectId: 'caldera-core',
    content: `### Rebooting the Architecture

For my bachelor's thesis, I am building **Caldera Core**, an Augmented Reality (AR) Sandbox backend. I recently decided to trash the old codebase and rewrite it from scratch. The goal is to build a high-performance, thread-safe, and well-documented C++ system that can process sensor depth maps, compute stabilized heightmaps, and serve them over network endpoints in real time.

We are standardizing on **C++20** and using **vcpkg** combined with **CMake** for dependency management.

---

### Core Data Models & Checksums

I started by defining our domain models in \`src/core/DataTypes.h\`. They represent the primary data blocks running through our pipeline:
*   \`Point3D\` & \`Point2D\`: Coordinates used for spatial transformation.
*   \`SensorSpecs\`: Hardcoded specifications (FoV, resolution, depth ranges) for sensors like the Microsoft Kinect v1 and Kinect v2.
*   \`RawDepthFrame\` & \`RawColorFrame\`: Direct buffers captured from the sensor.
*   \`StabilizedHeightMap\`: The processed terrain height matrix.
*   \`WorldFrame\`: The final output frame containing the processed heightmap, a timestamp, and a CRC32 checksum.

To prevent sending corrupted or partially written frames downstream, I implemented a custom CRC32 checksum module using the standard IEEE polynomial. This is validated by unit tests in \`tests/CoreTests.cpp\` using **GoogleTest**.

---

### The Sensor HAL & Offline Simulation

A key engineering goal for Caldera is **offline developer velocity**. I don't want to carry a physical Kinect V2 sensor and a projector everywhere just to debug depth filtering logic. 

To solve this, I designed a Hardware Abstraction Layer (HAL) using the \`ISensorDevice\` interface:

\`\`\`cpp
class ISensorDevice {
public:
    virtual ~ISensorDevice() = default;
    virtual bool open() = 0;
    virtual void close() = 0;
    virtual bool isRunning() const = 0;
    virtual std::string getDeviceId() const = 0;
    virtual void setDepthFrameCallback(DepthFrameCallback callback) = 0;
    virtual void setColorFrameCallback(ColorFrameCallback callback) = 0;
};
\`\`\`

Using this interface, I implemented \`SyntheticSensorDevice\`. It spawns a background thread that generates synthetic depth-map patterns (such as plain planes, slopes, or moving waves) at a configurable frame rate (typically ~30 FPS). This mock sensor allows me to run the entire backend pipeline and test math transformations without any hardware connected!

---

### Strict Quality and Documentation Gates

To ensure the codebase stays clean, we enforce strict compile-time checks:
1.  All warnings are treated as errors (\`-Wall -Wextra -Wpedantic -Werror\`).
2.  I wrote a Python validation tool (\`tools/check_docs.py\`) that automatically parses our header files during the CMake build process and verifies that every single public class, method, struct, and field is documented. If anything lacks a Doxygen comment, the build fails!

---

### Next Steps

Our basic runtime, logging via \`spdlog\`, and simulated sensors are fully working. Up next:
1.  Integrate **libfreenect2** to pull real depth and color frames from the Kinect V2 hardware.
2.  Implement coordinate system calibration and projection calculations to transform raw sensor coordinates into sandbox coordinates.`
  },
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
  }
];
