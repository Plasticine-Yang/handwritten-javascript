/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  watchPathIgnorePatterns: ['/node_modules/', '/dist/', '/.git/'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  rootDir: __dirname,
  testMatch: ['<rootDir>/src/**/__test__/**/*.spec.[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/']
}
