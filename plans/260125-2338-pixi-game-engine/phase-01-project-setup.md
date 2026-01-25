# Phase 01: Project Setup

## Context Links
- [Plan Overview](./plan.md)
- [TypeScript/Vite Research](../reports/researcher-260125-2338-typescript-vite-setup.md)
- [PixiJS Ecosystem Libraries](../reports/researcher-260125-2338-pixi-ecosystem-libs.md)

## Overview
- **Priority**: Critical
- **Status**: Pending
- **Description**: Initialize project with Vite, TypeScript, PixiJS v7, GSAP, and ecosystem libs

## Key Insights
- Vite provides fast HMR and native ESM support
- TypeScript strict mode catches bugs early
- Path aliases improve import readability
- Ecosystem libraries reduce 70% implementation scope

## Requirements

### Functional
- Project builds and runs with `npm run dev`
- TypeScript strict mode enabled
- Path aliases work (@core/*, @scenes/*, etc.)
- All dependencies properly bundled

### Non-Functional
- Build time < 5 seconds
- Dev server starts < 2 seconds
- No TypeScript errors in strict mode

## Architecture

```
pixi-game-engine/
├── src/
│   ├── core/
│   ├── scenes/
│   ├── input/
│   ├── assets/
│   ├── audio/
│   ├── animation/
│   ├── objects/
│   ├── utils/
│   ├── types/
│   └── index.ts
├── public/
│   └── assets/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

## Related Code Files

### Create
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite build configuration
- `index.html` - Entry HTML file
- `src/main.ts` - Application entry point
- `src/types/index.ts` - Shared type definitions

## Implementation Steps

1. Initialize npm project with `npm init -y`

2. Install core dependencies:
   ```bash
   npm install pixi.js@^7.4.0 gsap@^3.12.0
   ```

3. Install ecosystem dependencies:
   ```bash
   npm install @esotericsoftware/spine-pixi-v7 @pixi/sound @pixi/particle-emitter
   ```

4. Install dev dependencies:
   ```bash
   npm install -D typescript vite @types/node
   ```

5. Create `tsconfig.json`:
   - target: ESNext
   - module: ESNext
   - strict: true
   - path aliases: @core/*, @scenes/*, @input/*, etc.

6. Create `vite.config.ts`:
   - Manual chunks for pixi, gsap, spine
   - Base path for relative imports

7. Create `index.html` with canvas container

8. Create `src/main.ts` as entry point

9. Create `src/types/index.ts` with base type definitions

10. Create folder structure for all modules

11. Update `package.json` scripts:
    - dev: vite
    - build: tsc && vite build
    - preview: vite preview

12. Test build and dev server

## Todo List

- [ ] Initialize npm project
- [ ] Install pixi.js and gsap
- [ ] Install spine, sound, particle-emitter
- [ ] Install typescript and vite
- [ ] Create tsconfig.json with path aliases
- [ ] Create vite.config.ts
- [ ] Create index.html
- [ ] Create src/main.ts
- [ ] Create src/types/index.ts
- [ ] Create folder structure
- [ ] Verify build works
- [ ] Verify dev server works

## Success Criteria

- `npm run dev` starts without errors
- `npm run build` produces dist folder
- No TypeScript compilation errors
- Path aliases resolve correctly
- PixiJS creates canvas element
- All npm packages import correctly

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Vite top-level await issue | Medium | Wrap async code in functions |
| Package version conflicts | Medium | Pin exact versions |

## Next Steps

- Proceed to Phase 02: Core Engine
