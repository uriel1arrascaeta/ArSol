/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#F59E0B', // Amarillo solar
                secondary: '#10B981', // Verde ecológico
            },
        },
    },
    plugins: [],
}
