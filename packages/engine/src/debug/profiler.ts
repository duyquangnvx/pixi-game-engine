/**
 * Frame time profiler for performance monitoring.
 *
 * @example
 * const profiler = new Profiler();
 *
 * // In game loop:
 * profiler.beginFrame();
 * // ... update logic ...
 * profiler.markUpdate();
 * // ... render ...
 * profiler.endFrame();
 *
 * console.log(`FPS: ${profiler.fps}, Frame: ${profiler.frameTime}ms`);
 */
export class Profiler {
  private frameStart = 0;
  private updateEnd = 0;
  private frameEnd = 0;
  private frameTimes: number[] = [];
  private readonly sampleSize = 60;

  /** Last frame total time (ms) */
  frameTime = 0;

  /** Last update phase time (ms) */
  updateTime = 0;

  /** Last render phase time (ms) */
  renderTime = 0;

  /** Average FPS over sample window */
  fps = 60;

  /** Peak frame time in sample window */
  peakFrameTime = 0;

  /**
   * Call at start of frame.
   */
  beginFrame(): void {
    this.frameStart = performance.now();
  }

  /**
   * Call after update logic completes.
   */
  markUpdate(): void {
    this.updateEnd = performance.now();
    this.updateTime = this.updateEnd - this.frameStart;
  }

  /**
   * Call at end of frame.
   */
  endFrame(): void {
    this.frameEnd = performance.now();
    this.frameTime = this.frameEnd - this.frameStart;
    this.renderTime = this.frameEnd - this.updateEnd;

    // Track frame times for averaging
    this.frameTimes.push(this.frameTime);
    if (this.frameTimes.length > this.sampleSize) {
      this.frameTimes.shift();
    }

    // Calculate FPS and peak
    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    this.fps = Math.round(1000 / avgFrameTime);
    this.peakFrameTime = Math.max(...this.frameTimes);
  }

  /**
   * Reset all measurements.
   */
  reset(): void {
    this.frameTimes.length = 0;
    this.frameTime = 0;
    this.updateTime = 0;
    this.renderTime = 0;
    this.fps = 60;
    this.peakFrameTime = 0;
  }

  /**
   * Get formatted stats string.
   */
  getStats(): string {
    return `FPS: ${this.fps} | Frame: ${this.frameTime.toFixed(1)}ms | Peak: ${this.peakFrameTime.toFixed(1)}ms`;
  }
}
