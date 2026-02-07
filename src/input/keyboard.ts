export class KeyboardManager {
    private keysDown: Set<string> = new Set();
    private keysPressed: Set<string> = new Set();
    private keysReleased: Set<string> = new Set();

    constructor() {
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);

        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
    }

    private onKeyDown(event: KeyboardEvent): void {
        if (!this.keysDown.has(event.code)) {
            this.keysPressed.add(event.code);
        }
        this.keysDown.add(event.code);
    }

    private onKeyUp(event: KeyboardEvent): void {
        this.keysDown.delete(event.code);
        this.keysReleased.add(event.code);
    }

    /** Update keyboard state (call once per frame) */
    public update(): void {
        this.keysPressed.clear();
        this.keysReleased.clear();
    }

    /** Check if a key is currently held down */
    public isDown(key: string): boolean {
        return this.keysDown.has(key);
    }

    /** Check if a key was just pressed this frame */
    public justPressed(key: string): boolean {
        return this.keysPressed.has(key);
    }

    /** Check if a key was just released this frame */
    public justReleased(key: string): boolean {
        return this.keysReleased.has(key);
    }

    /** Check if any of the given keys are down */
    public anyDown(keys: string[]): boolean {
        return keys.some((key) => this.keysDown.has(key));
    }

    /** Get all currently pressed keys */
    public getDownKeys(): string[] {
        return Array.from(this.keysDown);
    }

    /** Clean up event listeners */
    public destroy(): void {
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
        this.keysDown.clear();
        this.keysPressed.clear();
        this.keysReleased.clear();
    }
}
