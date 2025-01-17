import process from 'node:process'
import { execaSync } from 'execa'
import { defineConfig } from 'tsup'

// defined folders from .sapphirerc.json
const sapphireFolders = ['arguments', 'commands', 'interaction-handlers', 'listeners', 'preconditions'].flatMap(
  folder => [`src/${folder}/*.ts`, `src/modules/*/${folder}/*.ts`],
)

/**
 * Retrieves the current Git commit hash synchronously.
 * @returns {string} The current Git commit hash.
 * @throws {Error} If the command fails or Git is not initialized.
 */
export function getGitHashSync(): string {
  if (typeof process.env.__GIT_HASH__ === 'string') {
    return process.env.__GIT_HASH__
  }

  try {
    const { stdout } = execaSync('git', ['rev-parse', '--short', 'HEAD'])
    return stdout.trim()
  }
  catch (error) {
    if (error instanceof Error) {
      // Handle the error when it is an instance of Error
      throw new TypeError(`Failed to retrieve Git hash: ${error.message}`)
    }
    else {
      // Handle unknown errors
      throw new TypeError('Failed to retrieve Git hash due to an unknown error.')
    }
  }
}

export default defineConfig({
  clean: true,
  bundle: true,
  entry: ['src/index.ts', 'src/loaderHook.ts', 'src/instrumentation.ts', ...sapphireFolders],
  format: ['esm'],
  minify: false,
  tsconfig: 'tsconfig.build.json',
  target: 'es2022',
  splitting: true,
  skipNodeModulesBundle: true,
  sourcemap: true,
  shims: false,
  keepNames: true,
  define: {
    __GIT_HASH__: JSON.stringify(getGitHashSync()),
  },
})
