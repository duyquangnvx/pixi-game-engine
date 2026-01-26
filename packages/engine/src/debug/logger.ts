/**
 * Log levels for filtering output.
 */
export enum LogLevel {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3,
  None = 4,
}

/**
 * Configurable logger with level filtering.
 * Set to LogLevel.None in production to tree-shake logs.
 *
 * @example
 * Logger.level = process.env.NODE_ENV === 'production' ? LogLevel.Error : LogLevel.Debug;
 * Logger.debug('Detailed info'); // Only in debug
 * Logger.info('Game started');
 * Logger.warn('Low memory');
 * Logger.error('Failed to load');
 */
export class Logger {
  static level: LogLevel = LogLevel.Debug;
  static prefix = '[PGE]';

  static debug(...args: unknown[]): void {
    if (this.level <= LogLevel.Debug) {
      console.debug(this.prefix, ...args);
    }
  }

  static info(...args: unknown[]): void {
    if (this.level <= LogLevel.Info) {
      console.info(this.prefix, ...args);
    }
  }

  static warn(...args: unknown[]): void {
    if (this.level <= LogLevel.Warn) {
      console.warn(this.prefix, ...args);
    }
  }

  static error(...args: unknown[]): void {
    if (this.level <= LogLevel.Error) {
      console.error(this.prefix, ...args);
    }
  }

  /**
   * Create a scoped logger with custom prefix.
   */
  static scope(name: string): ScopedLogger {
    return new ScopedLogger(name);
  }
}

/**
 * Scoped logger with custom prefix.
 */
export class ScopedLogger {
  private prefix: string;

  constructor(name: string) {
    this.prefix = `[${name}]`;
  }

  debug(...args: unknown[]): void {
    if (Logger.level <= LogLevel.Debug) {
      console.debug(Logger.prefix, this.prefix, ...args);
    }
  }

  info(...args: unknown[]): void {
    if (Logger.level <= LogLevel.Info) {
      console.info(Logger.prefix, this.prefix, ...args);
    }
  }

  warn(...args: unknown[]): void {
    if (Logger.level <= LogLevel.Warn) {
      console.warn(Logger.prefix, this.prefix, ...args);
    }
  }

  error(...args: unknown[]): void {
    if (Logger.level <= LogLevel.Error) {
      console.error(Logger.prefix, this.prefix, ...args);
    }
  }
}
