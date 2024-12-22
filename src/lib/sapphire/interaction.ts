import type { Counter } from '@opentelemetry/api'

import type { Interaction } from 'discord.js'
// eslint-disable-next-line no-restricted-imports
import { InteractionHandler as BaseInteractionHandler } from '@sapphire/framework'
import { meter, withSpan } from '#lib/util/tracing'
import { formatInteractionType, setChannelAttributes, setGuildAttributes, setUserAttributes, tracer } from './util'

export abstract class InteractionHandler<
  O extends BaseInteractionHandler.Options = BaseInteractionHandler.Options,
> extends BaseInteractionHandler<O> {
  private interactionCounter: Counter
  protected constructor(context: BaseInteractionHandler.LoaderContext, options: O = {} as O) {
    super(context, options)
    this.interactionCounter = meter.createCounter('interactions', {
      description: 'Counts the number of interactions',
    })
    this.run = this.instrumentedRun(this.run.bind(this))
  }

  private instrumentedRun(
    fn: (interaction: Interaction, parsedData?: unknown) => unknown,
  ): (interaction: Interaction, parsedData?: unknown) => unknown {
    this.interactionCounter.add(1)
    return async (interaction, parsedData) =>
      withSpan(
        `interaction.${this.name}`,
        async (span) => {
          span.setAttributes({
            'discord.route': `interaction.${this.name}`,
            'interaction.id': interaction.id,
            'interaction.type': formatInteractionType(interaction.type),
          })
          setUserAttributes(span, interaction.user)
          setGuildAttributes(span, interaction.guild)
          setChannelAttributes(span, interaction.channel)

          return await fn(interaction, parsedData)
        },
        tracer,
      )
  }
}

export namespace InteractionHandler {
  export type LoaderContext = BaseInteractionHandler.LoaderContext
  export type Options = BaseInteractionHandler.Options
  export type JSON = BaseInteractionHandler.JSON
  export type ParseResult<Instance extends BaseInteractionHandler> = BaseInteractionHandler.ParseResult<Instance>
}
