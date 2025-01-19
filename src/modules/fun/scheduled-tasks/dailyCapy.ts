import { TextChannel } from 'discord.js'
import { config } from '#config'
import embeds from '#lib/embeds'
import { ScheduledTask } from '#lib/sapphire/scheduledTask'

export class PatternTask extends ScheduledTask {
  public constructor(context: ScheduledTask.LoaderContext, options: ScheduledTask.Options) {
    super(context, {
      ...options,
      pattern: '0 12 * * *',
    })
  }

  public async run() {
    const capyChannel = await this.container.client.channels.fetch(config.capyChannelId)
    if (!capyChannel || !(capyChannel instanceof TextChannel)) {
      this.container.logger.warn('Capy channel not found')
      return
    }
    await capyChannel.send({
      embeds: [
        embeds.card('Capy of the Day').setImage('attachment://capybara.jpg').setColor('DarkOrange'),
      ],
      files: [
        {
          attachment: 'https://api.capy.lol/v1/capyoftheday',
          name: 'capybara.jpg',
        },
      ],
    })
  }
}
