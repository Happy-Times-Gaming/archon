import { esbuildPluginVersionInjector } from 'esbuild-plugin-version-injector'
import { defineConfig } from 'tsup'

// defined folders from .sapphirerc.json
const sapphireFolders = ['arguments', 'commands', 'interaction-handlers', 'listeners', 'preconditions'].flatMap(
  folder => [`src/${folder}/*.ts`, `src/modules/*/${folder}/*.ts`],
)

export default defineConfig({
  clean: true,
  bundle: true,
  // dts: true,
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
  esbuildPlugins: [esbuildPluginVersionInjector()],
})
