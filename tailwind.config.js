/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        page: "#FFFFFF",
        surface: "#FFFFFF",
        line: "#111111",
        ink: "#0A0A0A",
        mist: "#6B6B6B",
        coral: "#B3261E",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
