/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FFFFFF",
        ink: "#000000",
        bone: "#F0F0F0",
        ash: "#666666",
        rule: "#D4D4D4",
        alert: "#C8102E",
        // Alias de los nombres antiguos (los usa el panel de admin)
        page: "#FFFFFF",
        surface: "#FFFFFF",
        line: "#D4D4D4",
        mist: "#666666",
        coral: "#C8102E",
      },
      fontFamily: {
        display: ["Archivo", "Arial Narrow", "Helvetica Neue", "Arial", "sans-serif"],
        sans: ["Geist", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      fontWeight: {
        500: "500",
        600: "600",
        700: "700",
      },
      maxWidth: {
        wrap: "1240px",
      },
    },
  },
  plugins: [],
};
