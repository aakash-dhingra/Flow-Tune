/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#121212',
                surface: '#181818',
                primary: '#1DB954',
                textPrimary: '#FFFFFF',
                textSecondary: '#B3B3B3'
            }
        },
    },
    plugins: [],
}
