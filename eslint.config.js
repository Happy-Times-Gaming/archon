import antfu from '@antfu/eslint-config'

export default antfu(
  {
    typescript: {
      tsconfigPath: 'tsconfig.json',
      overridesTypeAware: {
        'ts/no-unsafe-assignment': 'off',
        'ts/no-unsafe-call': 'off',
        'ts/no-namespace': 'off',
        // 'ts/no-unsafe-member-access': 'off',
      },
    },
    formatters: true,
  },
  {
    name: 'perfectionist-overrides',
    rules: {
      'perfectionist/sort-exports': [
        'error',
        { order: 'asc', type: 'natural' },
      ],
      'perfectionist/sort-imports': [
        'error',
        {
          groups: [
            'setup',
            // 'otel',
            'type',
            ['parent-type', 'sibling-type', 'index-type'],
            'builtin',
            'external',
            ['internal', 'internal-type'],
            ['parent', 'sibling', 'index'],
            'side-effect',
            'object',
            'unknown',
          ],
          internalPattern: ['^#.*'],
          newlinesBetween: 'ignore',
          order: 'asc',
          type: 'natural',
          customGroups: {
            type: {},
            value: {
              setup: ['#lib/setup'],
              // otel: ['./otel'],
            },
          },
        },
      ],
    },
  },
  {
    name: 'import-rules',
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@sapphire/framework',
              importNames: ['Listener', 'Command', 'InteractionHandler'],
              message: 'Please import Listener from #lib/sapphire instead.',
            },
          ],
        },
      ],
    },
  },
)
