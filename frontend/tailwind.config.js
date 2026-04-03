/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                neon: {
                    400: '#39ff14',
                    700: '#1a6f0e'
                }
            },
            boxShadow: {
                neon: '0 0 15px rgba(57,255,20,.5), 0 0 35px rgba(57,255,20,.25)'
            }
        }
    },
    plugins: []
}
