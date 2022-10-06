/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme');

let containerScreens = Object.assign({}, defaultTheme.screens);
delete containerScreens['xl'];
delete containerScreens['2xl'];

module.exports = {
  prefix: 'tw-',
  content: ['./src/**/*.{html,ts}'],
  theme: {
    container: {
      screens: containerScreens,
    },
    extend: {
      colors: {
        brand: '#83243A',
      },
    },
  },
  plugins: [],
};
