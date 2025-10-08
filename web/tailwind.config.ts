import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          lime: "#C7F03B",
          green: "#0F4C3A",
          purple: "#6F2C91"
        }
      }
    }
  },
  plugins: []
};

export default config;
