module.exports = require('@backstage/cli/config/eslint-factory')(__dirname, {
  rules: {
    'notice/notice': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'no-param-reassign': 'off',
  },
});
