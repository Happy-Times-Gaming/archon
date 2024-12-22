import type { OpenAI } from 'openai'
import type { ModerationService } from '#lib/services/moderation.js'

declare module '@sapphire/pieces' {
  interface Container {
    svc: ServiceContainer
  }
}

export interface ServiceContainer {
  openai: OpenAI
  moderation: ModerationService
}
