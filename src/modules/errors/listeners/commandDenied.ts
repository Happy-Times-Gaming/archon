import { trace } from '@opentelemetry/api'
import { ApplyOptions } from '@sapphire/decorators'

import { type ChatInputCommandDeniedPayload, Events, type UserError } from '@sapphire/framework'
import embeds from '#lib/embeds'
import { Listener } from '#lib/sapphire'

@ApplyOptions<Listener.Options>({
  event: Events.ChatInputCommandDenied,
})
export class CommandDenied extends Listener<typeof Events.ChatInputCommandDenied> {
  public override async run(error: UserError, { interaction }: ChatInputCommandDeniedPayload) {
    const span = trace.getActiveSpan()
    if (span?.isRecording()) {
      span.setAttributes({
        'user-error.name': error.name,
        'user-error.message': error.message,
        'user-error.context': JSON.stringify(error.context),
        'user-error.identifier': error.identifier,
      })
    }

    await interaction.reply({ embeds: [embeds.card(':x: Command failed', error.message)], ephemeral: true })
  }
}
