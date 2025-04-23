/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Usa 'class' para control manual con clases dark:
    theme: {
      extend: {
        colors: {
          dark: {
            900: '#111111',
            800: '#1a1a1a',
            700: '#252525',
          },
          // Colores personalizados para modo oscuro
          dark: {
            bg: '#000000',
            card: '#1a1a1a',
            text: {
              primary: '#ffffff',
              secondary: '#e5e5e5'
            },
            border: '#2d2d2d'
          }
        }
      },
    },
    plugins: [],
    safelist: [
      'bg-dark-900',
      'bg-dark-800',
      'bg-dark-700',
      'text-dark-text-primary',
      'text-dark-text-secondary',
      'border-dark-border',
      'dark:bg-dark-bg',
      'dark:bg-dark-card',
      'dark:text-dark-text-primary',
      'dark:hover:bg-dark-800'
    ]
  }