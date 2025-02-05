/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
      extend: {
        colors: {
          primary: "#4357AD",
          secondary: "#FBFBEF",
        },
        fontFamily: {
          bangers: ["Bangers", "cursive"],
        },
      },
    },
    darkMode: "class",
    plugins: [],
  };
  