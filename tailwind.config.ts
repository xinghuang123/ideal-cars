import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#1E2A3A",
          light: "#2A3A4E",
          dark: "#141E2A",
        },
        accent: {
          DEFAULT: "#5BC0EB",
          dark: "#3AA8D8",
          light: "#7ED0F0",
        },
        silver: {
          DEFAULT: "#C0C0C0",
          light: "#D4D4D4",
          dark: "#A0A0A0",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Arial", "Helvetica", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
