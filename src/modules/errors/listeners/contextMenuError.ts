import type { ContextMenuCommandErrorPayload, Events } from '@sapphire/framework'
import { trace } from '@opentelemetry/api'
import embeds from '#lib/embeds'
import { Listener } from '#lib/sapphire'
import { withSpan } from '#lib/util/tracing'

export class CoreListener extends Listener<typeof Events.ContextMenuCommandError> {
  public async run(error: unknown, context: ContextMenuCommandErrorPayload) {
    const { command, interaction } = context
    this.container.logger.error({
      err: error,
      command: command.name,
      user_id: interaction.user.id,
      guild_id: interaction.guild?.id,
    }, 'Error executing context menu command')

    const embed = embeds.card(':x: Command failed', `An unknown error occurred.`).setColor(0xFF0000)
    const span = trace.getActiveSpan()
    if (span) {
      embed.setFooter({
        text: `Trace ID: ${span.spanContext().traceId}`,
      })
    }

    await withSpan('error.reply', async () => interaction[interaction.deferred ? 'editReply' : 'reply'](
      {
        embeds: [embed],
        ephemeral: true,
      },
    ))
  }
}
