module.exports = require('@backstage/cli/config/eslint-factory')(__dirname, {
  rules: {
    'notice/notice': 'off',
    '@typescript-eslint/camelcase': 0,
    'no-console': [0],
  },
});
