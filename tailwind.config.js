/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}", // Pour les fichiers dans pages/
    "./components/**/*.{js,ts,jsx,tsx}", // Pour les composants
    "./app/**/*.{js,ts,jsx,tsx}", // Si tu utilises le dossier app/ (Next.js 13+)
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
