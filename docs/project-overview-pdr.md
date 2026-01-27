# PGE Project Overview & PDR

## Project Vision

PGE (Pixi Game Engine) is a production-ready, composition-based game engine built on Phaser 3. It provides a lightweight, type-safe framework for developing 2D games with emphasis on component-based architecture, pixel art support, and developer productivity.

## Goals

| Goal | Description |
|------|-------------|
| **Developer Experience** | Provide intuitive APIs with strong TypeScript support and minimal boilerplate |
| **Flexibility** | Component-based design enables easy feature composition without inheritance hierarchies |
| **Performance** | Optimize updates through priority-based ordering and efficient resource pooling |
| **Extensibility** | Well-designed interfaces allow easy addition of custom components and systems |
| **Production Ready** | Thoroughly tested, documented, and suitable for commercial game releases |

## Target Audience

- **Indie Game Developers** - Quick prototyping with minimal setup
- **Web Game Studios** - Production-grade engine for commercial projects
- **Phaser Enthusiasts** - Developers wanting higher-level abstractions over raw Phaser API
- **TypeScript Game Dev** - Type-safe game development experience

## Core Features

### Shipped Features
- **Component-Based Entity System** - ECS-lite architecture with composition over inheritance
- **Scene Management** - BaseScene with standardized lifecycle, asset loading, transitions
- **Transform System** - Hierarchical transforms with local/world coordinate support
- **Sprite Rendering** - Built-in sprite component with animation support
- **Pixel Art Support** - Aseprite loader, pixel renderer, palette variants
- **Physics Integration** - Arcade physics with Collider and RigidBody components
- **Input Management** - Unified keyboard/gamepad handling with action bindings
- **Audio System** - Centralized audio management with volume control
- **Debug Tools** - Profiler, logger, debug overlay for development
- **Event System** - EventBus for decoupled communication between components
- **Spine Animation** - Optional Spine runtime integration for skeletal animation

### Future Enhancements (Planned)
- Particle systems
- Advanced tilemap support
- UI framework improvements
- Network multiplayer support
- Mobile device optimization

## Technical Requirements

### Functional Requirements

| # | Requirement | Priority | Status |
|---|---|---|---|
| FR-1 | Component attachment/detachment lifecycle | Critical | ✓ Complete |
| FR-2 | Priority-based component update ordering | Critical | ✓ Complete |
| FR-3 | Scene asset preloading and transitions | Critical | ✓ Complete |
| FR-4 | Transform hierarchy with local/world coordinates | High | ✓ Complete |
| FR-5 | Sprite animation support | High | ✓ Complete |
| FR-6 | Pixel art rendering with palettes | High | ✓ Complete |
| FR-7 | Arcade physics collision detection | High | ✓ Complete |
| FR-8 | Input action binding system | High | ✓ Complete |
| FR-9 | Centralized audio management | Medium | ✓ Complete |
| FR-10 | Debug profiler and logger | Medium | ✓ Complete |
| FR-11 | Scene-scoped manager lifecycle | Critical | ✓ Complete |
| FR-12 | Type-safe component lookup | Critical | ✓ Complete |

### Non-Functional Requirements

| # | Requirement | Target | Status |
|---|---|---|---|
| NFR-1 | TypeScript type safety | 100% typed exports | ✓ Complete |
| NFR-2 | Zero runtime errors from type violations | 100% coverage | ✓ Complete |
| NFR-3 | Component initialization overhead | < 1ms per component | ✓ Complete |
| NFR-4 | Update frame time (60 FPS) | < 5ms/frame | ✓ Complete |
| NFR-5 | Memory efficiency | Object pooling for reuse | ✓ Complete |
| NFR-6 | API consistency | Uniform patterns across modules | ✓ Complete |
| NFR-7 | Bundle size (@pge/core) | < 100KB minified | ✓ Complete |
| NFR-8 | Documentation coverage | 100% of public APIs | In Progress |

### Technology Stack

| Component | Technology | Version |
|---|---|---|
| **Runtime** | Phaser | 3.90+ |
| **Language** | TypeScript | 5.9+ |
| **Package Manager** | pnpm | Latest |
| **Bundler** | Vite | 7.3+ |
| **Module System** | ESM | Native |
| **Event System** | eventemitter3 | 5.0+ |
| **Aseprite Support** | ase-parser | 0.0.18+ |

### API Design Principles

1. **Composition Over Inheritance** - Extend functionality via components, not class hierarchies
2. **Type Safety** - All public APIs fully typed with no `any` types
3. **Fluent Interfaces** - Methods return `this` for chaining where appropriate
4. **Sensible Defaults** - Components work out-of-the-box with minimal configuration
5. **Explicit Lifecycle** - Clear onAttach/onDetach/update hooks for component lifecycle
6. **Event-Driven** - Decoupled communication via EventBus, not tight dependencies
7. **Scoped Managers** - Managers (InputManager, AudioManager) are scene-scoped via WeakMap
8. **Priority System** - Update ordering through numeric priority, not insertion order

## Constraints & Dependencies

### External Dependencies
- **Phaser 3.90+** - Required peer dependency for core rendering/physics
- **TypeScript 5.9+** - Required for development and type checking
- **pnpm** - Monorepo package manager (workspaces support)

### Build Constraints
- Must maintain CommonJS compatibility for package exports
- Tree-shaking friendly build output
- Source maps for debugging
- Declaration files (.d.ts) alongside all distributable files

### Compatibility
- Modern browsers supporting ES2020+
- Node.js 18+ for build tools
- Optional Spine plugin support (optional peer dependency)

## Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Unit test coverage | > 80% | Not yet measured |
| API documentation | 100% of exports | 70% complete |
| Example implementations | ≥ 5 demo scenes | 4 completed |
| Package download stability | Zero critical bugs | On track |
| Codebase maintainability | Low cyclomatic complexity | Good (avg 2-3) |
| TypeScript strict mode | 100% compliance | 100% compliant |

## Acceptance Criteria

### For v1.0 Release
- [ ] All core features documented
- [ ] Demo game showcases all major systems
- [ ] 80%+ test coverage on critical paths
- [ ] Published to npm @pge/core and @pge/demo-game
- [ ] API stable and backwards compatible

### For Current Phase
- [x] Component system functional
- [x] Scene management with transitions
- [x] Transform hierarchy working
- [x] Sprite/animation components complete
- [x] Pixel art support with Aseprite loader
- [x] Physics integration with Collider/RigidBody
- [x] Input/Audio/Storage managers
- [x] Demo game with 4 scenes
- [ ] Comprehensive documentation (in progress)
- [ ] Full test suite

## Version History

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 0.1.0 | Jan 2025 | In Development | Core systems implemented, demo game showcasing features |
| 1.0.0 | TBD | Planned | Full documentation, test coverage, npm publish |

## Related Documentation

- [Codebase Summary](./codebase-summary.md) - Directory structure and package organization
- [Code Standards](./code-standards.md) - Implementation patterns and conventions
- [System Architecture](./system-architecture.md) - Technical design and data flow
- [Project Roadmap](./project-roadmap.md) - Development timeline and milestones
