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
          50:  '#faf7ff',
          100: '#f3ecff',
          200: '#e5d5ff',
          300: '#cfb0ff',
          400: '#b07fff',
          500: '#8b52f7',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#1a0533',
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
