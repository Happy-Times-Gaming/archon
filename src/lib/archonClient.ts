import type { ClientEvents, ClientOptions } from 'discord.js'
import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { SpanKind, SpanStatusCode, trace } from '@opentelemetry/api'
import { Result, SapphireClient } from '@sapphire/framework'
import { withSpan } from './util/tracing'

const tracer = trace.getTracer('discord.js')

export class ArchonClient extends SapphireClient {
  private _instrumentedListeners?: WeakMap<
    (...args: ClientEvents[keyof ClientEvents]) => void, // The original listener function
    Array<(...args: ClientEvents[keyof ClientEvents]) => void> // An array of instrumented listener functions
  >

  constructor(clientOptions: ClientOptions) {
    super(clientOptions)
  }

  public async registerModules() {
    const { baseUserDirectory } = this.options
    if (baseUserDirectory === undefined || baseUserDirectory === null)
      return

    let baseDir: string
    if (baseUserDirectory instanceof URL) {
      baseDir = fileURLToPath(baseUserDirectory)
    }
    else {
      baseDir = baseUserDirectory
    }

    const modulesDir = path.join(baseDir, 'modules')
    const modules = await this.gatherModules(modulesDir)
    for (const module of modules) {
      this.stores.registerPath(path.join(modulesDir, module))
      this.logger.debug(`Registered module ${module}`)
    }
  }

  private async gatherModules(moduleDirectory: string): Promise<string[]> {
    const returnCode = await Result.fromAsync(async () => {
      const files = await readdir(moduleDirectory, { withFileTypes: true })
      const directories = files.filter(file => file.isDirectory()).map(file => file.name)
      return directories
    })
    return returnCode.unwrapOrElse((err) => {
      this.logger.error(err, 'Failed to gather modules')
      return []
    })
  }

  private ensureInstrumentedListeners(): void {
    if (!this._instrumentedListeners) {
      this._instrumentedListeners = new WeakMap()
    }
  }

  public override on<Event extends keyof ClientEvents>(event: Event, listener: (...args: ClientEvents[Event]) => void): this {
    this.ensureInstrumentedListeners()
    const instrumentedListener = (...args: ClientEvents[Event]) => {
      return withSpan(
        { name: `client.on.${String(event)}`, spanOptions: { kind: SpanKind.CONSUMER } },
        (span) => {
          try {
            return listener(...args)
          }
          catch (error: unknown) {
            if (error instanceof Error) {
              span.setStatus({ code: SpanStatusCode.ERROR, message: error.message })
            }
            else {
              span.setStatus({ code: SpanStatusCode.ERROR, message: String(error) })
            }
            throw error
          }
        },
        tracer,
      )
    }
    const listenerInstances = this._instrumentedListeners!.get(listener) || []
    listenerInstances.push(instrumentedListener)
    return super.on(event, instrumentedListener)
  }

  public override once<Event extends keyof ClientEvents>(event: Event, listener: (...args: ClientEvents[Event]) => void): this {
    this.ensureInstrumentedListeners()
    const instrumentedListener = (...args: ClientEvents[Event]) => {
      return withSpan(
        { name: `client.once.${String(event)}`, spanOptions: { kind: SpanKind.CONSUMER } },
        (span) => {
          try {
            return listener(...args)
          }
          catch (error: unknown) {
            if (error instanceof Error) {
              span.setStatus({ code: SpanStatusCode.ERROR, message: error.message })
            }
            else {
              span.setStatus({ code: SpanStatusCode.ERROR, message: String(error) })
            }
            throw error
          }
        },
        tracer,
      )
    }

    const listenerInstances = this._instrumentedListeners!.get(listener) || []
    listenerInstances.push(instrumentedListener)
    return super.once(event, instrumentedListener)
  }

  public override off<Event extends keyof ClientEvents>(event: Event, listener: (...args: ClientEvents[Event]) => void): this {
    this.ensureInstrumentedListeners()
    const listenerInstances = this._instrumentedListeners!.get(listener)
    if (listenerInstances) {
      const instListener = listenerInstances.pop()
      if (instListener) {
        super.off(event, instListener)
        if (listenerInstances.length === 0)
          this._instrumentedListeners!.delete(listener)
      }
    }
    else {
      super.off(event, listener)
    }
    return this
  }
}
