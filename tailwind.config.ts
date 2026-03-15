import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0f172a',
        panel: '#111827',
        text: '#e5e7eb',
        muted: '#94a3b8',
        border: 'rgba(255, 255, 255, 0.08)',
      },
    },
  },
  plugins: [],
};
export default config;
