import process from 'node:process'
import { type } from 'arktype'
import { makeTypedEnvironment } from '#lib/util/env.js'

const envSchema = type({
  'NODE_ENV': ['"development"|"test"|"production"', '=', 'development'],

  // Discord Config
  'BOT_TOKEN': 'string',
  'BOT_OWNERS?': 'string[]',

  // OpenAI Config
  'OPENAI_API_KEY': ['string', '=', ''],
  'OPENAI_ORGANIZATION?': 'string',
  'OPENAI_PROJECT?': 'string',

  // Redis Config
  'REDIS_URL': 'string',

  // Logger Config
  'LOG_LEVEL': [
    '"silent"|"fatal" | "error" | "warn" | "info" | "debug" | "trace"',
    '=',
    'info',
  ],
  'LOG_PRETTY?': type('"true"|"false"|"1"|"0"').pipe.try(v => v === 'true' || v === '1'),

  'DISABLE_MODULES?': type('"moderation"|"fun"').array(),

  // Moderation Config
  'MOD_LOG_CHANNEL_ID': 'string',
  'HONEYPOT_ROLE_ID': 'string',

  // Fun Config
  'CAPY_CHANNEL_ID': 'string',
})

const getEnv = makeTypedEnvironment((d) => {
  const out = envSchema(d)
  if (out instanceof type.errors) {
    console.error('Error validating environment variables:')
    console.error(out.summary)
    process.exit(1)
  }
  return out
})

export const config = getEnv(process.env)
export type Config = typeof config
