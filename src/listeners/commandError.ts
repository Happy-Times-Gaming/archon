import { trace } from '@opentelemetry/api'
import { ApplyOptions } from '@sapphire/decorators'

import { type ChatInputCommandErrorPayload, Events } from '@sapphire/framework'
import embeds from '#lib/embeds'
import { Listener } from '#lib/sapphire'
import { withSpan } from '#lib/util/tracing'

@ApplyOptions<Listener.Options>({
  event: Events.ChatInputCommandError,
})
export class CommandError extends Listener<typeof Events.ChatInputCommandError> {
  public override async run(_: unknown, context: ChatInputCommandErrorPayload) {
    const embed = embeds.card(':x: Command failed', `An unknown error occurred.`).setColor(0xFF0000)
    const span = trace.getActiveSpan()
    if (span) {
      embed.setFooter({
        text: `Trace ID: ${span.spanContext().traceId}`,
      })
    }

    await withSpan('error.reply', async () => context.interaction.reply(
      {
        embeds: [embed],
        ephemeral: true,
      },
    ))
  }
}
