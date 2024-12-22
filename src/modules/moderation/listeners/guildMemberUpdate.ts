import { ApplyOptions } from '@sapphire/decorators'
import { Events, GuildMember, TextChannel } from 'discord.js'
import { config } from '#config.js'
import embeds from '#lib/embeds'
import { Listener } from '#lib/sapphire/listener'
import { withSpan } from '#lib/util/tracing'

@ApplyOptions<Listener.Options>({
  event: Events.GuildMemberUpdate,
})
export class UserEvent extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
    })
  }

  public override async run(oldMember: GuildMember, newMember: GuildMember) {
    if (!oldMember.roles.cache.has(config.honeypotRoleId) && newMember.roles.cache.has(config.honeypotRoleId)) {
      const { client } = this.container
      const modLogChannel = client.channels.cache.get(config.modLogChannelId)
      if (modLogChannel instanceof TextChannel) {
        const embed = embeds.card(':robot: Honeypot Alert', `Possible bot detected`).setColor(0xFF0000)
        embed.setFields([
          {
            name: 'User',
            value: `<@${newMember.user.id}>`,
            inline: true,
          },
          {
            name: 'Joined Discord',
            value: `<t:${(newMember.user.createdTimestamp / 1000).toFixed()}:R>`,
          },
        ])
        await withSpan('modLogChannel.send', async () => modLogChannel.send({ embeds: [embed] }))
      }
    }
  }
}
