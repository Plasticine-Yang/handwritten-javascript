/**
 * @type { import('eslint').ESLint.ConfigData }
 */
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module'
  },
  extends: ['plugin:prettier/recommended'],
  plugins: ['jest']
}
