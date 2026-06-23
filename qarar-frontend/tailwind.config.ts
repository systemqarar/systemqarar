import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // الألوان الرسمية للهلال الأحمر (أحمر عملياتي، وأسود رصين، ورمادي أمان)
        brand: {
          red: '#E11D48',
          dark: '#0F172A',
          muted: '#64748B',
          light: '#F8FAFC'
        }
      },
      fontFamily: {
        // اعتماد خطوط متناسقة ومريحة للقراءة في الميدان
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
