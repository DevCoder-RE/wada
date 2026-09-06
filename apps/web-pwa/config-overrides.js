const path = require('path');

const libsDir = path.resolve(__dirname, '../../libs');

module.exports = function override(config) {
  const babelRule = config.module.rules
    .flatMap((rule) => (rule.oneOf ? rule.oneOf : [rule]))
    .find(
      (rule) =>
        rule.test instanceof RegExp &&
        rule.test.test('file.tsx') &&
        rule.loader &&
        String(rule.loader).includes('babel-loader')
    );

  if (babelRule) {
    babelRule.include = [babelRule.include, libsDir].flat();
  }

  return config;
};