/** @type {import('tailwindcss').Config} */
export default {
  mode: ['jit'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'pTextColor': '#3D4468',
        'hTextColor': '#031640',
        'hLinkColor': '#0D3077'
      },
    }
  },
  plugins: [],
}

