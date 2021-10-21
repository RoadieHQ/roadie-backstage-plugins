const path = require('path');

module.exports = {
  extends: [require.resolve('@backstage/cli/config/eslint')],
  rules: {
    'no-restricted-imports': 'off',
  },
};