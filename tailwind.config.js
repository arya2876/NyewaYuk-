/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'ny-primary': '#0A2E46', // Deep Blue untuk Trust/Primary
        'ny-accent': '#10B981', // Bright Green untuk Safety/Accent
        'ny-background': '#F3F4F6', // Background ringan
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
};
