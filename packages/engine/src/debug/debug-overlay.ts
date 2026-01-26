import Phaser from 'phaser';
import { Profiler } from './profiler';

/**
 * Debug overlay showing FPS, memory, and custom stats.
 * Toggle with F3 key by default.
 *
 * @example
 * const debug = new DebugOverlay(scene);
 * debug.addStat('Objects', () => gameObjects.length);
 *
 * // Toggle visibility
 * debug.toggle();
 */
export class DebugOverlay {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private background: Phaser.GameObjects.Rectangle;
  private texts: Phaser.GameObjects.Text[] = [];
  private customStats: Map<string, () => string | number> = new Map();
  private profiler: Profiler;
  private toggleKey: Phaser.Input.Keyboard.Key | null = null;

  /** Whether overlay is visible */
  visible = false;

  /** Update interval in ms (default: 100ms for 10 updates/sec) */
  updateInterval = 100;
  private lastUpdate = 0;

  constructor(scene: Phaser.Scene, options?: { toggleKey?: number; x?: number; y?: number }) {
    this.scene = scene;
    this.profiler = new Profiler();

    const x = options?.x ?? 10;
    const y = options?.y ?? 10;

    // Create container
    this.container = scene.add.container(x, y);
    this.container.setDepth(999999);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);

    // Background
    this.background = scene.add.rectangle(0, 0, 200, 80, 0x000000, 0.7);
    this.background.setOrigin(0, 0);
    this.container.add(this.background);

    // Setup toggle key (default F3)
    if (scene.input.keyboard) {
      const keyCode = options?.toggleKey ?? Phaser.Input.Keyboard.KeyCodes.F3;
      this.toggleKey = scene.input.keyboard.addKey(keyCode);
      this.toggleKey.on('down', () => this.toggle());
    }

    // Hook into scene update
    scene.events.on('preupdate', this.preUpdate, this);
    scene.events.on('update', this.onUpdate, this);
    scene.events.on('postupdate', this.postUpdate, this);
    scene.events.once('shutdown', this.destroy, this);
  }

  private preUpdate(): void {
    if (this.visible) {
      this.profiler.beginFrame();
    }
  }

  private postUpdate(): void {
    if (this.visible) {
      this.profiler.markUpdate();
      this.profiler.endFrame();
    }
  }

  private onUpdate(_time: number, _delta: number): void {
    if (!this.visible) return;

    const now = performance.now();
    if (now - this.lastUpdate < this.updateInterval) return;
    this.lastUpdate = now;

    this.updateDisplay();
  }

  private updateDisplay(): void {
    // Clear existing texts
    for (const text of this.texts) {
      text.destroy();
    }
    this.texts.length = 0;

    const lines: string[] = [
      `FPS: ${this.profiler.fps}`,
      `Frame: ${this.profiler.frameTime.toFixed(1)}ms`,
      `Memory: ${this.getMemoryUsage()}`,
    ];

    // Add custom stats
    for (const [name, getter] of this.customStats) {
      lines.push(`${name}: ${getter()}`);
    }

    // Create text objects
    let yOffset = 8;
    for (const line of lines) {
      const text = this.scene.add.text(8, yOffset, line, {
        fontSize: '12px',
        color: '#00ff00',
        fontFamily: 'monospace',
      });
      this.container.add(text);
      this.texts.push(text);
      yOffset += 16;
    }

    // Resize background
    this.background.setSize(200, yOffset + 8);
  }

  private getMemoryUsage(): string {
    // @ts-expect-error - memory API not in all browsers
    const memory = performance.memory;
    if (!memory) return 'N/A';

    const usedMB = (memory.usedJSHeapSize / 1024 / 1024).toFixed(1);
    const totalMB = (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(0);
    return `${usedMB}/${totalMB}MB`;
  }

  /**
   * Toggle overlay visibility.
   */
  toggle(): void {
    this.visible = !this.visible;
    this.container.setVisible(this.visible);

    if (this.visible) {
      this.updateDisplay();
    }
  }

  /**
   * Show overlay.
   */
  show(): void {
    this.visible = true;
    this.container.setVisible(true);
    this.updateDisplay();
  }

  /**
   * Hide overlay.
   */
  hide(): void {
    this.visible = false;
    this.container.setVisible(false);
  }

  /**
   * Add custom stat to display.
   */
  addStat(name: string, getter: () => string | number): void {
    this.customStats.set(name, getter);
  }

  /**
   * Remove custom stat.
   */
  removeStat(name: string): void {
    this.customStats.delete(name);
  }

  /**
   * Get profiler instance for external use.
   */
  getProfiler(): Profiler {
    return this.profiler;
  }

  private destroy(): void {
    this.scene.events.off('preupdate', this.preUpdate, this);
    this.scene.events.off('update', this.onUpdate, this);
    this.scene.events.off('postupdate', this.postUpdate, this);
    this.container.destroy();
  }
}
