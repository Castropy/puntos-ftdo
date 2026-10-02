/** @type {import('tailwindcss').Config} */
export default {
    // Define los archivos donde Tailwind buscará clases CSS
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            // Define la paleta de colores institucional para la interfaz
            colors: {
                farmatodo: {
                    blue: '#002B66',
                    blueHover: '#001F4B',
                    red: '#E30613',
                    lightBg: '#F4F6F9',
                    card: '#FFFFFF',
                    textPrimary: '#1E293B',
                    textSecondary: '#64748B'
                }
            }
        },
    },
    plugins: [],
}