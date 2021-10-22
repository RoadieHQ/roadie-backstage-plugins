const { off } = require("process");

module.exports = {
  extends: [require.resolve('@backstage/cli/config/eslint')],
  rules: {
    'notice/notice': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'no-param-reassign': 'off'
  },
};
