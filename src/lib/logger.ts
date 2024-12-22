import { pino } from 'pino'
import { config } from '#config.js'
import { SapphirePino as Logger } from '#lib/util/loggerAdapter.js'

// type LoggerContext = Record<string, unknown>
// const loggerContextStore = new AsyncLocalStorage<LoggerContext>()

// export function runInLoggerContext<
//   Args extends unknown[], // Strictly defines arguments as a tuple
// >(event: string, listener: (...args: Args) => void): (...args: Args) => void {
//   const context: LoggerContext = {
//     event,
//     correlationId: crypto.randomUUID(),
//   }

//   return (...args: Args) => {
//     loggerContextStore.run(context, () => {
//       listener(...args)
//     })
//   }
// }

const redactFields: string[] = []
const basePinoOptions = {
  translateTime: true,
  ignore: 'pid,hostname',
  singleLine: true,
  redact: redactFields,
}

export const logger = new Logger(
  pino({
    level: config.logLevel,
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: redactFields,
      censor: '**GDPR COMPLIANT**',
    },
    transport: config.logPretty
      ? {
          target: 'pino-pretty',
          options: {
            ...basePinoOptions,
            colorize: true,
          },
        }
      : undefined,
  }),
)
