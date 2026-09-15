import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#070707",
        surface: "#0e0e11",
        "surface-card": "rgba(14, 14, 17, 0.9)",
        accent: {
          DEFAULT: "#F97316",
          amber: "#F59E0B",
          glow: "rgba(249, 115, 22, 0.12)",
        },
        crimson: {
          DEFAULT: "#EF4444",
          subtle: "rgba(239, 68, 68, 0.12)",
        },
        emerald: {
          DEFAULT: "#10B981",
          subtle: "rgba(16, 185, 129, 0.12)",
        }
      },
      fontFamily: {
        bagnard: ["var(--font-bagnard)", "serif"],
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "-apple-system", "sans-serif"],
        mono: ["Geist Mono", "JetBrains Mono", "monospace"],
      },
      animation: {
        "marquee": "marquee 32s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
