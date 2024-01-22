/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontFamily: {
      proxima: ["Proxima Nova"],
    },
    extend: {
      colors: {
        primary: "#02B89D",
        secondary: "#0281B9",
        pureWhite: "#FFF",
        pureBlack: "#000",
        errorColor: "#F8D7DA",
        warningColor: "#FFF3CD",
        infoColor: "#E7F1FF",
        darkCharcoal: "#333333",
        slatyGrey: "#6E6D7A",
        lightSilver: "#D8D8D8",
        whiteSmoke: "#F6F6F6",
        defaultRed: "#DC3545",
        defaultOrange: "#664D03",
        defaultBlue: "#0A58CA",
        lightPrimary: "#A9ECE1",
        successColor: "#198754",
        darkBlue: "#0281B9",
        textGood: "#FFBF00",
        textDefault: "#979797",
        blueColor: "#069CDE",
        darkPrimary: "#029882",
        darkRed: "#B02A37",
        darkSuccess: "#146C43",
        yellowColor: "#FFC107",
        darkYellow: "#CC9A06",
        skyBlue: "#0DCAF0",
        slatyBlue: "#0F2552",
        darkGray: "#848a95",
        lightYellow: "#FFC107",
        lightGray: "#F4F4F4",
        slatyGreen: "#CCF1EB",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
