module.exports = {
  root: true,

  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    'airbnb-base',
  ],

  rules: {
    'max-len': [
      'error',
      180,
      2,
      {
        ignoreUrls: true,
        ignoreComments: false,
        ignoreRegExpLiterals: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
      },
    ],

    'arrow-parens': [
      'error',
      'always',
    ],

    'no-use-before-define': [
      'error',
      {
        functions: false,
      },
    ],

    'no-unused-vars': [
      'error',
      {
        args: 'none',
      },
    ],

    'prefer-destructuring': [0],
    'consistent-return': [1],
    'arrow-body-style': [0],
  },
};
