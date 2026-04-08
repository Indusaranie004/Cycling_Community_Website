/** tailwind.config.js */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#262626',
          sage: '#ACBFA4',
          cream: '#E2E8CE',
          orange: '#FF7F11',
          red: '#FF1B1C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};