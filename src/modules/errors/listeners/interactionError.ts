import type { Events, InteractionHandlerError } from '@sapphire/framework'
import { Listener } from '#lib/sapphire'

export class InteractionError extends Listener<typeof Events.InteractionHandlerError> {
  public async run(error: unknown, context: InteractionHandlerError) {
    const { interaction } = context
    const { name } = context.handler

    this.container.logger.error(
      {
        error,
        interaction: name,
        user_id: interaction.user.id,
        guild_id: interaction.guild?.id,
      },
      'Error executing interaction handler',
    )
  }
}
