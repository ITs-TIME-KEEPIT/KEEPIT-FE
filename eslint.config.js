// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');

module.exports = defineConfig([
  expoConfig,
  prettierConfig, // 마지막에 둬서 Prettier와 겹치는 포맷 규칙을 끔
  {
    ignores: ['dist/*', '.expo/*'],
  },
]);
