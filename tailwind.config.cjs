/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#3264ff",
        secondary: "#F5F5F5",
        dark: "#343a40",
        light: "#FFF",
        tertiary: "#cdc7ecea",
      },
      backgroundImage: {
        hero: "url('/src/assets/graphics/solid4.jpg')",
        bg1: "url('/src/assets/graphics/bg1.jpg')",
        bg2: "url('/src/assets/graphics/bg2.avif')",
        bg3: "url('/src/assets/graphics/bgpatt.png')",
        bg4: "url('/src/assets/graphics/bg3.jpg')",
        onlineclass: "url('/src/assets/graphics/online.jpg')",
        exam: "url('/src/assets/graphics/exam.jpg')",
        gedtest: "url('/src/assets/graphics/test2.avif')",
        chatBg: "url('/src/assets/graphics/w2.jpg')",
      },

      borderWidth: {
        3: "3px",
      },

      zIndex: {
        60: "60",
      },
    },
  },
  plugins: [],
});
