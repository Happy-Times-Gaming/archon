import { ApplyOptions } from '@sapphire/decorators'
import { type ApplicationCommandRegistry, Result } from '@sapphire/framework'
import { EmbedBuilder } from 'discord.js'
import { config } from '#config'
import { Command } from '#lib/sapphire'
import { withSpan } from '#lib/util/tracing'

const dadJokeCategories = [
  'Animals',
  'Food',
  'Technology',
  'Sports',
  'Movies',
  'Music',
  'Science',
  'Dad Life',
  'Work',
  'Weather',
  'School',
  'Math',
  'Health',
  'Nature',
  'Travel',
  'History',
  'Holidays',
  'Relationships',
  'Home Improvement',
  'Christmas',
  'Pun-based',
  'Gardening',
  'Parenting',
  'Fitness',
  'Construction',
  'Books',
  'Art',
  'Weather',
  'Space',
  'Cars',
]

interface iCanHazDadJokeResponse {
  id: string
  joke: string
  status: number
}

@ApplyOptions<Command.Options>({
  name: 'dadjoke',
  description: 'Generates a dad joke.',
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
          '1330298572473761876',
          // Archon Stg
          '1320164612301389875',
        ],
      },
    )
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const random = Math.random()
    const embed = random < 0.25 && (config.openaiApiKey !== '')
      ? await withSpan('generate.aiDadJoke', async () => {
        const result = await Result.fromAsync(async () => this.aiDadJoke())
        const aiDadJoke = result.unwrapOr(null)
        if (aiDadJoke !== null) {
          return new EmbedBuilder()
            .setTitle('Dad Joke')
            .setDescription(aiDadJoke)
            .setColor('Blurple')
        }
        return undefined
      })
      : await withSpan('fetch.iCanHazDadJoke', async () => {
        const result = await Result.fromAsync(async () => this.iCanHazDadJoke())
        const iCanHazDadJoke = result.unwrapOr(undefined)
        if (iCanHazDadJoke) {
          return new EmbedBuilder()
            .setTitle('Dad Joke')
            .setDescription(iCanHazDadJoke.joke)
            .setColor('Blurple')
            .setFooter({ text: `Powered by icanhazdadjoke` })
        }
        return undefined
      })

    if (!embed) {
      throw new Error('Failed to generate dad joke')
    }

    await withSpan('interaction.reply', async () => interaction.reply({
      embeds: [embed],
    }))
  }

  private async iCanHazDadJoke() {
    const response = await fetch('https://icanhazdadjoke.com/', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })
    if (!response.ok) {
      return
    }
    return await response.json() as iCanHazDadJokeResponse
  }

  private async aiDadJoke() {
    const { openai } = this.container.svc

    const randomCategory = dadJokeCategories[Math.floor(Math.random() * dadJokeCategories.length)]
    const dadJokePrompts = [
      `Tell me a dad joke about ${randomCategory}.`,
      `Can you share a dad joke related to ${randomCategory}?`,
      `Give me a funny dad joke about ${randomCategory}.`,
      `I need a dad joke about ${randomCategory}. Got one?`,
      `What's a dad joke about ${randomCategory}?`,
    ]
    const prompt = dadJokePrompts[Math.floor(Math.random() * dadJokePrompts.length)]
    const response = await withSpan('openai.createCompletion', async () => {
      return openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: `You are a humorous assistant designed to tell dad jokes. A dad joke is typically a simple, pun-based, and light-hearted joke that is often intentionally cheesy or corny. Your goal is to make people laugh with a classic dad joke style—short, witty, and playful. When asked for a dad joke, make sure it is funny, but in a family-friendly way, and steer clear of anything that could be considered political, inappropriate, sensitive or divisive. If a category is specified (e.g., animals, food, technology), tell a joke related to that topic. If no category is specified, feel free to make a random dad joke. Please avoid any conversation, just provide the joke itself. Feel free to use emojis if they help convey the joke.` },
          { role: 'user', content: prompt },
        ],
        max_tokens: 50,
        temperature: 0.9,
        frequency_penalty: 0.8,
        presence_penalty: 0.6,
      })
    })
    return response.choices[0].message.content
  }
}
