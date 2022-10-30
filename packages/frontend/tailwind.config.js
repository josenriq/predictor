/** @type {import('tailwindcss').Config} */

const colors = require('tailwindcss/colors');
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
      fontFamily: {
        'fancy': ['Reem Kufi Ink', 'sans-serif'],
      },
      colors: {
        brand: '#83243A',
        muted: colors.gray['500'],
        light: colors.gray['100'],
      },
    },
  },
  plugins: [],
};
