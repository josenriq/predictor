const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');

module.exports = [
  {
    input: 'out-tsc/lambda/handlers/check-matches.js',
    output: {
      file: 'dist/check-matches.js',
      format: 'cjs',
    },
    plugins: [commonjs(), json()],
  },
];
