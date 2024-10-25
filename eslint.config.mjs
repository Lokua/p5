import lokuaConfig from 'eslint-config-lokua'

export default [
  ...lokuaConfig,
  {
    languageOptions: {
      globals: {
        p5: 'readonly',
      },
    },
  },
]
