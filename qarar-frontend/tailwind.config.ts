import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#dc2626',  // اللون الأحمر الرسمي للهلال الأحمر
          dark: '#0f172a', // الكحلي الداكن للخلفية الفخمة
        },
      },
    },
  },
  plugins: [],
};

export default config;
