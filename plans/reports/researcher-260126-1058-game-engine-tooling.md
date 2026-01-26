# Game Engine Tooling & Developer Experience Research

**Date:** 2026-01-26
**Focus:** Debug overlays, profiling, hot reload, NPM practices, testing strategies

## 1. Debug Overlay Patterns

**Real-time Metrics:**
- FPS counter, frame time, memory usage, object counts
- GameMaker Studio: Built-in F6 debug overlay with visual profiling
- Phaser: Debug Tool browser extension (Chrome/Firefox) with FPS meter
- Wildfire Games: Profiler2 web server for real-time HTML-based analysis

**Implementation:** Draw overlays to canvas (minimal performance impact when disabled); make toggleable via keyboard shortcut.

## 2. Performance Profiling

**Industry Approaches:**
- Thread-aware profiling: Separate main thread vs worker thread analysis (Unity Profiler standard)
- Sample-based vs instrumentation-based: Professional tools like Telemetry 3.5 support both
- Specialized: Intel VTune for Unreal Engine profiling

**For Phaser/TypeScript:** Integrate browser DevTools Performance API alongside custom frame-time tracking.

## 3. Hot Reload Strategy

**Vite HMR Advantages:**
- Update speed: 10-20ms (vs Webpack 500ms-1.6s)
- API: Use `import.meta.hot.accept()` for module updates
- Preserve game state during development iterations (critical for creative workflow)

**Phaser Integration:**
- Official Phaser + Rollup Template supports hot-reloading
- Phaser Launcher includes Game Runner with debug/hot-reload
- Community solutions: Webpack-based hot-reload patterns available

## 4. NPM Package Best Practices

**Exports Configuration:**
- Use modern `exports` field in package.json (official standard)
- Dual format: Export both ESM and CommonJS for compatibility
- Types subfield required: `"types": "dist/index.d.ts"` within exports declaration

**TypeScript Setup:**
- `tsconfig.json`: Enable `"declaration": true` for .d.ts generation
- Create index.ts to export all public APIs
- .gitignore: dist folder | .npmignore: empty (includes dist on publish)

**Declaration Files:** Essential for type-checking consumers; all public APIs require exports.

## 5. Testing Strategies

**Unit Testing:** Isolate single components (movement, AI, collision). Use assertion frameworks (JUnit/NUnit patterns).

**Integration Testing:** Verify component interactions (physics + movement, systems communication). Catches data-flow bugs unit tests miss.

**Automation Layers:**
- Core functionality: Unit + integration tests
- Playtesting: Simulate real player behavior
- Regression: Verify updates don't break existing features

**Game-Specific:** Break engine into testable units (movement systems, state managers, event handlers).

## 6. Architecture Patterns

**Entity-Component-System (ECS):**
- Separates data (Components) from logic (Systems)
- Modular, scalable, efficient for complex game logic

**Folder Structure:**
```
src/
  ├── core/        # Engine foundation
  ├── components/  # ECS components
  ├── systems/     # Game logic
  ├── types/       # TypeScript interfaces
  └── utils/       # Helpers
```

**Design Principles:**
- Separation of Concerns: Each module has single responsibility
- Dependency Injection: Decouple components
- Plugin Architecture: Features as isolated, swappable modules

## Key Recommendations

1. **Tooling:** Implement debug overlay + Vite HMR for fast iteration
2. **Profiling:** Use browser DevTools API + custom frame-time tracking
3. **Publishing:** Configure ESM/CJS exports properly; auto-generate .d.ts
4. **Testing:** Unit tests for core systems; integration tests for interactions
5. **Architecture:** Adopt ECS pattern; organize by feature/responsibility

## Sources

- [Phaser Debug Tool](https://phaser.io/news/2024/10/phaser-debug-tool)
- [GameMaker Performance Troubleshooting](https://www.mindfulchase.com/explore/troubleshooting-tips/game-development-tools/troubleshooting-performance-and-runtime-issues-in-gamemaker-studio-projects.html)
- [Vite HMR API](https://vite.dev/guide/api-hmr)
- [TypeScript NPM Exports Guide](https://www.velopen.com/blog/typescript-npm-package-json-exports/)
- [Game Development Testing Best Practices](https://unity.com/how-to/testing-and-quality-assurance-tips-unity-projects)
- [Building Game Engine with TypeScript](https://medium.com/@ringtved/building-a-game-engine-with-typescript-part-1-getting-started-a2876438a752)
- [TypeScript Game Development Guide 2025](https://generalistprogrammer.com/tutorials/typescript-game-development-complete-guide-2025)
- [Automated Testing in Game Development](https://www.allstarsit.com/blog/automated-testing-in-game-development-from-unit-tests-to-playtests)
- [Profiling Games with Unreal Engine](https://www.intel.com/content/www/us/en/docs/vtune-profiler/cookbook/2025-0/profiling-games-built-with-unreal-engine.html)
- [Publishing ESM-based NPM Packages](https://2ality.com/2025/02/typescript-esm-packages.html)
