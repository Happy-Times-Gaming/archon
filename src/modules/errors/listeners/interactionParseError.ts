import type { Events, InteractionHandlerParseError } from '@sapphire/framework'
import { Listener } from '#lib/sapphire'

export class CoreListener extends Listener<typeof Events.InteractionHandlerParseError> {
  public run(error: unknown, context: InteractionHandlerParseError) {
    const { interaction } = context
    const { name } = context.handler

    this.container.logger.error(
      {
        err: error,
        interaction: name,
        user_id: interaction.user.id,
        guild_id: interaction.guild?.id,
      },
      'Error executing interaction handler parse',
    )
  }
}
