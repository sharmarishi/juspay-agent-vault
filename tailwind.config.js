/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        juspay: "#4F46E5",
      },
    },
  },
  plugins: [],
};
