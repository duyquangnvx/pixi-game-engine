import * as PIXI from 'pixi.js';
import type { BaseModal } from './base-modal';

const BASE_Z_INDEX = 10000;
const Z_INDEX_INCREMENT = 100;

export class ModalManager {
    private stack: BaseModal[] = [];
    private layer: PIXI.Container;
    private escapeHandler: ((e: KeyboardEvent) => void) | null = null;

    constructor(stage: PIXI.Container) {
        // Create modal layer on top of everything
        this.layer = new PIXI.Container();
        this.layer.sortableChildren = true;
        this.layer.zIndex = BASE_Z_INDEX;
        stage.addChild(this.layer);

        // Setup ESC key handler
        this.setupEscapeHandler();
    }

    /** Show a modal (adds to stack) */
    public show<T extends BaseModal>(modal: T): T {
        // Add to stack
        this.stack.push(modal);

        // Set z-index based on stack position
        modal.zIndex = this.stack.length * Z_INDEX_INCREMENT;

        // Add to layer
        this.layer.addChild(modal);

        // Show with animation
        modal.show();

        // Track when modal hides itself
        modal.didHide.add(() => this.removeFromStack(modal));

        return modal;
    }

    /** Hide a specific modal */
    public hide(modal: BaseModal): void {
        if (!this.stack.includes(modal)) return;
        modal.hide();
    }

    /** Hide the top modal */
    public hideTop(): void {
        const top = this.stack[this.stack.length - 1];
        if (top) {
            top.hide();
        }
    }

    /** Hide all modals */
    public async hideAll(): Promise<void> {
        const modals = [...this.stack];
        await Promise.all(modals.map((modal) => modal.hide()));
    }

    /** Get current modal stack (read-only) */
    public getStack(): readonly BaseModal[] {
        return this.stack;
    }

    /** Check if any modal is open */
    public get isOpen(): boolean {
        return this.stack.length > 0;
    }

    /** Get the topmost modal */
    public getTop(): BaseModal | undefined {
        return this.stack[this.stack.length - 1];
    }

    private removeFromStack(modal: BaseModal): void {
        const index = this.stack.indexOf(modal);
        if (index !== -1) {
            this.stack.splice(index, 1);
            this.layer.removeChild(modal);
        }
    }

    private setupEscapeHandler(): void {
        this.escapeHandler = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && this.isOpen) {
                e.preventDefault();
                this.hideTop();
            }
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('keydown', this.escapeHandler);
        }
    }

    public destroy(): void {
        // Remove escape handler
        if (this.escapeHandler && typeof window !== 'undefined') {
            window.removeEventListener('keydown', this.escapeHandler);
            this.escapeHandler = null;
        }

        // Hide all modals
        for (const modal of this.stack) {
            modal.destroy();
        }
        this.stack = [];

        // Remove layer
        this.layer.destroy();
    }
}
