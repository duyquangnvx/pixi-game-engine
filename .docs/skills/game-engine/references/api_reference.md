# API Reference

## Table of Contents

1. [Engine](#engine)
2. [Scene & SceneManager](#scene--scenemanager)
3. [Input](#input)
4. [Assets](#assets)
5. [Sound](#sound)
6. [Particles](#particles)
7. [Tween](#tween)
8. [UI](#ui)
9. [Modal System](#modal-system)
10. [Alerts](#alerts)
11. [Toasts](#toasts)
12. [Spine](#spine)
13. [CountAnimator](#countanimator)
14. [Signal](#signal)
15. [Logger](#logger)

---

## Engine

Static class orchestrating all subsystems. Access managers directly without `.instance`.

```typescript
// Initialization
Engine.init(config: EngineConfig): void
Engine.destroy(): void
Engine.pause(): void
Engine.resume(): void

interface EngineConfig {
    width: number;
    height: number;
    backgroundColor?: number;       // default: 0x000000
    antialias?: boolean;            // default: true
    resolution?: number;            // default: devicePixelRatio
    autoDensity?: boolean;          // default: true
    scaleMode?: ScaleMode;          // default: 'letterbox'
    autoResize?: boolean;           // default: true
}
type ScaleMode = 'none' | 'letterbox' | 'fill';

// Manager getters
Engine.scenes: SceneManager
Engine.input: InputManager
Engine.assets: AssetManager
Engine.sound: SoundManager
Engine.particles: ParticleManager
Engine.tween: TweenManager
Engine.ui: UIManager
Engine.spine: SpineManager
Engine.toast: ToastManager
Engine.alert: AlertManager
Engine.modal: ModalManager
Engine.app: PIXI.Application
Engine.logger: LoggerClass

// Display getters
Engine.view: PIXI.ICanvas
Engine.stage: PIXI.Container
Engine.screen: PIXI.Rectangle          // Design resolution
Engine.viewport: PIXI.Rectangle        // Actual renderer size
Engine.designWidth: number
Engine.designHeight: number
Engine.scale: number                    // Current scale factor
Engine.scaleMode: ScaleMode             // Get/set
Engine.isRunning: boolean

// Resize
Engine.resize(targetWidth: number, targetHeight: number): void
Engine.resizeToWindow(): void
Engine.getFullscreenBounds(): { x, y, width, height }

// Signals
Engine.onPause: Signal<void>
Engine.onResume: Signal<void>
Engine.onUpdate: Signal<number>
Engine.onResize: Signal<{ width: number; height: number; scale: number }>
```

Game loop order: `onUpdate` emit -> `input.update()` -> `scenes.update()` -> `particles.update()` -> `input.postUpdate()`

TweenManager uses GSAP's internal ticker (no manual update).

---

## Scene & SceneManager

```typescript
abstract class Scene extends PIXI.Container {
    protected get engine(): typeof Engine
    abstract onEnter(): void | Promise<void>
    abstract onUpdate(delta: number): void
    abstract onExit(): void
    onPause(): void         // Override if needed
    onResume(): void        // Override if needed
}

class SceneManager {
    add(name: string, SceneClass: new () => Scene): void
    remove(name: string): void
    start(name: string): Promise<void>
    current: string | null
    currentInstance: Scene | null
    has(name: string): boolean
    destroy(): void
}
```

---

## Input

```typescript
class InputManager {
    keyboard: KeyboardManager
    pointer: PointerManager
    gamepad: GamepadManager
}

class KeyboardManager {
    isDown(key: string): boolean
    justPressed(key: string): boolean
    justReleased(key: string): boolean
    anyDown(keys: string[]): boolean
    getDownKeys(): string[]
}

class PointerManager {
    x: number; y: number
    isDown: boolean
    justPressed: boolean; justReleased: boolean
    button: number              // 0=left, 1=middle, 2=right
    position: { x, y }
}

class GamepadManager {
    get(index: number): Gamepad | null
    isConnected(index: number): boolean
    isButtonDown(index: number, button: number): boolean
    getAxis(index: number, axis: number): number
    getLeftStick(index: number): { x, y }
    getRightStick(index: number): { x, y }
    count: number
}
```

---

## Assets

```typescript
class AssetManager {
    init(options: { manifest: string | AssetManifest }): Promise<void>
    loadBundle(name: string, onProgress?: (p: number) => void): Promise<void>
    loadBundles(names: string[], onProgress?: (p: number) => void): Promise<void>
    backgroundLoadBundle(name: string): void
    load<T>(alias: string): Promise<T>
    get<T>(alias: string): T
    has(alias: string): boolean
    unload(alias: string): Promise<void>
    unloadBundle(name: string): Promise<void>
    add(alias: string, src: string): void
    assets: typeof PIXI.Assets
}

interface AssetManifest { bundles: AssetBundle[] }
interface AssetBundle { name: string; assets: AssetEntry[] }
interface AssetEntry { alias: string; src: string | string[]; data?: Record<string, unknown> }
```

---

## Sound

```typescript
class SoundManager {
    playSfx(alias: string, options?: SoundOptions): void
    play(alias: string, options?: SoundOptions): void
    playMusic(alias: string, options?: SoundOptions): void
    stopMusic(): void
    stop(alias: string): void
    stopAll(): void
    pauseAll(): void
    resumeAll(): void
    setVolume(channel: 'master' | 'music' | 'sfx', value: number): void
    getVolume(channel: 'master' | 'music' | 'sfx'): number
    mute(): void; unmute(): void; toggleMute(): boolean
    isMuted: boolean
}

interface SoundOptions { volume?: number; loop?: boolean; speed?: number }
```

---

## Particles

```typescript
class ParticleManager {
    create(container: PIXI.Container, config: ParticleConfig): Emitter
    update(delta: number): void
    remove(emitter: Emitter): void
    removeAll(): void
    count: number
}

interface ParticleConfig extends Partial<EmitterConfigV3> {
    textures: string[]
}
```

Default behaviors: alpha fade (0->1->0), scale fade (1->0.5), moveSpeed (200->100), rotation (0->360), torus spawn shape.

---

## Tween

GSAP with PixiPlugin pre-registered.

```typescript
class TweenManager {
    to(target: object, config: TweenConfig): gsap.core.Tween
    from(target: object, config: TweenConfig): gsap.core.Tween
    fromTo(target: object, from: TweenConfig, to: TweenConfig): gsap.core.Tween
    timeline(config?: gsap.TimelineVars): gsap.core.Timeline
    kill(tween: gsap.core.Tween): void
    killTweensOf(target: object): void
    killAll(): void
    count: number
}

interface TweenConfig {
    duration?: number;      // seconds, default 0.5
    delay?: number;         // seconds, default 0
    ease?: string;          // GSAP easing, default 'power2.out'
    repeat?: number;
    yoyo?: boolean;
    onComplete?: () => void;
    onUpdate?: () => void;
    [key: string]: unknown; // target properties
}
```

---

## UI

```typescript
class UIManager {
    button(config: ButtonConfig): FancyButton
    text(config: TextConfig): PIXI.Text
    rect(width: number, height: number, color?: number, radius?: number): PIXI.Graphics
    progressBar(width: number, height: number, bgColor?: number, fillColor?: number): {
        container: PIXI.Container; setProgress: (value: number) => void
    }
}
```

---

## Modal System

```typescript
class BaseModal<TData = void> extends PIXI.Container {
    constructor(config?: BaseModalConfig)
    show(data?: TData): Promise<void>
    hide(): Promise<void>
    isModalVisible: boolean
    protected onShow(_data: TData): void    // Override to build content
    protected onHide(): void                // Override to cleanup
    protected contentContainer: PIXI.Container
    protected screenWidth: number; screenHeight: number
    protected createTitle(text: string, style?): PIXI.Text
    protected createButton(config: ModalButtonConfig): PIXI.Container
    protected redrawBackground(width?: number, height?: number): void
    didHide: Signal<void>; didShow: Signal<TData>
}

interface BaseModalConfig {
    width?: number; height?: number;            // 400, 300
    backdrop?: boolean; backdropAlpha?: number;  // true, 0.6
    closeOnBackdrop?: boolean; closeButton?: boolean;
    closeButtonPosition?: 'top-right' | 'top-left';
    draggable?: boolean; centered?: boolean;
    animation?: 'fade' | 'scale' | 'slide' | 'none';
    animationDuration?: number;                 // seconds, 0.3
    backgroundColor?: number; borderColor?: number;
    borderWidth?: number; borderRadius?: number;
}

class ModalManager {
    show<T extends BaseModal>(modal: T): T
    hide(modal: BaseModal): void
    hideTop(): void; hideAll(): Promise<void>
    getStack(): readonly BaseModal[]
    isOpen: boolean; getTop(): BaseModal | undefined
}
```

---

## Alerts

Promise-based alert dialogs.

```typescript
class AlertManager {
    info(message: string, title?: string): Promise<void>
    success(message: string, title?: string): Promise<void>
    warning(message: string, title?: string): Promise<void>
    error(message: string, title?: string): Promise<void>
    confirm(message: string, title?: string): Promise<boolean>
    custom<T>(config: AlertConfig): Promise<T>
}

interface AlertConfig {
    title?: string; message: string;
    type?: 'info' | 'success' | 'warning' | 'error' | 'confirm';
    buttons?: AlertButton[];
}
interface AlertButton { text: string; value: unknown; primary?: boolean }
```

---

## Toasts

Gaming-styled toast notifications with theme support.

```typescript
class ToastManager {
    show(message: string, options?: Partial<Omit<ToastConfig, 'message'>>): void
    info(message: string, duration?: number): void
    success(message: string, duration?: number): void
    warning(message: string, duration?: number): void
    error(message: string, duration?: number): void
    setTheme(theme: ToastThemePreset | ToastTheme): void
    getThemeName(): string
    dismissAll(): void
}

interface ToastConfig {
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    duration?: number;      // ms, default 3000, 0 = no auto-dismiss
    position?: 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

type ToastThemePreset = 'default' | 'asian' | 'egyptian' | 'underwater' | 'neon' | 'luxury';
```

---

## Spine

```typescript
class SpineManager {
    create(alias: string): Spine
    fromData(skeletonData: ISkeletonData): Spine
    play(spine: Spine, anim: string, loop?: boolean, trackIndex?: number): void
    queue(spine: Spine, anim: string, loop?: boolean, delay?: number, trackIndex?: number): void
    setMix(spine: Spine, from: string, to: string, duration: number): void
    getAnimations(spine: Spine): string[]
    getSkins(spine: Spine): string[]
    setSkin(spine: Spine, skinName: string): void
    pause(spine: Spine): void; resume(spine: Spine): void
    setSpeed(spine: Spine, speed: number): void
}
```

---

## CountAnimator

Animated number counting with presets for slot-game-style reveals.

```typescript
class CountAnimator {
    constructor(renderer: ICountRenderer, tweenManager: TweenManager, defaultFormatter?: (v: number) => string)
    animateTo(target: number, config?: CountAnimatorConfig): Promise<void>
    animateFromTo(from: number, to: number, config?: CountAnimatorConfig): Promise<void>
    setValue(value: number, formatter?: (v: number) => string): void
    skip(): void; stop(): void; reset(): void
    value: number; target: number; isAnimating: boolean
}

// Presets: 'fast' (300ms), 'normal' (500ms), 'win' (1s), 'bigWin' (2s), 'epicWin' (4s), 'instant' (0ms)

class TextCountRenderer implements ICountRenderer {
    constructor(text: PIXI.Text)
    setValue(value: string): void
    getDisplayObject(): PIXI.Container
    setColor(color: number): void
    setScale(scaleX: number, scaleY?: number): void
}
```

---

## Signal

```typescript
class Signal<T = void> {
    add(listener: (value: T) => void, thisArg?: unknown): SignalBinding
    once(listener: (value: T) => void, thisArg?: unknown): SignalBinding
    remove(listener: (value: T) => void): void
    emit(value: T): void
    clear(): void
    hasListeners: boolean
}
interface SignalBinding { detach(): boolean; dispose(): void }
```

---

## Logger

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

// Access via Engine.logger or import { Logger }
Logger.debug(namespace: string, message: string, ...args: unknown[]): void
Logger.info(namespace: string, message: string, ...args: unknown[]): void
Logger.warn(namespace: string, message: string, ...args: unknown[]): void
Logger.error(namespace: string, message: string, ...args: unknown[]): void
Logger.setLevel(level: LogLevel): void
Logger.enable(): void; Logger.disable(): void
```
