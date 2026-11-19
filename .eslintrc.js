module.exports = {
  root: true,
  extends: '@react-native',
  env: {
    es2020: true,
    node: true,
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    sourceType: 'module',
    allowImportExportEverywhere: false,
    codeFrame: false,
  },
  plugins: ['react', 'simple-import-sort'],
  rules: {
    'import/prefer-default-export': 'off',
    'import/no-unresolved': 'off',
    'no-alert': 0,
    'react/react-in-jsx-scope': 'off',
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    'react/jsx-props-no-spreading': 'off',
    'react/prop-types': 0,
    'react/no-array-index-key': 0,
    'import/no-named-as-default': 0,
    'react-hooks/rules-of-hooks': 0,
    'react-hooks/exhaustive-deps': 0,
    'react-native/no-inline-styles': 0,
    radix: 0,
    'max-len': 0,
    'simple-import-sort/imports': [
      'error', // Close use 'off'
      {
        groups: [
          // 1. Node.js built-in modules (if any)
          [
            '^(assert|buffer|child_process|cluster|dgram|dns|domain|events|fs|http|https|net|os|path|punycode|querystring|readline|stream|string_decoder|timers|tls|tty|url|util|vm|zlib)$',
          ],
          // 2. React core
          ['^react$', '^react-native$'],
          // 3. React Native Community Library (beginning with React-native)
          ['^react-native-'],
          // 4. Navigation
          ['^@react-navigation'],
          // 5. Other external dependencies (organization packages starting with @)
          ['^@\\w'],
          // 6. Third-party libraries (beginning with a letter)
          ['^lodash$', '^react-i18next$', '^[^@.]'],
          // 7. Internal project modules (starting with @app/)
          ['^@app/'],
          // 8. Relative path import
          // Parent directory
          ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
          // Peer directory
          ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
          // 9. Type Definition
          ['^.+\\.types?$', '^.+\\.d\\.ts$'],
          // 10. Style file
          ['^.+\\.(css|scss|less|styl)$'],
        ],
      },
    ],
    'simple-import-sort/exports': 'error',
  },
};
