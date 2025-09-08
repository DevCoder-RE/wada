/* eslint-disable */
export default {
  displayName: 'ui-components',
  preset: '../../jest.preset.js',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/ui-components',
  collectCoverageFrom: ['src/**/*.{ts,tsx,js,jsx}'],
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
};