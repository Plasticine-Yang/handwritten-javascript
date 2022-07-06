/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  watchPathIgnorePatterns: ['/node_modules/', '/dist/', '/.git/'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  rootDir: __dirname,
  testMatch: ['<rootDir>/src/**/__test__/**/*.spec.[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/'],
  // 让 setTimeout、setInterval 等计时器 API 变成 fakeTimer
  // 否则就需要在每个用到计时器的单元测试中手动调用一下 jest.useFakeTimers
  fakeTimers: {
    enableGlobally: true
  }
}
