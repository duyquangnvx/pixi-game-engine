# GSAP + PixiJS Integration Research Report

**Date:** 2026-01-25
**Focus:** Animation integration for game engine development

## Executive Summary

GSAP (GreenSock Animation Platform) integrates seamlessly with PixiJS through the PixiPlugin, providing a robust animation system for game development. The plugin simplifies property animations, offers timeline-based sequencing, and handles performance optimization when properly configured.

## 1. PixiPlugin Setup & Configuration

### Installation & Registration

```javascript
import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";

// Register plugin and PIXI reference
gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);
```

### Key Benefits

- **Simplified API**: Eliminates nested property access (`object.position.x` → `x`)
- **Degree-based rotation**: No manual radian conversion required
- **CSS-style colors**: Use `"red"`, `"#FF0000"`, `"rgb(255,0,0)"` instead of hex values
- **Built-in filters**: Easy access to color matrix and blur effects

## 2. Animating Display Objects

### Basic Sprite/Container Animation

```javascript
// Position and scale
gsap.to(sprite, {
  pixi: { x: 200, y: 150, scaleX: 2, scaleY: 1.5 },
  duration: 1,
  ease: "power2.out"
});

// Rotation (degrees, not radians)
gsap.to(sprite, {
  pixi: { rotation: 360 },
  duration: 2,
  ease: "elastic.out"
});

// Directional rotation control
gsap.to(sprite, {
  pixi: { rotation: "360_cw" },  // _cw, _ccw, or _short
  duration: 2
});
```

### Color & Filter Effects

```javascript
// Tint color
gsap.to(sprite, {
  pixi: { tint: "red" },
  duration: 1
});

// Color matrix filters (auto-applied)
gsap.to(sprite, {
  pixi: {
    saturation: 0,      // Desaturate
    brightness: 2,      // Brighten
    contrast: 1.5,      // Increase contrast
    hue: 180,           // Hue shift
    colorize: "blue",   // Colorize effect
    colorizeAmount: 0.5
  },
  duration: 2
});

// Blur effects
gsap.to(sprite, {
  pixi: { blurX: 15, blurY: 15 },
  duration: 1.5
});
```

### Alpha/Opacity

```javascript
// Fade in/out
gsap.to(sprite, {
  pixi: { alpha: 0 },
  duration: 0.5
});
```

## 3. Timeline-Based Animation Patterns

### Sequential Animations

```javascript
const tl = gsap.timeline();

tl.to(sprite, { pixi: { x: 200 }, duration: 1 })
  .to(sprite, { pixi: { y: 150 }, duration: 1 })
  .to(sprite, { pixi: { scale: 2 }, duration: 0.5 });
```

### Overlapping Animations

```javascript
const tl = gsap.timeline();

tl.to(sprite1, { pixi: { x: 200 }, duration: 1 })
  .to(sprite2, { pixi: { x: 200 }, duration: 1 }, "-=0.5")  // Overlap by 0.5s
  .to(sprite3, { pixi: { x: 200 }, duration: 1 }, "<");      // Start at previous animation start
```

### Game UI Sequence Example

```javascript
function showGameUI(elements) {
  const tl = gsap.timeline({ defaults: { ease: "back.out" } });

  tl.from(elements.title, { pixi: { y: -100, alpha: 0 }, duration: 0.8 })
    .from(elements.score, { pixi: { scale: 0, alpha: 0 }, duration: 0.5 }, "-=0.3")
    .from(elements.buttons, { pixi: { y: 50, alpha: 0 }, duration: 0.6, stagger: 0.1 }, "-=0.2");

  return tl;
}
```

### Labels for Navigation

```javascript
const tl = gsap.timeline();

tl.addLabel("idle")
  .to(player, { pixi: { y: "+=10" }, duration: 1, yoyo: true, repeat: -1 })
  .addLabel("attack", "+=0")
  .to(player, { pixi: { x: "+=50", scaleX: 1.2 }, duration: 0.3 });

// Jump to label
tl.play("attack");
```

## 4. Performance Considerations

### Ticker Integration (Recommended Pattern)

```javascript
// Stop PixiJS ticker, use GSAP as ticker director
app.ticker.stop();

gsap.ticker.add(() => {
  app.ticker.update();
});
```

