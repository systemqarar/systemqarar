/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#dc2626',  // أحمر الهلال الأحمر الرسمي
          dark: '#0f172a', // الكحلي الداكن للخلفية الفخمة
        },
      },
    },
  },
  plugins: [],
}
