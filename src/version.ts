declare const __GIT_HASH__: string | undefined

export const VERSION: string = __GIT_HASH__ ?? 'unknown'
