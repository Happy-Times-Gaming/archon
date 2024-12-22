import { type CamelKeys, camelKeys } from 'string-ts'

export function makeTypedEnvironment<T>(schema: (v: unknown) => T) {
  let cache: CamelKeys<T> | undefined
  return (args: Record<string, unknown>) => {
    if (cache === undefined) {
      cache = camelKeys(schema({ ...args }))
    }
    return cache
  }
}
