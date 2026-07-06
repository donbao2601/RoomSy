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
        primary: "#15915A",
        background: "#F4F8F6",
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
