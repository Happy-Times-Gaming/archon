import type { OpenAI } from 'openai'
import type { ModerationService } from '#lib/services/moderation.js'

declare global {
  interface ImportMetaEnv {
    readonly BUILD_SHA: string
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

declare module '@sapphire/pieces' {
  interface Container {
    svc: ServiceContainer
  }
}

export interface ServiceContainer {
  openai: OpenAI
  moderation: ModerationService
}
