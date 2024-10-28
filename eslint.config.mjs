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
      'object-shorthand': 'error',
      'prefer-const': 'error',
      'no-use-before-define': [
        'error',
        {
          functions: false,
        },
      ],
    },
  },
]
