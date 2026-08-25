import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          DEFAULT: "#9333EA",
          50: "#FAF5FF",
          100: "#F3E8FF",
          200: "#E9D5FF",
          300: "#D8B4FE",
          400: "#C084FC",
          500: "#A855F7",
          600: "#9333EA",
          700: "#7E22CE",
          800: "#6B21A8",
          900: "#4A1478",
        },
        blue: {
          DEFAULT: "#2563EB",
          50: "#EFF4FF",
          100: "#DBE7FE",
          500: "#2563EB",
          600: "#1D4FC4",
          700: "#173D97",
        },
        orange: {
          DEFAULT: "#F97316",
          50: "#FFF4EB",
          100: "#FFE4CC",
          500: "#F97316",
          600: "#DD5C05",
        },
        ink: {
          DEFAULT: "#12121C",
          soft: "#4A4A5C",
          faint: "#8484A0",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          tint: "#F7F5FF",
          line: "#EAE6F8",
        },
      },
      fontFamily: {
        display: ["var(--font-sora)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        accent: ["var(--font-playfair)", "serif"],
      },
      borderRadius: {
        card: "16px",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(126, 34, 206, 0.10)",
        "glass-lg": "0 20px 60px -12px rgba(126, 34, 206, 0.25)",
        button: "0 6px 20px -4px rgba(147, 51, 234, 0.45)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #9333EA 0%, #C026D3 100%)",
        "brand-gradient-warm": "linear-gradient(135deg, #F97316 0%, #9333EA 100%)",
        "mesh-hero":
          "radial-gradient(60% 50% at 15% 10%, rgba(147,51,234,0.18) 0%, rgba(147,51,234,0) 60%), radial-gradient(50% 40% at 90% 0%, rgba(192,38,211,0.16) 0%, rgba(192,38,211,0) 60%), radial-gradient(40% 40% at 80% 90%, rgba(249,115,22,0.10) 0%, rgba(249,115,22,0) 60%)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.25" },
        },
        "gradient-flow": {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "-200% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(var(--float-rot, 0deg))" },
          "50%": { transform: "translateY(-16px) rotate(var(--float-rot, 0deg))" },
        },
      },
      animation: {
        marquee: "marquee 28s linear infinite",
        "fade-up": "fade-up 0.6s ease-out forwards",
        blink: "blink 1.4s ease-in-out infinite",
        "gradient-flow": "gradient-flow 3s linear infinite",
        float: "float 7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
