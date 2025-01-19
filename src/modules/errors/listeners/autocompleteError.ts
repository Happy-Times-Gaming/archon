import type { AutocompleteInteractionPayload, Events } from '@sapphire/framework'
import { Listener } from '#lib/sapphire'

export class AutocompleteError extends Listener<typeof Events.CommandAutocompleteInteractionError> {
  public run(error: unknown, payload: AutocompleteInteractionPayload) {
    const { command, interaction } = payload
    this.container.logger.error(
      {
        err: error,
        command: command.name,
        user_id: interaction.user.id,
        guild_id: interaction.guild?.id,
      },
      'Error executing autocomplete interaction',
    )
  }
}
