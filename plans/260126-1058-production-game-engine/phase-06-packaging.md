# Phase 6: NPM Packaging (Monorepo)

## Context Links
- [Plan Overview](./plan.md)
- [Phase 0: Monorepo Setup](./phase-00-monorepo-setup.md)
- [Phase 5](./phase-05-dev-tools.md)

## Overview
- **Priority**: P1 (High)
- **Status**: Pending
- **Est**: 1 day
- **Description**: Publish @pge/core from monorepo workspace

## Key Insights
1. Build from `packages/engine/` workspace
2. pnpm publish with workspace protocol handling
3. Changesets for versioning across packages
4. GitHub Actions builds both packages, publishes engine only

## Requirements

### Functional
- F1: `@pge/core` publishable to npm
- F2: TypeScript declarations bundled
- F3: Tree-shakeable sub-path exports
- F4: API documentation

### Non-Functional
- NF1: Under 50KB gzipped (core)
- NF2: Semantic versioning with changesets
- NF3: GitHub Actions CI/CD

## Architecture

### Package Exports (@pge/core)
```json
{
  "name": "@pge/core",
  "exports": {
    ".": "./dist/index.js",
    "./components": "./dist/components/index.js",
    "./scenes": "./dist/scenes/index.js",
    "./utils": "./dist/utils/index.js",
    "./debug": "./dist/debug/index.js"
  },
  "peerDependencies": {
    "phaser": "^3.90.0"
  }
}
```

### CI/CD Flow
```
push → build all → test → (main only) publish @pge/core
```

## Related Code Files

> **Note**: Paths relative to repo root

### Create
- `packages/engine/README.md`
- `packages/engine/.npmignore`
- `.github/workflows/ci.yml`
- `.github/workflows/publish.yml`
- `.changeset/config.json`
- `docs/api.md`
- `docs/getting-started.md`
- `CHANGELOG.md`

### Modify
- `packages/engine/package.json` - exports, peerDeps, publishConfig
- `packages/engine/tsconfig.json` - declaration output
- `packages/engine/vite.config.ts` - library mode build

## Implementation Steps

1. **Configure engine package.json**
   - Add exports map
   - Add peerDependencies (phaser)
   - Add publishConfig for npm

2. **Set up Vite library build**
   ```typescript
   // packages/engine/vite.config.ts
   export default defineConfig({
     build: {
       lib: {
         entry: resolve(__dirname, 'src/index.ts'),
         formats: ['es'],
         fileName: 'index'
       },
       rollupOptions: {
         external: ['phaser']
       }
     }
   })
   ```

3. **Configure changesets**
   ```bash
   pnpm add -Dw @changesets/cli
   pnpm changeset init
   ```

4. **GitHub Actions CI**
   - Build both packages
   - Run tests
   - Publish on release

5. **Write documentation**

6. **Test publish locally**
   ```bash
   cd packages/engine
   pnpm pack
   # verify tarball contents
   ```

## Todo List
- [ ] Configure engine package.json exports
- [ ] Set up Vite library build
- [ ] Generate .d.ts declarations
- [ ] Configure changesets
- [ ] Create GitHub Actions CI workflow
- [ ] Create GitHub Actions publish workflow
- [ ] Write engine README
- [ ] API documentation
- [ ] .npmignore for engine
- [ ] Test pnpm pack locally

## Success Criteria
- `pnpm --filter @pge/core build` creates dist/
- `pnpm --filter @pge/core pack` creates valid tarball
- TypeScript types resolve when installed
- Tree-shaking removes unused exports
- CI passes on all PRs
- Publish works on tagged releases

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Workspace protocol in deps | Medium | publishConfig + pnpm publish handles |
| Breaking changes | High | Changesets + semantic versioning |
| CI publish failures | Medium | Dry-run before actual publish |

## Dependencies
- Phase 0 (Monorepo Setup) - workspace must exist
- `@changesets/cli` - version management
