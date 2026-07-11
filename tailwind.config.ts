import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // mobile-first breakpoints (default Tailwind scale)
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        primary: "#3F4A1F",
        "primary-dark": "#2E3717",
        background: "#EDF0DF",
        ink: "#1A2410",
        body: "#55604A",
        muted: "#8D9280",
        line: "#E5E8D9",
        gold: "#F5A524",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["var(--font-be-vietnam-pro)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