**Benefits:**
- Single unified ticker system
- GSAP's accurate timing control
- Configurable FPS: `gsap.ticker.fps(60)`

### Mobile/Low-Power Optimization

**Issue**: iOS low power mode drops to 30 FPS due to `requestAnimationFrame` throttling.

**Solutions:**
- Disable antialiasing on mobile: `new PIXI.Application({ antialias: false })`
- Reduce particle counts and filter usage
- Use `ParticleContainer` for large sprite batches

### Renderer Optimization

```javascript
const app = new PIXI.Application({
  antialias: false,      // Disable on low-power devices
  resolution: window.devicePixelRatio || 1,
  autoDensity: true
});
```

### Avoid Common Pitfalls

- **Don't mix tickers**: Choose GSAP or PixiJS ticker, not both
- **Reuse textures**: Load once, reuse across sprites
- **Object pooling**: Recycle sprites instead of creating/destroying
- **Limit filters**: Each filter impacts performance (especially blur)

## 5. Common Animation Patterns

### Looping/Idle Animations

```javascript
// Floating animation
gsap.to(sprite, {
  pixi: { y: "-=20" },
  duration: 1.5,
  ease: "sine.inOut",
  yoyo: true,
  repeat: -1
});

// Pulsing effect
gsap.to(sprite, {
  pixi: { scale: 1.1 },
  duration: 0.8,
  ease: "power1.inOut",
  yoyo: true,
  repeat: -1
});
```

### Attack/Hit Animation

```javascript
function attackAnimation(sprite) {
  const tl = gsap.timeline();

  tl.to(sprite, { pixi: { x: "+=30", scaleX: 1.2 }, duration: 0.15 })
    .to(sprite, { pixi: { x: "-=30", scaleX: 1 }, duration: 0.15 });

  return tl;
}
```

### Damage Flash Effect

```javascript
function damageFlash(sprite) {
  gsap.to(sprite, {
    pixi: { tint: "red" },
    duration: 0.1,
    yoyo: true,
    repeat: 3,
    onComplete: () => {
      sprite.tint = 0xFFFFFF;  // Reset to white
    }
  });
}
```

### Stagger Patterns (Multiple Objects)

```javascript
// Animate array of sprites
gsap.to(enemies, {
  pixi: { alpha: 0, y: "-=50" },
  duration: 0.5,
  stagger: 0.1,  // 0.1s delay between each
  ease: "back.in"
});
```

### Repeat with Delay

```javascript
gsap.to(powerup, {
  pixi: { rotation: 360 },
  duration: 2,
  repeat: -1,
  repeatDelay: 0.5,  // Pause between cycles
  ease: "none"
});
```

## Best Practices

1. **Use timelines for complex sequences** - Easier to control and debug
2. **Set defaults on timelines** - Reduce repetition: `{ defaults: { duration: 1, ease: "power2.out" } }`
3. **Prefer GSAP ticker** - Single source of truth for timing
4. **Test on target devices** - Performance varies significantly (desktop vs mobile vs Raspberry Pi)
5. **Leverage easing functions** - Use `elastic`, `back`, `bounce` for game feel
6. **Use `exportRoot()`** - Slow down all game animations globally without affecting UI
7. **Object pooling** - Reuse sprites and tweens where possible

## Resources & References

- [GSAP PixiPlugin Documentation](https://gsap.com/docs/v3/Plugins/PixiPlugin/)
- [GSAP Timeline Documentation](https://gsap.com/docs/v3/GSAP/Timeline/)
- [PixiPlugin CodePen Examples](https://codepen.io/GreenSock/pen/OgQJqV)
- [GSAP + PixiJS Community Forum](https://gsap.com/community/forums/topic/40865-gsap-pixi/)
- [Performance Discussion: ParticleContainer + GSAP](https://github.com/pixijs/pixijs/discussions/8487)
- [Looping Animations Tutorial](https://oxygen4fun.supadezign.com/tutorials/how-to-create-looping-animations-with-gsap/)

## Conclusion

GSAP + PixiJS provides a powerful, performant animation system for game development. The PixiPlugin simplifies API usage, timelines enable complex sequences, and proper ticker integration ensures optimal performance. Focus on reusable timeline functions, object pooling, and testing on target devices for production-ready game animations.
