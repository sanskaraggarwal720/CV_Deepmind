/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        noir: '#0B0B0F',
        surface: '#17171D',
        'accent-violet': '#7C5CFF',
        'accent-mint': '#3DDC97',
        'text-primary': '#F5F5F7',
        'text-muted': '#8A8A94',
        error: '#FF5C5C',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      fontSize: {
        '13': '13px',
        '15': '15px',
        '18': '18px',
        '28': '28px',
      }
    },
  },
  plugins: [],
}
