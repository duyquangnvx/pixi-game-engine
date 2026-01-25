# PixiJS v7 Ecosystem Libraries Research Report

**Date**: 2026-01-25
**Focus**: Identifying existing libraries to reduce implementation scope
**Work Context**: D:/Workspace/Personal/Code/pixi-game-engine

---

## Executive Summary

**Recommendation**: Leverage existing libraries for 70% of functionality, build custom wrappers for 30%.

**Key Findings**:
- PixiJS v7 has mature ecosystem with production-ready libraries
- Assets, Events, Spine, Sound, Particles have official/stable solutions
- Scene management and some input handling require custom implementation
- Tweening best handled by GSAP (industry standard)

---

## 1. Assets Management

### **PixiJS Assets API (Built-in)**
- **Package**: Built into `pixi.js` v7+
- **Status**: ✅ Official, production-ready
- **Compatibility**: Native to PixiJS v7

**Installation**: Already included in PixiJS v7

**Usage Example**:
```javascript
import { Assets } from 'pixi.js';

const manifest = {
  bundles: [
    {
      name: 'game-screen',
      assets: [
        { alias: 'character', src: 'robot.png' },
        { alias: 'enemy', src: 'bad-guy.png' }
      ]
    }
  ]
};

await Assets.init({ manifest });
const assets = await Assets.loadBundle('game-screen');
```

**Features**:
- Promise-based loading
- Bundle management with manifests
- Automatic caching (never loads same asset twice)
- Background loading support
- Supports: images, sprite sheets, bitmap fonts, web fonts, JSON
- Extensible with custom parsers

**Recommendation**: ✅ **USE** - Wrap with our AssetManager for game-specific API

---

## 2. Event System

### **eventemitter3 (Built-in)**
- **Package**: Integrated into PixiJS v7
- **Status**: ✅ Official, production-ready
- **Compatibility**: Native to PixiJS v7

**Installation**: Already included in PixiJS v7

**Key Changes in v7**:
- Replaced `InteractionManager` with `FederatedEvents`
- Added DOM-like `addEventListener`/`removeEventListener` APIs
- New `eventMode` property (replaces `interactive`)

**Usage Example**:
```javascript
sprite.eventMode = 'dynamic';
sprite.on('pointerdown', onClick);
// Or DOM-style
sprite.addEventListener('click', onClick);
```

**Recommendation**: ✅ **USE** - Wrap with our EventManager for consistent API

---

## 3. Animation: Spine Support

### **@esotericsoftware/spine-pixi-v7** (Official)
- **Package**: `@esotericsoftware/spine-pixi-v7`
- **Version**: 4.2.95
- **Status**: ✅ Official Esoteric Software runtime
- **Compatibility**: PixiJS v7, Spine 3.7-4.1

**Installation**:
```bash
npm i @esotericsoftware/spine-pixi-v7
```

**Features**:
- WebGL rendering (WebGPU in v8)
- Supports Spine 3.7, 3.8, 4.0, 4.1
- Official from Spine creators

**Alternative**: `pixi-spine` (community, supports same Spine versions)

**Recommendation**: ✅ **USE** - Official package preferred, wrap in our SpineManager

---

## 4. Animation: Tweening

### **GSAP with PixiPlugin**
- **Package**: `gsap` + `PixiPlugin`
- **Status**: ✅ Industry standard, production-ready
- **Compatibility**: Full PixiJS v7 support

**Installation**:
```bash
npm i gsap
```

**Usage Example**:
```javascript
import { gsap } from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';

gsap.registerPlugin(PixiPlugin);

gsap.to(sprite, {
  pixi: { x: 200, y: 100, rotation: 90 },
  duration: 1,
  ease: 'power2.out'
});
```

**Advantages**:
- Simplifies PixiJS properties (position.x → x)
- Auto-converts degrees to radians
- Timeline support
- Industry standard with massive ecosystem

**Alternative**: `pixi-tween` (lightweight, PixiJS-specific, less maintained)

**Recommendation**: ✅ **USE GSAP** - Industry standard, excellent performance

---

## 5. Scene Management

### **Available Libraries**:
1. **pixi-scenes** (florisdh) - Last updated years ago
2. **pixi-scenegraph** (enriko-riba) - For PixiJS v8
3. **pixi-engine** (gamestdio) - Minimal, Unity-inspired

**Status**: ❌ No mature v7-specific solution

**Recommendation**: ❌ **BUILD CUSTOM** - Existing libraries outdated or v8-only

**Why Build**:
- Scene lifecycle needs (init, start, update, destroy)
- Scene transitions and state management
- Integration with our AssetManager for per-scene loading
- Game-specific requirements (pause, resume, serialization)

---

## 6. Input Handling

### **Built-in PixiJS Events** (Mouse/Touch)
- **Package**: Built into PixiJS v7
- **Status**: ✅ Official, production-ready

**Features**:
- Unified pointer events (mouse + touch)
- DOM-like event model
- Full touch gesture support

**Recommendation**: ✅ **USE** for mouse/touch input

### **Keyboard Input Libraries**:

**Option A: pixijs-input-devices**
- **Package**: `pixijs-input-devices`
- **Status**: Modern, actively maintained
- **Features**: Keyboard, gamepads, mobile detection

**Option B: pixi.js-keyboard**
- **Package**: `pixi.js-keyboard`
- **Status**: ⚠️ Last updated 4 years ago

**Installation** (Option A):
```bash
npm i pixijs-input-devices
```

**Usage**:
```javascript
import { InputDevice } from 'pixijs-input-devices';

if (InputDevice.keyboard.isKeyDown('Space')) {
  // Jump
}

if (InputDevice.isMobile) {
  // Show touch controls
}
```

