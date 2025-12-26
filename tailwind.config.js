/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./App.{js,jsx,ts,tsx}",
        "./app/**/*.{js,jsx,ts,tsx}",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    presets: [require("nativewind/preset")],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                // Cores principais do jogo (do mockup)
                primary: "#f48c25",
                "background-light": "#f8f7f5",
                "background-dark": "#221910",

                // Cores do jogo - Tema Brasil
                brasil: {
                    verde: "#009c3b",
                    amarelo: "#ffdf00",
                    azul: "#002776",
                },
                // Cores do jogo - Tema EUA
                usa: {
                    red: "#b22234",
                    white: "#ffffff",
                    blue: "#3c3b6e",
                },
                // Cores de economia
                money: {
                    green: "#2ecc71",
                    red: "#e74c3c",
                    gold: "#f1c40f",
                },
            },
            fontFamily: {
                display: ["Spline Sans", "sans-serif"],
                body: ["Noto Sans", "sans-serif"],
            },
            borderRadius: {
                DEFAULT: "1rem",
                lg: "2rem",
                xl: "3rem",
                full: "9999px",
            },
        },
    },
    plugins: [],
};
