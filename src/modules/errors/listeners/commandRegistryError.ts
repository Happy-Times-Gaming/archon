import type { Events } from '@sapphire/framework'
import { SpanStatusCode, trace } from '@opentelemetry/api'
import type { Command } from '#lib/sapphire'
import { Listener } from '#lib/sapphire'

export class CommandRegistryError extends Listener<typeof Events.CommandApplicationCommandRegistryError> {
  public run(error: unknown, command: Command) {
    const { name, location } = command
    this.container.logger.error({
      err: error,
      command: name,
      location: location.full,
    }, 'Encountered error while handling the command application command registry')

    const span = trace.getActiveSpan()
    if (span?.isRecording()) {
      span.setStatus({ code: SpanStatusCode.ERROR })
      span.recordException(error instanceof Error ? error : String(error))
    }
  }
}
