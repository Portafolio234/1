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
                'bg-elevated': '#101025',
                'card-bg': '#101025',
                'text-primary': '#ffffff',
                'text-secondary': '#b0b0c0',
                'text-muted': '#707088',
                'accent-primary': '#00f3ff',
                'accent-secondary': '#bc13fe',
                'accent-success': '#10b981',
            },
            fontFamily: {
                heading: ['Orbitron', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
            },
            borderRadius: {
                'sm-token': 'var(--radius-sm)',
                'md-token': 'var(--radius-md)',
                'lg-token': 'var(--radius-lg)',
                'xl-token': 'var(--radius-xl)',
            },
            boxShadow: {
                'glow-primary': 'var(--shadow-glow-primary)',
                'glow-secondary': 'var(--shadow-glow-secondary)',
                'card': 'var(--shadow-card)',
                'card-hover': 'var(--shadow-card-hover)',
            },
            animation: {
                'fade-in': 'fadeIn 0.4s ease-out forwards',
                'slide-in': 'slideIn 0.3s ease-out forwards',
                'scale-in': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            },
        },
    },
    plugins: [],
}
