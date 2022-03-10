module.exports = {
  extends: ['lokua'],
  globals: {
    p5: false,
  },
  rules: {
    'no-unused-vars': [
      'error',
      {
        varsIgnorePattern: 'cross|u',
        argsIgnorePattern: 'cross|u',
      },
    ],
  },
}
