/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'bg-dark': '#050510',
                'card-bg': '#101025',
                'text-primary': '#ffffff',
                'text-secondary': '#a0a0b0',
                'accent-primary': '#00f3ff',
                'accent-secondary': '#bc13fe',
            },
            fontFamily: {
                heading: ['Orbitron', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
