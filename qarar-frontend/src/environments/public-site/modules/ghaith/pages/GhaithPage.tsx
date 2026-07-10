import { useState } from 'react';

export default function GhaithPage() {
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setAnswer('');

    try {
      // 🌐 جلب الرابط ديناميكياً من متغيرات فيرسال أو استخدام رابط ريندر كخيار احتياطي
      const baseUrl = import.meta.env.VITE_API_URL || 'https://systemqarar.onrender.com';
      
      // تنظيف الرابط من أي شرطة مائلة زائدة في الآخر لضمان سلامة المسار
      const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      
      // بناء المسار الذكي للتأكد من عدم تكرار كلمة /api لو كانت موجودة في المتغير
      const apiUrl = cleanBaseUrl.includes('/api') 
        ? `${cleanBaseUrl}/public-site/ghaith/ask` 
        : `${cleanBaseUrl}/api/public-site/ghaith/ask`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      if (data.success) {
        setAnswer(data.answer);
      } else {
        setAnswer(`خطأ: ${data.message}`);
      }
    } catch (error) {
      setAnswer('فشل الاتصال بالباكيند، تأكد من تشغيل سيرفر ريندر واستقراره.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-900 text-white rounded-lg shadow-md mt-10" dir="rtl">
      <h2 className="text-2xl font-bold mb-4 text-emerald-400">🤖 لوحة فحص المساعد الرقمي (غيث)</h2>
      <p className="text-sm text-slate-400 mb-6">اكتب أي سؤال لتجربة التوزيع العشوائي للمفاتيح وحماية النظام.</p>

      <div className="mb-4">
        <textarea
          className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 text-white"
          rows={4}
          placeholder="اكتب سؤالك هنا يا هندسة..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>

      <button
        onClick={handleAsk}
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 px-4 rounded-lg transition disabled:opacity-50"
      >
        {loading ? 'جاري استشارة غيث...' : 'إرسال إلى غيث'}
      </button>

      {answer && (
        <div className="mt-6 p-4 bg-slate-800 border-l-4 border-emerald-500 rounded-lg">
          <h4 className="font-semibold mb-2 text-emerald-400">إجابة غيث:</h4>
          <p className="text-slate-200 whitespace-pre-line">{answer}</p>
        </div>
      )}
    </div>
  );
}
