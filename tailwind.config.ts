import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-pova":
          "linear-gradient(180deg, #4D4D4D 6.82%, rgba(13, 13, 13, 0.54) 35.35%, rgba(255, 255, 255, 0.00) 100%)",
      },
      boxShadow: {
        "pova-sm": "0 2px 5px rgba(0,0,0,0.25)",
        "pova-lg": "0px -4px 16px 0px rgba(0, 0, 0, 0.12)",
      },
      fontFamily: {
        pova: ["var(--font-pova)"],
      },
      colors: {
        "on-surface": "#6B6B6B",
        surface: "#EEEEEE",
        "on-surface-variant": "#707070",
        "on-error": "#E54937",
        "surface-disabled": "#515151",
        primary: "black",
        "on-primary": "white",
        error: "#C72439",
        success: "#3F8827",
        disabled: "#d7d7d7",
        flashing: "#5334EC",
        fencing: "#F45830",
        accessory: "#9CD698",
      },
      fontSize: {
        "pova-heading": "2.5rem",
      },
      borderRadius: {
        "pova-lg": "0.625rem",
      },
      dropShadow: {
        pova: "rgba(0,0,0.25) 0 4px 4px",
        "pova-edge": "0 2px 5px rgba(0,0,0,0.25)",
        "pova-flashing": "4px 4px 12px rgba(0,0,0,0.25)",
      },
      keyframes: {
        loader: {
          "100%": { transform: "rotate(1turn)" },
        },
      },
      animation: {
        loader: "loader 1s infinite steps(12)",
      },
      maxWidth: {
        hlg: "512px",
      },
      padding: {
        "4.5": "18px",
      },
      margin: {
        "4.5": "18px",
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
export default config;
