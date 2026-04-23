/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        clay: "#a05a2c",
        sand: "#f4e3c3",
        forest: "#27543f",
        ember: "#d46a2f"
      },
      fontFamily: {
        display: ['"Palatino Linotype"', "Book Antiqua", "Georgia", "serif"]
      }
    }
  },
  plugins: []
};
