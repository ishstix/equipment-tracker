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
        brand: {
          DEFAULT: '#F5A623',
          50:  '#FEF6E7',
          100: '#FDEABD',
          200: '#FBD68A',
          300: '#F9C257',
          400: '#F7AE2A',
          500: '#F5A623',
          600: '#D4891A',
          700: '#A86B12',
          800: '#7C4E0A',
          900: '#503104',
        },
      },
    },
  },
  plugins: [],
};
export default config;
