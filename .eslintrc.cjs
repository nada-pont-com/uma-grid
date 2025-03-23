module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  extends: [
    'standard-with-typescript',
    'plugin:react/recommended',
    'airbnb',
    'eslint:recommended',
    'plugin:react/jsx-runtime',
    'plugin:prettier/recommended',
    'prettier',
  ],
  settings: {
    'import/resolver': {
      node: {
        paths: ['src'],
      },
    },
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      tsx: true,
      modules: true,
      experimentalObjectRestSpread: true,
    },
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'no-undef': 'off',
      },
    },
  ],
  plugins: ['react', 'react-refresh', 'react-hooks', 'jsx-a11y', 'prettier'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'prettier/prettier': ['warn'],
    'react/jsx-filename-extension': [
      1,
      { extensions: ['.js', '.jsx', '.tsx'] },
    ],
    'react/jsx-props-no-spreading': 0,
    'no-console': 'off',
    'promise/param-names': 0,
    'no-return-await': 0,
    'no-param-reassign': 0,
    'no-use-before-define': 0,
    'jsx-a11y/control-has-associated-label': 0,
    'no-unused-vars': 1,

    'react-hooks/rules-of-hooks': 'warn',

    'import/no-unresolved': 0,
    'react/require-default-props': 0,
    'import/extensions': 0,
    'no-unused-expressions': 0,

    '@typescript-eslint/require-array-sort-compare': 0,
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/unbound-method': 0,
    '@typescript-eslint/no-misused-promises': 0,
    '@typescript-eslint/no-this-alias': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/no-floating-promises': 0,
    '@typescript-eslint/strict-boolean-expressions': 0,
    '@typescript-eslint/no-confusing-void-expression': 0,
    '@typescript-eslint/no-unsafe-argument': 0,
    '@typescript-eslint/prefer-optional-chain': 0,
    '@typescript-eslint/promise-function-async': 0,
    '@typescript-eslint/no-unused-vars': 0,
    '@typescript-eslint/restrict-template-expressions': 0,
    '@typescript-eslint/no-dynamic-delete': 0,
    '@typescript-eslint/prefer-nullish-coalescing': 0,
    '@typescript-eslint/restrict-plus-operands': 0,
  },
};