**Recommendation**: ⚠️ **EVALUATE** - Use `pixijs-input-devices` if robust, otherwise build minimal wrapper

---

## 7. Audio

### **@pixi/sound** (Official)
- **Package**: `@pixi/sound`
- **Version**: Latest compatible with v7
- **Status**: ✅ Official PixiJS plugin
- **Weekly Downloads**: ~371

**Installation**:
```bash
npm i @pixi/sound
```

**Usage Example**:
```javascript
import { sound } from '@pixi/sound';

sound.add('explosion', 'assets/sounds/explosion.mp3');
sound.play('explosion');

// With options
sound.play('music', {
  volume: 0.5,
  loop: true
});
```

**Features**:
- Web Audio API
- Volume control, pause/resume
- Audio filters (reverb, distortion, equalizer)
- PixiJS Assets integration
- Sprite sheets for sound effects

### **Howler.js** (Alternative)
- **Package**: `howler`
- **Status**: ✅ Industry standard
- **Weekly Downloads**: ~523,965 (1,413x more popular)

**Advantages**:
- More mature, widely tested
- Better documentation
- Audio sprite support
- Spatial audio

**Disadvantages**:
- Requires integration middleware for PixiJS
- Not native to PixiJS ecosystem

**Recommendation**: ⚠️ **DECISION NEEDED**
- Use `@pixi/sound` for tight PixiJS integration
- Use `Howler.js` for more features and maturity
- **Suggested**: Start with `@pixi/sound`, migrate to Howler.js if needed

---

## 8. Particle Systems

### **@pixi/particle-emitter** (Official)
- **Package**: `@pixi/particle-emitter`
- **Status**: ✅ Official, production-ready
- **Compatibility**: PixiJS v6+ (v7 supported)

**Installation**:
```bash
npm i @pixi/particle-emitter
```

**Features**:
- Behavior-based configuration
- Visual editor: particle-emitter-editor.pixijs.io
- Auto-upgrade from old configs with `upgradeConfig()`

**Note**: Formerly `pixi-particles` (renamed in v5)

**Recommendation**: ✅ **USE** - Official, excellent tooling with visual editor

---

## Implementation Scope Reduction

### **Libraries to Use (70% of functionality)**:
1. ✅ **Assets**: PixiJS Assets API (built-in)
2. ✅ **Events**: PixiJS FederatedEvents (built-in)
3. ✅ **Spine**: `@esotericsoftware/spine-pixi-v7`
4. ✅ **Tweening**: `gsap` with PixiPlugin
5. ✅ **Particles**: `@pixi/particle-emitter`
6. ✅ **Input (Mouse/Touch)**: PixiJS built-in
7. ⚠️ **Audio**: `@pixi/sound` (or `Howler.js`)
8. ⚠️ **Input (Keyboard)**: `pixijs-input-devices` (evaluate first)

### **Custom Implementation Needed (30%)**:
1. ❌ **Scene Management**: Build custom (lifecycle, transitions, state)
2. ❌ **Game Loop**: Build custom (update, fixed timestep, pause)
3. ❌ **Entity Component System**: Build if needed
4. ❌ **Physics**: Integrate Matter.js or build simple AABB
5. ❌ **UI Components**: Build game-specific UI layer
6. ❌ **Save/Load**: Build custom serialization
7. ⚠️ **Input Manager**: Thin wrapper if `pixijs-input-devices` insufficient

---

## Recommended Package Installation

```bash
# Core PixiJS (if not installed)
npm i pixi.js

# Animation
npm i gsap @esotericsoftware/spine-pixi-v7

# Effects
npm i @pixi/particle-emitter

# Audio
npm i @pixi/sound

# Input (evaluate first)
npm i pixijs-input-devices
```

---

## Sources

- [PixiJS v7 Assets API Documentation](https://pixijs.download/v7.x/docs/PIXI.Assets.html)
- [PixiJS Assets Guide](https://pixijs.com/8.x/guides/components/assets)
- [PixiJS v7 Migration Guide](https://pixijs.com/8.x/guides/migrations/v7)
- [eventemitter3 Integration](https://github.com/pixijs/pixijs/issues/9349)
- [PixiJS Interaction Guide](https://pixijs.com/8.x/guides/components/interaction)
- [@esotericsoftware/spine-pixi-v7 npm](https://www.npmjs.com/package/@esotericsoftware/spine-pixi-v7)
- [spine-pixi Runtime Documentation](http://en.esotericsoftware.com/spine-pixi)
- [pixi-spine GitHub](https://github.com/pixijs/spine)
- [GSAP PixiPlugin Documentation](https://gsap.com/docs/v3/Plugins/PixiPlugin/)
- [@pixi/sound npm](https://www.npmjs.com/package/@pixi/sound)
- [@pixi/sound GitHub](https://github.com/pixijs/sound)
- [Howler.js vs @pixi/sound Discussion](https://www.html5gamedevs.com/topic/37649-pixi-sound-vs-howler/)
- [@pixi/particle-emitter Documentation](https://particle-emitter.pixijs.io/docs/)
- [@pixi/particle-emitter GitHub](https://github.com/pixijs-userland/particle-emitter)
- [Particle Editor](https://particle-emitter-editor.pixijs.io/)
- [pixijs-input-devices GitHub](https://github.com/reececomo/pixijs-input-devices)
- [pixi-scenes GitHub](https://github.com/florisdh/pixi-scenes)
- [PixiJS Manifests & Bundles Guide](https://pixijs.com/8.x/guides/components/assets/manifest)

---

**END OF REPORT**
