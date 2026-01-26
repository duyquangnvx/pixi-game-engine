# Game Engine Architecture Research: Production-Ready 2D Wrapper on PhaserJS

**Date:** 2026-01-26
**Focus:** Component systems, scene management, asset loading, event systems, object pooling

---

## 1. Component System Patterns

### ECS (Entity-Component-System) vs Traditional Approach

**Phaser 4 Direction:** Phaser 4 (beta 5, Jan 2025) officially adopts bitECS, a functional, data-oriented ECS using TypedArrays for ultra-high performance. All Game Objects are entities with components (Transform, Color, Permissions, Hierarchy).

**Phaser 3 Reality:** Phaser 3 uses traditional Game Objects (class-based). Community ECS implementations exist (bitECS, phaser-ecs) but aren't native.

**Recommendation:**
- **For Phaser 3 wrapper:** Use composition-based design (Game Object extends base, components added as mixins/properties)
- **Migration path to Phaser 4:** Design wrapper to be ECS-compatible; leverage Phaser 4's native ECS when available
- **Performance:** TypedArray-based ECS provides cache-efficient iteration over large entity counts

**Sources:** [Phaser 4 ECS Architecture](https://phaser.io/news/2014/12/entity-component-system), [bitECS Example](https://github.com/ourcade/phaser3-bitecs-getting-started)

---

## 2. Scene Management Best Practices

### Architecture
- Each scene owns systems: input, tweens, game objects, display list, cameras
- Scenes are self-contained "Game Worlds" with minimal coupling

### Key Patterns
1. **Consistent Scene Keys:** Use 'MainMenu', 'Level1' (strings as identifiers)
2. **Lifecycle Hooks:** `preload()` → `create()` → `update()` → `shutdown()`
3. **Resource Cleanup:** Call `scene.shutdown()` to release memory; implement fallbacks for missing content
4. **Scene Communication:** Use Registry (global DataManager) or Scene Manager, avoid direct references

### Production Practices
- Emit 'current-scene-ready' in `create()` for synchronization
- Use `pause()` (visible, no update) vs `sleep()` (no update/render) strategically
- Verify scene parameters in `init()` to catch errors early
- Minimize dependencies between scenes for independent testing

**Sources:** [Official Scene Docs](https://docs.phaser.io/phaser/concepts/scenes), [Scene Lifecycle](https://deepwiki.com/phaserjs/phaser/3.1-scene-lifecycle)

---

## 3. Asset Loading Strategies

### Phaser Cache System
- **Global Scope:** Assets cached in one scene available to all (persists until game destroyed)
- **Type-Specific Caches:** Separate caches for images, JSON, audio, binary, etc.
- **Queue-Based Loading:** Sequential processing; efficient for multi-scene games

### Production Optimization
1. **Shared Assets:** Load in "boot" or "preloader" scene (e.g., UI fonts, core sprites)
2. **Scene-Specific Assets:** Load in scene's `preload()`; remove on `shutdown()`
3. **Compression:** Use Squoosh (images), ffmpeg (audio) to reduce sizes
4. **Lazy Loading:** Check cache before loading; load on-demand (sounds, optional assets)
5. **Cache Busting:** Add timestamp query params to asset URLs for cache invalidation

### Performance Metrics
Asset size is the primary culprit in slow loading. Compression + lazy loading + smart preloading yield significant gains.

**Sources:** [Official Cache Docs](https://docs.phaser.io/phaser/concepts/loader/cache), [Optimization Guide 2025](https://franzeus.medium.com/how-i-optimized-my-phaser-3-action-game-in-2025-5a648753f62b)

---

## 4. Event System Design

### Recommended Pattern: Pub/Sub + Event Queue

**Architecture:**
- **Event Bus:** Central dispatcher; holds list of subscriber callbacks per event type
- **Publisher:** Any code emits events (decoupled from subscribers)
- **Subscriber:** Registers handler function (member function or lambda)
- **Queue:** Store events; dispatch during update phase (prevents frame drops)

### Design Principles
- **Loose Coupling:** Physics doesn't reference achievements, yet communicates via events
- **Many-to-Many:** One event → multiple subscribers; one subscriber → multiple events
- **ECS Integration:** Each system subscribes to relevant events; game loop dispatches queued events

### Implementation Strategy
1. Use Phaser's built-in EventEmitter for scene/object events
2. Wrap in custom EventBus for engine-level pub/sub (decoupled from Phaser specifics)
3. Queue game-critical events; dispatch asynchronously to avoid timing issues
4. Log event flow for debugging complex interactions

**Sources:** [Event Queue Pattern](https://gameprogrammingpatterns.com/event-queue.html), [Observer Pattern](https://gameprogrammingpatterns.com/observer.html), [Event-Driven Architecture](https://medium.com/@ahmadrezakml/event-driven-architecture-in-game-development-unity-gamemaker-c76915361ff0)

---

## 5. Object Pooling Patterns

### Problem & Solution
**Problem:** Allocating/deallocating objects every frame → memory fragmentation, GC pauses, frame drops
**Solution:** Pre-allocate fixed-size pool; reuse objects (set "in use" ↔ "not in use" states)

### Implementation Strategy
1. **Pool Initialization:** Create entire collection upfront in contiguous memory
2. **Allocation:** Request object from pool; mark as "in use"; initialize state
3. **Deallocation:** Mark as "not in use"; reset properties (no actual destruction)
4. **Pool Sizing:** Estimate peak entity count (e.g., max bullets × 2); dynamically expand if needed

### Key Benefits
- **CPU Cache Optimization:** Objects packed together keep cache full during iteration
- **Reduced GC:** No allocation/deallocation per frame
- **High Entity Density:** Support bullet-hell shooters, effect-rich scenes without performance penalty
- **Predictable Performance:** No frame-rate spikes from memory operations

### Ideal Use Cases
- Bullets, particles, enemies, temporary effects, non-visible data structures
- Any frequent create/destroy pattern during gameplay

**Sources:** [Object Pool Pattern](https://gameprogrammingpatterns.com/object-pool.html), [Unity Implementation Guide](https://learn.unity.com/tutorial/introduction-to-object-pooling), [Performance Optimization](https://outscal.com/blog/unreal-engine-object-pooling)

---

## Summary: Architecture Pillars

| Pillar | Approach | Rationale |
|--------|----------|-----------|
| **Components** | Composition-based on Phaser 3; ECS-ready for Phaser 4 | Future-proof; Phaser 4 uses bitECS |
| **Scenes** | Self-contained with Registry-based communication | Scalability; reduced memory leaks |
| **Assets** | Shared preload + lazy loading + compression | Balanced load times and memory usage |
| **Events** | Pub/Sub bus with queued dispatch | Loose coupling; deterministic frame timing |
| **Pooling** | Pre-allocated fixed pools per entity type | Predictable performance; high entity density |

---

**Research Confidence:** High. Sources include official Phaser docs, Game Programming Patterns (authoritative reference), production optimization case studies (2025), and community standards.
