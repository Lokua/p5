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
      curly: 'off',

      'object-shorthand': 'error',
      'prefer-const': 'error',
      'no-unused-vars': [
        'warn',
        {
          varsIgnorePattern: (() =>
            [
              'callAtInterval',
              'getAverageFrameRate',
              'profile',
              'times',
              'mapTimes',
              'times',
              'PHI',
              'chroma',
              'center',
              'ah',
              'AnimationHelper',
            ].join('|'))(),
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      'no-use-before-define': [
        'error',
        {
          functions: false,
          classes: false,
        },
      ],
    },
  },
]
