/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enables dark mode toggling via a 'dark' class on the html/body element
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Outfit', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        // Our customized design system colors
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#059669', // Deep Emerald Green (Brand Primary)
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        accent: {
          50: '#f7fee7',
          100: '#ecfccb',
          200: '#d9f99d', // Vibrant Lime Green (Highlight/Active State)
          300: '#bef264',
          400: '#a3e635',
          500: '#84cc16',
          600: '#65a30d',
          700: '#4d7c0f',
          800: '#3f6212',
          900: '#365314',
        }
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'elevated': '0 10px 30px -5px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}