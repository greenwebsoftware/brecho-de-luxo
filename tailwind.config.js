/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#fefdf7',
          100: '#fdf8e1',
          200: '#faedb8',
          300: '#f5d97a',
          400: '#efc040',
          500: '#d4a017',
          600: '#b8860b',
          700: '#926a08',
          800: '#6b4e06',
          900: '#4a3504',
        },
        luxo: {
        50:  '#f5f5f5',
        100: '#e8e8e8',
        200: '#d0d0d0',
        300: '#a0a0a0',
        400: '#606060',
        500: '#2a2a2a',
        600: '#222222',
        700: '#1a1a1a',
        800: '#141414',
        900: '#0a0a0a',
      },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans:  ['Inter', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
