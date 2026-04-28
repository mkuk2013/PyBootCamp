import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Python blue brand palette (anchored on #3776AB)
        brand: {
          50: "#eef6fc",
          100: "#d6eaf6",
          200: "#aed4ed",
          300: "#7eb8df",
          400: "#4f9ad0",
          500: "#3776AB",
          600: "#2c5d88",
          700: "#244c6e",
          800: "#1d3d59",
          900: "#172f44",
        },
        // Python yellow accent (anchored on #FFD43B)
        py: {
          50: "#fffceb",
          100: "#fff6c7",
          200: "#ffec88",
          300: "#FFD43B",
          400: "#f5c518",
          500: "#d9a808",
          600: "#a78005",
          700: "#7a5d05",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "monospace"],
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "py-float": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-8px) rotate(2deg)" },
        },
        shimmer: {
          "100%": { backgroundPosition: "200% center" },
        },
        "blob": {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "33%": { transform: "translate(20px,-30px) scale(1.05)" },
          "66%": { transform: "translate(-15px,15px) scale(0.95)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "progress-slide": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(300%)" },
        },
        "dot-bounce": {
          "0%, 80%, 100%": { transform: "translateY(0)", opacity: "0.4" },
          "40%": { transform: "translateY(-6px)", opacity: "1" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up .6s ease-out both",
        "py-float": "py-float 6s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
        blob: "blob 12s ease-in-out infinite",
        "spin-slow": "spin-slow 3s linear infinite",
        "progress-slide": "progress-slide 1.4s cubic-bezier(0.4,0,0.2,1) infinite",
        "dot-bounce": "dot-bounce 1.2s ease-in-out infinite",
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(55, 118, 171, 0.5)",
        "glow-yellow": "0 0 40px -10px rgba(255, 212, 59, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
