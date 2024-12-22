import type { ChildLoggerOptions, LevelWithSilent as PinoLevel, Logger as PinoLogger } from 'pino'
import { type ILogger, LogLevel } from '@sapphire/framework'
import { pino } from 'pino'

declare module '@sapphire/framework' {
  interface ILogger {
    child: (metadata: Record<string, any>, options?: Pick<ChildLoggerOptions, 'level'>) => ILogger
  }
}

const levelMap: Record<LogLevel, PinoLevel> = {
  [LogLevel.Trace]: 'trace',
  [LogLevel.Debug]: 'debug',
  [LogLevel.Info]: 'info',
  [LogLevel.Warn]: 'warn',
  [LogLevel.Error]: 'error',
  [LogLevel.Fatal]: 'fatal',
  [LogLevel.None]: 'silent',
}

const errorKey = 'err'

export class SapphirePino implements ILogger {
  protected readonly logger: PinoLogger
  constructor(logger?: PinoLogger) {
    this.logger = logger ?? pino()
  }

  has(level: LogLevel): boolean {
    return this.logger.isLevelEnabled(this.getPinoLevel(level))
  }

  trace(...values: readonly unknown[]): void {
    this.write(LogLevel.Trace, ...values)
  }

  debug(...values: readonly unknown[]): void {
    this.write(LogLevel.Debug, ...values)
  }

  info(...values: readonly unknown[]): void {
    this.write(LogLevel.Info, ...values)
  }

  warn(...values: readonly unknown[]): void {
    this.write(LogLevel.Warn, ...values)
  }

  error(...values: readonly unknown[]): void {
    this.write(LogLevel.Error, ...values)
  }

  fatal(...values: readonly unknown[]): void {
    this.write(LogLevel.Fatal, ...values)
  }

  write(level: LogLevel, ...values: readonly unknown[]): void {
    if (values.length === 0)
      return

    const pinoLevel = this.getPinoLevel(level)
    const [first, ...args] = values

    if (typeof first === 'object' && first !== null) {
      this.logger[pinoLevel](
        first instanceof Error ? { [errorKey]: first } : first
        // eslint-disable-next-line ts/no-unsafe-argument
        , ...(args as any[]),
      )
    }
    else if (typeof first === 'string') {
      this.logger[pinoLevel](first, ...args)
    }
    else {
      this.logger[pinoLevel](String(first), ...args)
    }
  }

  child(metadata: Record<string, any>, options?: Pick<ChildLoggerOptions, 'level'>) {
    return new SapphirePino(this.logger.child(metadata, options))
  }

  private getPinoLevel(level: LogLevel): PinoLevel {
    const pinoLevel = levelMap[level]
    if (!pinoLevel)
      throw new Error(`Unknown log level: ${level}`)
    return pinoLevel
  }
}
