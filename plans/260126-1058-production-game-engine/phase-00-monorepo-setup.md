# Phase 0: Monorepo Workspace Setup

## Context Links
- [Plan Overview](./plan.md)
- [Phase 1: Core Architecture](./phase-01-core-architecture.md)

## Overview
- **Priority**: P0 (Critical - Must complete first)
- **Status**: Pending
- **Est**: 0.5 day
- **Description**: Setup npm/pnpm workspace monorepo structure, migrate existing code

## Key Insights
1. pnpm workspaces more efficient than npm (symlinks, disk space)
2. Shared tsconfig.base.json prevents config duplication
3. Engine as `@pge/core` (short, memorable)
4. Demo game consumes engine as workspace dependency

## Requirements

### Functional
- F1: Root workspace config (pnpm-workspace.yaml)
- F2: packages/engine with proper package.json
- F3: packages/demo-game consuming engine
- F4: Shared TypeScript config
- F5: All existing code migrated to packages/engine/src

### Non-Functional
- NF1: `pnpm install` works from root
- NF2: `pnpm dev` runs demo-game with hot reload
- NF3: Engine changes reflect immediately in demo

## Architecture

### Directory Structure
```
pixi-game-engine/
├── packages/
│   ├── engine/                    # @pge/core
│   │   ├── src/
│   │   │   ├── core/              # EventBus, ObjectPool
│   │   │   ├── game-objects/      # GameObject, Component
│   │   │   ├── components/        # Transform, SpriteRenderer...
│   │   │   ├── scenes/            # BaseScene, SceneManager
│   │   │   ├── utils/             # Input, Audio, Storage
│   │   │   ├── debug/             # DevTools
│   │   │   ├── types/             # TypeScript definitions
│   │   │   └── index.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   │
│   └── demo-game/                 # Demo consuming engine
│       ├── src/
│       │   ├── scenes/
│       │   ├── prefabs/
│       │   └── main.ts
│       ├── public/
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       └── index.html
│
├── package.json                   # Workspace root
├── pnpm-workspace.yaml
├── tsconfig.base.json             # Shared TS config
└── .npmrc                         # pnpm settings
```

### Package Names
- Engine: `@pge/core` (scoped, short)
- Demo: `@pge/demo-game` (internal only)

## Related Code Files

### Create (Root)
- `pnpm-workspace.yaml`
- `tsconfig.base.json`
- `.npmrc`
- `package.json` (update to workspace root)

### Create (Engine)
- `packages/engine/package.json`
- `packages/engine/tsconfig.json`
- `packages/engine/vite.config.ts`

### Create (Demo)
- `packages/demo-game/package.json`
- `packages/demo-game/tsconfig.json`
- `packages/demo-game/vite.config.ts`
- `packages/demo-game/index.html`
- `packages/demo-game/src/main.ts`

### Move
- `src/game-objects/*` → `packages/engine/src/game-objects/`
- `src/types/*` → `packages/engine/src/types/`
- `src/demo/*` → `packages/demo-game/src/`
- `src/index.ts` → `packages/engine/src/index.ts`

### Delete (after migration)
- `src/` (old location)

## Implementation Steps

1. **Create workspace root config**
   ```yaml
   # pnpm-workspace.yaml
   packages:
     - 'packages/*'
   ```

2. **Create .npmrc**
   ```ini
   shamefully-hoist=true
   strict-peer-dependencies=false
   ```

3. **Create tsconfig.base.json**
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "module": "ESNext",
       "moduleResolution": "bundler",
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "declaration": true,
       "declarationMap": true,
       "sourceMap": true
     }
   }
   ```

4. **Create packages/engine structure**
   - Create directories
   - Move existing code
   - Create package.json with @pge/core name

5. **Create packages/demo-game structure**
   - Move demo code
   - Add @pge/core as workspace dependency
   - Create Vite config for dev server

6. **Update root package.json**
   - Remove direct dependencies (move to packages)
   - Add workspace scripts

7. **Test workspace**
   - `pnpm install`
   - `pnpm --filter @pge/demo-game dev`

## Todo List
- [ ] Create pnpm-workspace.yaml
- [ ] Create .npmrc
- [ ] Create tsconfig.base.json
- [ ] Create packages/engine directory structure
- [ ] Create packages/engine/package.json
- [ ] Create packages/engine/tsconfig.json
- [ ] Create packages/engine/vite.config.ts
- [ ] Move existing code to packages/engine/src
- [ ] Create packages/demo-game directory structure
- [ ] Create packages/demo-game/package.json
- [ ] Create packages/demo-game/tsconfig.json
- [ ] Create packages/demo-game/vite.config.ts
- [ ] Create packages/demo-game/index.html
- [ ] Move demo code to packages/demo-game/src
- [ ] Update root package.json
- [ ] Run pnpm install
- [ ] Verify dev server works
- [ ] Delete old src/ directory

## Success Criteria
- `pnpm install` completes without errors
- `pnpm --filter @pge/core build` builds engine
- `pnpm --filter @pge/demo-game dev` runs demo
- Hot reload works for both engine and demo changes
- TypeScript types resolve correctly

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Path resolution issues | Medium | Use tsconfig paths |
| pnpm not installed | Low | Document install step |
| Circular deps | Low | Strict package boundaries |

## Dependencies
- pnpm (install globally if not present)

## Next Steps
After Phase 0 complete:
- All subsequent phases use `packages/engine/src/...` paths
- Phase 6 (Packaging) publishes from packages/engine
