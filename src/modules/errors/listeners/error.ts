import type { Events } from '@sapphire/framework'
import { SpanStatusCode, trace } from '@opentelemetry/api'
import { Listener } from '#lib/sapphire'

export class ErrorListener extends Listener<typeof Events.Error> {
  public override run(error: unknown) {
    const span = trace.getActiveSpan()
    if (span?.isRecording()) {
      span.setStatus({ code: SpanStatusCode.ERROR })
      span.recordException(error instanceof Error ? error : String(error))
    }

    this.container.logger.error({
      err: error,
    }, 'Unknown error occurred')
  }
}
