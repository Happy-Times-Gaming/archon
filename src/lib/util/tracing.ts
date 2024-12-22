import { metrics, type Span, type SpanOptions, SpanStatusCode, trace, type Tracer } from '@opentelemetry/api'

export const tracer = trace.getTracer('archon')
export const meter = metrics.getMeter('archon')

function recordError(span: Span, error: unknown): void {
  span.recordException(
    error instanceof Error ? error : new Error(String(error)),
  )
  span.setStatus({
    code: SpanStatusCode.ERROR,
    message: error instanceof Error ? error.message : String(error),
  })
}

export function withSpan<F>(
  opts: string | { name: string, spanOptions: SpanOptions },
  traced: (span: Span) => F,
  currentTracer: Tracer = tracer,
): F {
  const isObject = typeof opts === 'object'
  const spanName = isObject ? opts.name : opts
  const spanOptions = isObject ? opts.spanOptions : {}

  return currentTracer.startActiveSpan(spanName, spanOptions, (span) => {
    try {
      const result = traced(span)

      if (result instanceof Promise) {
        return result
          .then((value: Awaited<F>) => {
            span.end()
            return value
          })
          .catch((error) => {
            recordError(span, error)
            span.end()
            throw error
          }) as F
      }

      // For synchronous results
      span.end()
      return result
    }
    catch (error) {
      recordError(span, error)
      span.end()
      throw error
    }
  })
}
