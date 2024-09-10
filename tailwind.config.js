/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#8B5CF6', // Purple
          dark: '#6D28D9', // Darker Purple
        },
        background: {
          light: '#F3F4F6', // Light Gray
          dark: '#1F2937', // Dark Gray
        },
        text: {
          light: '#1F2937', // Dark Gray
          dark: '#F9FAFB', // Almost White
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};