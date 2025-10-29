import type { Config } from 'tailwindcss'
const config: Config = { content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'], theme: { extend: { colors: { brand: { DEFAULT: '#14b8a6', dark: '#0f766e', light: '#99f6e4', } } } }, plugins: [], }
export default config
