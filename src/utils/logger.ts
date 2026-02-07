/**
 * Logger - Static logging utility with levels and namespaces
 *
 * Usage:
 *   Logger.info('GameManager', 'Started');
 *   Logger.warn('API', 'Timeout', { retry: 2 });
 *   Logger.setLevel('warn'); // Only warn and error
 *   Logger.disable(); // Disable all
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    none: 4,
};

const LEVEL_STYLES: Record<Exclude<LogLevel, 'none'>, string> = {
    debug: 'color: #888',
    info: 'color: #4a9eff',
    warn: 'color: #ffa500',
    error: 'color: #ff4444; font-weight: bold',
};

export class LoggerClass {
    private level: LogLevel = 'debug';
    private enabled = true;

    /** Set minimum log level */
    setLevel(level: LogLevel): void {
        this.level = level;
    }

    /** Get current log level */
    getLevel(): LogLevel {
        return this.level;
    }

    /** Enable logging */
    enable(): void {
        this.enabled = true;
    }

    /** Disable all logging */
    disable(): void {
        this.enabled = false;
    }

    /** Check if logging is enabled */
    isEnabled(): boolean {
        return this.enabled;
    }

    /** Debug level log */
    debug(namespace: string, message: string, ...args: unknown[]): void {
        this.log('debug', namespace, message, args);
    }

    /** Info level log */
    info(namespace: string, message: string, ...args: unknown[]): void {
        this.log('info', namespace, message, args);
    }

    /** Warning level log */
    warn(namespace: string, message: string, ...args: unknown[]): void {
        this.log('warn', namespace, message, args);
    }

    /** Error level log */
    error(namespace: string, message: string, ...args: unknown[]): void {
        this.log('error', namespace, message, args);
    }

    private log(level: Exclude<LogLevel, 'none'>, namespace: string, message: string, args: unknown[]): void {
        if (!this.enabled) return;
        if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[this.level]) return;

        const prefix = `[${namespace}]`;
        const style = LEVEL_STYLES[level];

        if (args.length > 0) {
            console[level](`%c${prefix} ${message}`, style, ...args);
        } else {
            console[level](`%c${prefix} ${message}`, style);
        }
    }
}

/** Global logger instance */
export const Logger = new LoggerClass();
