// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// @ericblade/quagga2 is browser-only and pulls native deps (sharp) in Node.
// Stub it globally so any component that imports it can be tested.
jest.mock('@ericblade/quagga2', () => ({
  init: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
  onDetected: jest.fn(),
}));
