# Phase 01: Project Setup

## Context Links
- [Plan Overview](./plan.md)

## Overview
- **Priority**: Critical
- **Status**: Pending
- **Est**: 30 minutes
- **Description**: Initialize TypeScript + Vite + Phaser project

## Requirements

### Functional
- npm project with TypeScript strict mode
- Vite dev server with HMR
- Phaser 3.90.x installed
- Path aliases configured (@game-objects/*, @types/*)

### Non-Functional
- Dev server starts < 2s
- HMR works for .ts files

## Related Code Files

### Create
- `package.json` - Dependencies
- `tsconfig.json` - TypeScript config
- `vite.config.ts` - Vite setup
- `index.html` - Entry HTML
- `src/index.ts` - Library entry (empty placeholder)

## Implementation Steps

1. Initialize npm project:
   ```bash
   npm init -y
   ```

2. Install dependencies:
   ```bash
   npm install phaser
   npm install -D typescript vite @types/node
   ```

3. Create `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "module": "ESNext",
       "moduleResolution": "bundler",
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "outDir": "dist",
       "rootDir": "src",
       "declaration": true,
       "paths": {
         "@game-objects/*": ["./src/game-objects/*"],
         "@types/*": ["./src/types/*"]
       }
     },
     "include": ["src/**/*"]
   }
   ```

4. Create `vite.config.ts`:
   ```typescript
   import { defineConfig } from 'vite';
   import { resolve } from 'path';

   export default defineConfig({
     resolve: {
       alias: {
         '@game-objects': resolve(__dirname, 'src/game-objects'),
         '@types': resolve(__dirname, 'src/types'),
       },
     },
   });
   ```

5. Create `index.html`:
   ```html
   <!DOCTYPE html>
   <html>
   <head>
     <title>Phaser Component System</title>
     <style>body { margin: 0; }</style>
   </head>
   <body>
     <script type="module" src="/src/demo/main.ts"></script>
   </body>
   </html>
   ```

6. Create placeholder files:
   - `src/index.ts` - export {}
   - `src/demo/main.ts` - console.log('ready')

7. Add npm scripts to package.json:
   ```json
   "scripts": {
     "dev": "vite",
     "build": "tsc && vite build",
     "preview": "vite preview"
   }
   ```

## Todo List

- [ ] npm init
- [ ] Install phaser, typescript, vite
- [ ] Create tsconfig.json
- [ ] Create vite.config.ts
- [ ] Create index.html
- [ ] Create placeholder src files
- [ ] Verify `npm run dev` works

## Success Criteria

- `npm run dev` starts Vite server
- No TypeScript errors
- Browser shows console.log output
- HMR reloads on file changes

## Next Steps

- Proceed to Phase 02: Core Implementation
