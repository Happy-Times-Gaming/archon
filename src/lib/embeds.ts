import { EmbedBuilder } from 'discord.js'

function base() {
  return new EmbedBuilder().setColor(0xD08132)
}

function card(title: string, description?: string) {
  const embed = base().setTitle(title)
  if (typeof description === 'string')
    embed.setDescription(description)
  return embed
}

export default {
  base,
  card,
}
