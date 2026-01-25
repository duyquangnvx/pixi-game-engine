# Phase 05: Asset System

## Context Links
- [Plan Overview](./plan.md)
- [PixiJS Ecosystem Libraries](../reports/researcher-260125-2338-pixi-ecosystem-libs.md)

## Overview
- **Priority**: High
- **Status**: Pending
- **Description**: Wrap PixiJS Assets API with game-friendly interface

## Key Insights
- PixiJS Assets API (v7) handles loading natively
- Built-in caching (never loads same asset twice)
- Bundle-based loading with manifests
- Progress callbacks via Assets.loadBundle

**We wrap existing API, not build from scratch.**

## Requirements

### Functional
- Load textures, spritesheets, fonts, JSON, audio via bundles
- Track loading progress (0-1)
- Get assets by alias
- Unload unused bundles

### Non-Functional
- Thin wrapper over PixiJS Assets
- TypeScript type safety
- Minimal overhead

## Architecture

```typescript
AssetManager (thin wrapper)
├── init(manifest)     → Assets.init({ manifest })
├── loadBundle(id)     → Assets.loadBundle(id, onProgress)
├── get<T>(alias)      → Assets.get<T>(alias)
├── unloadBundle(id)   → Assets.unloadBundle(id)
└── getProgress()      → Current loading progress
```

## Related Code Files

### Create
- `src/assets/asset-manager.ts` - Thin wrapper (~80 lines)
- `src/types/asset.types.ts` - Asset type definitions (~30 lines)

## Implementation Steps

1. Create `src/types/asset.types.ts`:
   - AssetManifest type (re-export from PixiJS)
   - AssetBundle type
   - LoadProgress callback type

2. Create `src/assets/asset-manager.ts`:
   - Singleton or static class
   - init(manifest): Promise<void>
     - Call Assets.init({ manifest })
   - loadBundle(bundleId, onProgress?): Promise<void>
     - Call Assets.loadBundle(bundleId, onProgress)
   - get<T>(alias): T
     - Return Assets.get<T>(alias)
   - getTexture(alias): PIXI.Texture
     - Type-safe shortcut
   - unloadBundle(bundleId): void
     - Call Assets.unloadBundle(bundleId)
   - Optional: backgroundLoadBundle for preloading

3. Integrate with Game:
   - Add AssetManager.init() in Game.initialize()

## Todo List

- [ ] Create asset.types.ts
- [ ] Create asset-manager.ts
- [ ] Implement init with manifest
- [ ] Implement loadBundle with progress
- [ ] Implement get with type safety
- [ ] Implement unloadBundle
- [ ] Integrate with Game
- [ ] Test loading flow

## Success Criteria

- Assets load via bundles
- Progress updates during load
- get() returns typed assets
- Unload frees memory
- No errors in console

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Load failure crashes | Medium | Catch and report errors |
| Progress not updating | Low | Force progress events |

## Next Steps

- Proceed to Phase 06: Audio System
