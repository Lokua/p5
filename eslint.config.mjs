import lokuaConfig from 'eslint-config-lokua'

export default [
  ...lokuaConfig,
  {
    languageOptions: {
      globals: {
        p5: 'readonly',
      },
    },
    rules: {
      curly: 'warn',
      'object-shorthand': 'error',
      'prefer-const': 'error',
      'no-unused-vars': [
        'error',
        {
          varsIgnorePattern:
            'callAtInterval|getAverageFrameRate|profile|times|mapTimes',
        },
      ],

      'no-use-before-define': [
        'error',
        {
          functions: false,

          // note to self: do not port to lokua config,
          // this is just for this project
          classes: false,
        },
      ],
    },
  },
]
