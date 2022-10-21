const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');

module.exports = {
  input: 'out-tsc/index.js',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
  },
  plugins: [commonjs(), json()],
};
