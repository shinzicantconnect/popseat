import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                popseat: {
                    red: '#b91c1c',
                    darkRed: '#7f1d1d',
                    crimson: '#991b1b',
                    black: '#000000',
                    dark: '#0a0a0a',
                },
            },
        },
    },
    plugins: [],
}

export default config