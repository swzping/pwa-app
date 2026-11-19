module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['@babel/plugin-transform-export-namespace-from'],
    ['react-native-worklets-core/plugin'],
    [
      'module-resolver',
      {
        root: ['.'],
        extensions: ['.ios.js', '.android.js', '.js', '.jsx', '.json'],
        alias: require('./aliases.json'),
      },
    ],
    ['react-native-reanimated/plugin'],
  ],
  env: {
    production: {
      plugins: ['react-native-paper/babel', 'transform-remove-console'],
    },
  },
};
