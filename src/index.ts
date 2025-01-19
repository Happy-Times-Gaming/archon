import '#lib/setup/init.js'
import { container } from '@sapphire/framework'
import { BullMQOtel } from 'bullmq-otel'
import { ActivityType } from 'discord.js'
import { OpenAI } from 'openai'
import { config } from '#config.js'
import { ArchonClient } from '#lib/archonClient.js'
import { logger } from '#lib/logger.js'
import { ModerationService } from '#lib/services/moderation.js'
import type { ServiceContainer } from '#typings.js'

const client = new ArchonClient({
  intents: ['Guilds', 'GuildMessages', 'GuildMembers'],
  baseUserDirectory: import.meta.dirname,
  presence: {
    activities: [{
      name: 'Observing the cult.',
      type: ActivityType.Custom,
      url: 'https://www.empyrealxiv.com/',
    }],
  },
  tasks: {
    queue: '{scheduled-tasks}',
    bull: {
      telemetry: new BullMQOtel('bullmq'),
      connection: {
        url: config.redisUrl,
      },
    },
  },
  logger: {
    instance: logger.child({
      context: 'discord',
    }),
  },
})

async function main() {
  container.svc = {
    openai: new OpenAI({
      organization: config.openaiOrganization,
      project: config.openaiProject,
      apiKey: config.openaiApiKey,
    }),
    moderation: new ModerationService(container),
  } as ServiceContainer
  await client.registerModules()
  await client.login(config.botToken)
}

void main()
