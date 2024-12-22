import { register } from 'node:module'

register('@opentelemetry/instrumentation/hook.mjs', import.meta.url, {
  parentURL: import.meta.url,
  data: { exclude: [/openai/] },
})
