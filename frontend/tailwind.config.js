/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FBF7F0",
        sand: "#F3EAD9",
        teal: {
          soft: "#7FB3AE",
          deep: "#4F8A84",
        },
        blush: "#F5D8CE",
        cocoa: "#5B4A42",
      },
      fontFamily: {
        rounded: ["'Nunito'", "ui-rounded", "system-ui", "sans-serif"],
      },
      boxShadow: {
        cozy: "0 4px 20px rgba(91, 74, 66, 0.08)",
      },
    },
  },
  plugins: [],
};
