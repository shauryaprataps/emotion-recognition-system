/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Poppins", "sans-serif"],
        body: ["Manrope", "sans-serif"],
      },
      boxShadow: {
        glow: "0 24px 80px rgba(15, 23, 42, 0.24)",
      },
      colors: {
        brand: {
          500: "#0ea5e9",
          400: "#38c8ff",
          200: "#b8ebff",
        },
      },
    },
  },
  plugins: [],
};
