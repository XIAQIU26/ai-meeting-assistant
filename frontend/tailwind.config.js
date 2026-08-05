/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        research: {
          50: '#eef6ff',
          100: '#d9ebff',
          500: '#3278c6',
          700: '#1f4f86'
        }
      },
      boxShadow: {
        notion: '0 1px 2px rgba(15, 23, 42, 0.06)'
      }
    }
  },
  plugins: []
};
