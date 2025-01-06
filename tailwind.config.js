/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{hbs,html,js}'],
  theme: {
    extend: {
      fontFamily: {
        roboto: [`sans-serif`],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
