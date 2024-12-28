import pkg from '../package.json' assert { type: 'json' }

export const VERSION: string = pkg.version ?? 'dev'
