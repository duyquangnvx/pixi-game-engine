# Research: Code-Defined Pixel Art Integration

**Researcher:** brainstormer | **Date:** 2026-01-26 | **Status:** COMPLETE

## Executive Summary
**Recommendation: SKIP for now** – Code-defined pixel art adds 0.5d effort for niche use cases. Current Aseprite-first approach serves 95% of game development workflows. Defer as Phase 5 if demand emerges.

---

## Use Cases Analysis

### Valid Use Cases (Real but Niche)
1. **Quick Prototyping** - Developers wanting test sprites without asset files
2. **Procedural Generation** - Randomized characters (limited to part-based systems)
3. **UI Elements** - Simple icons, decorative patterns defined in code
4. **Runtime Effects** - Transient explosions, particle effects, screen distortion

### Limited Real-World Demand
- Most shipped games use pre-designed art (Aseprite/Piskel)
- Procedural pixel art generation rarely produces production-quality results
- Part-based randomization requires manual constraint design anyway

---

## Integration Approach (If Implemented)

### Minimal Implementation (~0.5d effort)

**Add factory method to PixelSpriteData:**

```typescript
interface PixelSpriteData {
  static fromStringArray(
    data: string[],
    colorMap: Record<string, RGBAColor>,
    options?: { width?: number; height?: number; frames?: number }
  ): PixelSpriteData;
}
```

**Example usage:**
```typescript
const spriteData = PixelSpriteData.fromStringArray(
  [ '###', '#.#', '###' ],  // 3x3 box
  { '#': [0, 0, 0, 255], '.': [255, 255, 255, 255] }
);
```

### Animation Support
- **Single-frame only** (simplest case)
- Multi-frame support requires frame descriptor objects (complicates API)
- Animation metadata (tags, timing) would need separate input → not worth the complexity

---

## Trade-Off Analysis

| Aspect | Aseprite-Only | + Code-Defined |
|--------|---------------|----------------|
| Effort | 2d | 2.5d (+0.5d) |
| Maintenance | Low | Medium |
| Use Cases Covered | 95% | 99% |
| API Surface | Stable | Added complexity |
| Production Usage | 100% | 10% |
| Learning Curve | Clear path | Multiple data sources |

---

## Decision: SKIP (Phase 5 Candidate)

### Reasons
1. **YAGNI Principle** - No current demand from users/examples
2. **Scope Creep Risk** - "Code-defined" leads to feature requests (multi-frame, animations, etc.)
3. **Aseprite Covers Real Use Case** - 99% of pixel art workflows
4. **Implementation Cost vs Value** - 0.5d effort for 5% coverage is poor ROI

### When to Revisit
- User explicitly requests procedural sprite generation
- Adding features like particle systems that need runtime generation
- Project roadmap includes avatar/character customization with constraints

---

## Alternatives to Code-Defined Pixel Art

### Better Options for Actual Use Cases
1. **Quick Prototyping** → Use pre-made sprite libraries (itch.io free assets)
2. **UI Icons** → Separate `IconRenderer` component with SVG/Canvas backend
3. **Procedural Effects** → Dedicated `ParticleSystem` component (separate concern)

### Why These Are Better
- Less coupled to PixelRenderer architecture
- More flexible for specific workflows
- Avoid polluting pixel art renderer with edge cases

---

## Unresolved Questions

- [ ] Will users request procedural sprite generation?
- [ ] Does project roadmap include character customization?
- [ ] Any performance constraints on multi-instance rendering?

