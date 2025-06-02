/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Important : utilise la classe 'dark' pour activer le mode sombre
  theme: {
    extend: {
      // Vous pouvez ajouter des couleurs personnalisées ici si nécessaire
    },
  },
  plugins: [],
}

