import type { ApplicationCommandRegistry } from '@sapphire/framework'

import process from 'node:process'
import { ApplyOptions } from '@sapphire/decorators'
import { EmbedBuilder, Message, MessageFlags } from 'discord.js'

import { Command } from '#lib/sapphire'
import { withSpan } from '#lib/util/tracing'

@ApplyOptions<Command.Options>({
  name: 'ping',
  description: 'Ping the bot to see if it is alive.',
})
export class UserCommand extends Command {
  override async registerApplicationCommands(registry: ApplicationCommandRegistry) {
    registry.registerChatInputCommand(
      builder =>
        builder
          .setName(this.name)
          .setDescription(this.description),
      {
        idHints: [
          // Archon Dev
          '1330298574579433582',
          // Archon Stg
          '1320164612301389877',
          // Archon Prod
          '1330012535134490696',
        ],
      },
    )
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const callback = await withSpan('command.ping.message', async () => interaction.deferReply({
      withResponse: true,
      flags: MessageFlags.Ephemeral,
    }))

    const msg = callback.resource?.message
    if (msg instanceof Message) {
      const roundTripTime = msg.createdTimestamp - interaction.createdTimestamp
      const heartbeatPing = Math.round(this.container.client.ws.ping)
      const processMemory = process.memoryUsage().rss
      const uptime = interaction.client.uptime

      const embed = new EmbedBuilder()
        .setTitle('📊 System Stats')
        .setAuthor({
          name: `Archon`,
        })
        .setColor(0x00AE86)
        .addFields(
          {
            name: 'Uptime',
            value: `<t:${((Date.now() - uptime) / 1000).toFixed()}:R>`,
          },
          {
            name: 'Environment',
            value: `Node ${process.version} on ${process.platform} ${process.arch}`,
          },
          {
            name: 'Memory Usage',
            value: `${(processMemory / 1024 / 1024).toFixed(2)} MB`,
          },
        )
        .setFooter({
          text: `Roundtrip: ${roundTripTime}ms | Heartbeat: ${heartbeatPing}ms | Git SHA: ${import.meta.env.BUILD_SHA}`,
        })
        .setTimestamp()

      return interaction.editReply({ embeds: [embed] })
    }
    return interaction.editReply('Failed to retrieve ping :(')
  }
}
