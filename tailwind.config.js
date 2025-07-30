/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,ts,jsx,tsx}", // pastikan Tailwind scan semua file di folder src
    ],
    theme: {
      extend: {
        animation: {
          fadeIn: 'fadeIn 0.2s ease-out',
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: 0, transform: 'translateY(8px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' },
          },
        },
      },
    },
    plugins: [],
  }
  