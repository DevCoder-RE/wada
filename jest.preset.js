const { name } = require('./package.json');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js'],
  collectCoverageFrom: ['src/**/*.{ts,js}'],
  testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)'],
  transform: {
    '^.+\\.(ts|js|html)$': 'ts-jest',
  },
  resolver: '@nx/jest/plugins/resolver',
  coverageReporters: ['html'],
  passWithNoTests: true,
};