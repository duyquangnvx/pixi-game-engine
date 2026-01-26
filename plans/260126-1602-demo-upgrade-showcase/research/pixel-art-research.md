# Pixel-Art Animation & Palette Swapping Research

## 1. Common Pixel-Art Demo Showcases

### Palette Cycling
- **Classic Technique**: Maps indexed colors to animated palettes, creating fluid motion without changing sprite pixels
- **Animation Types**: Forwards, backwards, sine-wave, ping-pong patterns
- **Blendshift Approach**: Interpolates between palette indices for smoother gradients instead of discrete jumps
- **Best Use Cases**: Particle effects (fire, water, wind), dancing lights, swaying vegetation
- **Performance**: Optimized by storing only changed pixel indices in separate arrays

### Color Ramps
- **Method**: Remap color bands to create directional flow (fire gradients, water streams)
- **Fragment Shaders**: Convert pixel location to 256-color index, look up final color from palette LUT
- **Modern Trend (2025)**: Blending palette cycling with layered backgrounds, dynamic lighting, parallax effects

## 2. Runtime Palette Swapping Demonstration

### Shader-Based Implementation
- **Grayscale Encoding**: Store sprite as grayscale; each gray value maps to palette index
- **Lookup Texture**: Palette stored as 256×1 or 16×16 texture for instant color remapping
- **Runtime Benefits**: Change palettes per-frame without touching sprite data
- **Tools**: Lazy Palette Swapper (Unity), Lorikeet (GameMaker), SpritePalettizer (Godot/GM2)

### Effective Demo Features
- **Live Palette Swaps**: Show instant color changes on same sprite
- **Palette Transitions**: Smooth interpolation between different color schemes (day/night effects)
- **Per-Instance Recoloring**: Display multiple enemy variants with one sprite asset
- **Dynamic Palette Generation**: Build palettes from runtime data

## 3. Procedural Pixel-Art Generation for Demos

### Generation Techniques
- **Dot Matrix Method**: Randomly toggle pixels on/off grid; generates infinite sprite variety
- **Seed-Based**: Deterministic generation (spaceship, monster archetypes)
- **Template Constraints**: Define fixed features (eyes, limbs) + randomized details

### Demo Applications
- **Infinite Variety**: Generate hundreds of unique pixel sprites in real-time
- **Asset Efficiency**: Single generation algorithm replaces manual spritesheets
- **Tools**: CryPixels (14+ templates), Lospec Generator, custom algorithms

### Limitations
- Works well for free-form (spaceships) but struggles with constrained designs (side-view monsters)

## Summary for Engine Demo

**Recommended Demo Showcase:**
1. Palette cycling animation (water/fire loop with color ramps)
2. Runtime palette swapping (recolor same sprite 5+ ways)
3. Procedural generation (spawn random ships/creatures)

Combine with shader implementation for cross-platform support. Target retro 16-32 color palettes for visual impact.
