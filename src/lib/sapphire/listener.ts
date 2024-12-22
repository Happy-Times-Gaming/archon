import type { ClientEvents } from 'discord.js'
// eslint-disable-next-line no-restricted-imports
import { Listener as BaseListener } from '@sapphire/framework'
import { withSpan } from '#lib/util/tracing'
import { tracer } from './util'

export abstract class Listener<
  E extends keyof ClientEvents | symbol = '',
  O extends BaseListener.Options = BaseListener.Options,
> extends BaseListener<E, O> {
  protected constructor(context: BaseListener.LoaderContext, options?: O) {
    super(context, options)

    this.run = this.instrumentedRun(this.run.bind(this))
  }

  private instrumentedRun(
    fn: (...args: E extends keyof ClientEvents ? ClientEvents[E] : unknown[]) => unknown,
  ): (...args: E extends keyof ClientEvents ? ClientEvents[E] : unknown[]) => unknown {
    return async (...args) =>
      withSpan(`listener.${this.name}`, async (span) => {
        span.setAttributes({
          'discord.route': `listener.${this.name}`,
          'listener.event': this.event.toString(),
        })
        return await fn(...args)
      }, tracer)
  }
}

export namespace Listener {
  export type Options = BaseListener.Options
  export type JSON = BaseListener.JSON
  export type LoaderContext = BaseListener.LoaderContext
}
