module.exports = {
  extends: ['lokua'],
  globals: {
    p5: false,
    CCapture: false,
  },
  rules: {
    'no-unused-vars': [
      'error',
      {
        // varsIgnorePattern: 'u',
        // argsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
  },
}
