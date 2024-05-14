/** @type {import('tailwindcss').Config} */
export default {
  mode: ['jit'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'pTextColor': '#3D4468',
        'hTextColor': '#031640',
        'hLinkColor': '#0D3077',
        'bColor': '#707070',
        'errorBg': "#FFE0E0",
        'errorColor': '#E21D1D'
      },
      boxShadow: {
        errorShadow: '0px 3px 6px rgba(255, 0, 0, 0.15)',
      },
    }
  },
  plugins: [],
}

