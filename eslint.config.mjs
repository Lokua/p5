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
      curly: 'error',
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
