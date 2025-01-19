import type { ApplicationCommandRegistry } from '@sapphire/framework'
import { ApplyOptions } from '@sapphire/decorators'
import embeds from '#lib/embeds'
import { Command } from '#lib/sapphire'

@ApplyOptions<Command.Options>({
  name: 'capy',
  description: 'Get a random Capybara.',
})
export class UserCommand extends Command {
  override registerApplicationCommands(registry: ApplicationCommandRegistry) {
    registry.registerChatInputCommand(
      builder =>
        builder
          .setName(this.name)
          .setDescription(this.description),
      {
        idHints: [
          // Archon Dev
          '1330298570972336289',
          // Archon Stg
          '1330296880013250603',
          // Archon Prod
          '1330676520645300315',
        ],
      },
    )
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.deferReply()

    await interaction.editReply({
      embeds: [
        embeds.card('Capy Roulette').setImage('attachment://capybara.jpg').setColor('DarkOrange'),
      ],
      files: [
        {
          attachment: 'https://api.capy.lol/v1/capybara',
          name: 'capybara.jpg',
        },
      ],
    })
  }
}
