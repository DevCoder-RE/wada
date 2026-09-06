// @ericblade/quagga2 is browser-only and pulls native dependencies (sharp)
// when loaded in Node. Replace it with this stub for all Jest tests.
module.exports = {
  init: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
  onDetected: jest.fn(),
};