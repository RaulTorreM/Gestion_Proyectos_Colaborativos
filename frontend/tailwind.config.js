/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          zinc: {
            800: '#27272a',
            900: '#18181b',
          }
        }
      },
    },
    plugins: [],
  }