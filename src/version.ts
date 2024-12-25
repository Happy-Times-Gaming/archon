export const VERSION: string = '[VI]{{inject}}[/VI]'
// eslint-disable-next-line node/prefer-global/process
export const COMMIT = process.env.ARCHON_COMMIT ?? ''
export const FULL_VERSION = COMMIT ? `${VERSION}-${COMMIT}` : VERSION
