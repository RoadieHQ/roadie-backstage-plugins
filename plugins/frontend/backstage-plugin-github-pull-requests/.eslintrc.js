module.exports = {
  extends: [require.resolve('@backstage/cli/config/eslint')],
  rules: {
    'notice/notice': 'off',
    'jsx-a11y/no-autofocus': 'off',
  },
};
