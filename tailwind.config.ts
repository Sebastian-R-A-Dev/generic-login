import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        portal: {
          blue: "#1A80F8",
          muted: "#64748b",
        },
      },
      boxShadow: {
        "portal-glow": "0 8px 32px rgba(26, 128, 248, 0.35)",
      },
    },
  },
  plugins: [],
} satisfies Config;
