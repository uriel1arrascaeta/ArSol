/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#F59E0B', // Amarillo solar (Dashboard)
                secondary: '#10B981', // Verde ecológico (Dashboard)
                brand: { DEFAULT: '#FF7A00', dark: '#E66E00', light: '#FFB366' },
                ink: { DEFAULT: '#0B0D12', soft: '#151922' },
            },
            fontFamily: {
                display: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
