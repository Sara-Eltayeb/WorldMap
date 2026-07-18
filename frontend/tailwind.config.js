/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          50: "#1e293b",
          100: "#1a2332",
          200: "#151d2a",
          300: "#111827",
          400: "#0f172a",
          500: "#0b1121",
          600: "#070b18",
          700: "#03050f",
          800: "#020308",
          900: "#000000",
        },
        accent: {
          blue: "#3b82f6",
          purple: "#8b5cf6",
          emerald: "#10b981",
          cyan: "#06b6d4",
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      fontFamily: {
        sans: [
          "Inter",
          "SF Pro Display",
          "Segoe UI",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-in-right": "slideInRight 0.4s ease-out",
        glow: "glow 2s ease-in-out infinite alternate",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(40px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(59, 130, 246, 0.5)" },
          "100%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.8)" },
        },
      },
    },
  },
  plugins: [],
};
