/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9f0',
          100: '#dcf0dc',
          200: '#bce2bc',
          300: '#8ecc8e',
          400: '#5cad5c',
          500: '#3a8f3a',
          600: '#2e7d32',
          700: '#256328',
          800: '#204f22',
          900: '#1c421f',
        },
      },
    },
  },
  plugins: [],
}