import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#08080a",
          1: "#0c0c10",
          2: "#111116",
          3: "#18181e",
          4: "#1e1e26",
        },
        fg: {
          DEFAULT: "#f4f4f5",
          dim: "#a1a1aa",
          mute: "#71717a",
          faint: "#3f3f46",
        },
        border: {
          DEFAULT: "rgba(255,255,255,0.06)",
          strong: "rgba(255,255,255,0.10)",
        },
        accent: {
          DEFAULT: "#6366f1",
          2: "#818cf8",
          glow: "rgba(99,102,241,0.15)",
        },
        good: "#34d399",
        warn: "#fbbf24",
        bad: "#f87171",
        "c-blue": "#60a5fa",
        "c-purple": "#a78bfa",
        "c-cyan": "#22d3ee",
      },
      fontFamily: {
        sans: ["Geist", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "ui-monospace", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 200ms ease",
        shimmer: "shimmer 1.8s linear infinite",
        pulse: "pulse 1.2s ease-in-out infinite",
        "slide-up": "slideUp 300ms ease",
        "slide-in-left": "slideInLeft 200ms ease",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
