/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./App.{js,jsx,ts,tsx}",
        "./app/**/*.{js,jsx,ts,tsx}",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
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
                game: ["Inter", "sans-serif"],
            },
        },
    },
    plugins: [],
};
