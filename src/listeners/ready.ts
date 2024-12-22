import type { Events } from '@sapphire/framework'
import { TextChannel } from 'discord.js'
import { config } from '#config.js'
import embeds from '#lib/embeds'
import { Listener } from '#lib/sapphire/listener'

export class ReadyListener extends Listener<typeof Events.ClientReady> {
  public override async run() {
    const { client, logger } = this.container

    const modLogChannel = client.channels.cache.get(config.modLogChannelId)
    if (modLogChannel instanceof TextChannel) {
      await modLogChannel.send({ embeds: [
        embeds.card(':robot: Archon Ready', `Archon is ready to serve.`).setColor(0x00FF00),
      ] })
    }
    else {
      logger.warn({ channelId: config.modLogChannelId }, 'Could not find mod log channel')
    }
  }
}
