/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rudi: {
          teal: "#009688",
          yellow: "#FFB300",
          coral: "#FF6F61",
          sand: "#FDF6EC",
          maroon: "#3B1F1E",
        },
      },
      fontFamily: {
        heading: ["Poppins", "ui-sans-serif", "system-ui"],
        body: ["Nunito Sans", "ui-sans-serif", "system-ui"],
      },
      borderRadius: {
        rudi: "12px",
      },
      boxShadow: {
        "rudi-card": "0 12px 30px -18px rgba(59, 31, 30, 0.35)",
        "rudi-hover": "0 14px 40px -20px rgba(0, 150, 136, 0.45)",
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { transform: "scale(0.98)" },
          "50%": { transform: "scale(1.02)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
        "slide-up": "slide-up 0.18s ease-out forwards",
      },
    },
  },
  plugins: [],
}
