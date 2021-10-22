module.exports = {
  extends: [require.resolve('@backstage/cli/config/eslint')],
  rules: {
    'notice/notice': 'off',
    // Related issue: https://github.com/typescript-eslint/typescript-eslint/issues/2077
    // I'm not sure which package in the @backstage eslint config that we are extending is
    // causing this issue but one of them is. Eventually the @backstage eslint config will
    // be updated to support V3 of @typescript-eslint and this rule can be defaulted.
    '@typescript-eslint/camelcase': 0,
  },
};
