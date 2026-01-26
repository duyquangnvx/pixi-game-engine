# Phase 6: NPM Packaging

## Context Links
- [Plan Overview](./plan.md)
- [Phase 5](./phase-05-dev-tools.md)

## Overview
- **Priority**: P1 (High)
- **Status**: Pending
- **Est**: 1 day
- **Description**: NPM package with proper exports and docs

## Key Insights
1. ESM exports for modern bundlers
2. TypeScript declarations essential
3. Tree-shaking requires proper structure
4. Peer dependency on Phaser

## Requirements

### Functional
- F1: NPM publishable package
- F2: TypeScript declarations
- F3: Tree-shakeable modules
- F4: API documentation

### Non-Functional
- NF1: Under 50KB gzipped (core)
- NF2: Semantic versioning
- NF3: GitHub Actions CI

## Architecture

### Package Exports
```json
{
  "exports": {
    ".": "./dist/index.js",
    "./components": "./dist/components/index.js",
    "./scenes": "./dist/scenes/index.js",
    "./utils": "./dist/utils/index.js",
    "./debug": "./dist/debug/index.js"
  }
}
```

## Related Code Files

### Create
- `docs/README.md`
- `docs/api.md`
- `docs/getting-started.md`
- `CHANGELOG.md`
- `.npmignore`
- `.github/workflows/ci.yml`

### Modify
- `package.json` - exports, peerDeps
- `tsconfig.json` - declaration
- `vite.config.ts` - library mode

## Implementation Steps

1. Configure package.json exports
2. Set up Vite library build
3. Generate TypeScript declarations
4. Write documentation
5. Add .npmignore
6. Set up GitHub Actions
7. Test npm pack locally

## Todo List
- [ ] Configure exports
- [ ] Vite library build
- [ ] Generate .d.ts
- [ ] Write README
- [ ] API documentation
- [ ] .npmignore
- [ ] GitHub Actions
- [ ] npm pack test

## Success Criteria
- npm install works
- TypeScript types work
- Tree-shaking removes unused
- Docs complete
