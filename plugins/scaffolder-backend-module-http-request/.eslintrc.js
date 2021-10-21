const path = require('path');

module.exports = {
  extends: [require.resolve('@backstage/cli/config/eslint.backend')],
  rules: {
    'notice/notice': [
      'error',
      {
        templateFile: path.resolve(
          __dirname,
          '../../roadie-notice-template.txt',
        ),
      },
    ],
  },
};
