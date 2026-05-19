import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9eaff",
          200: "#bcd9ff",
          300: "#8dc1ff",
          400: "#569dff",
          500: "#2e7bf6",
          600: "#1a5fe3",
          700: "#174bc5",
          800: "#193f9c",
          900: "#1a387b",
          950: "#13234b",
        },
        ink: {
          50: "#f7f8fa",
          100: "#eef0f4",
          200: "#dde1eb",
          300: "#c1c8d8",
          400: "#9aa3b9",
          500: "#737e96",
          600: "#5b667d",
          700: "#475167",
          800: "#3a4356",
          900: "#222a3a",
          950: "#141925",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)",
        soft: "0 4px 24px -8px rgb(15 23 42 / 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
