import { useState, useRef, useEffect } from 'react';

export default function GhaithPage() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'أهلاً بك في **منظومة قرار الرقمية**! 🌟\nأنا **غيث**، المساعد الرقمي الذكي الخاص بوحدة الوحدة.\n\nكيف يمكنني مساعدتك اليوم؟',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // التمرير التلقائي لآخر رسالة
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // دالة لتنظيم معالجة النصوص وتنسيق النجوم (*) إلى خط عريض أنيق
  const renderFormattedText = (text) => {
    if (!text) return null;
    
    return text.split('\n').map((line, lineIdx) => {
      // تقسيم السطر بناءً على النجوم **أو *
      const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      
      return (
        <p key={lineIdx} className="min-h-[1.25rem] mb-1 last:mb-0 leading-relaxed">
          {parts.map((part, partIdx) => {
            if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('*') && part.endsWith('*'))) {
              // إزالة النجوم وإظهار النص كـ Bold ملون
              const cleanText = part.replace(/^\*+|\*+$/g, '');
              return (
                <strong key={partIdx} className="font-bold text-[#7a1528]">
                  {cleanText}
                </strong>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  const handleAsk = async (e) => {
    e?.preventDefault();
    if (!prompt.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: prompt,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentPrompt = prompt;
    setPrompt('');
    setLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'https://systemqarar.onrender.com';
      const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      const apiUrl = cleanBaseUrl.includes('/api')
        ? `${cleanBaseUrl}/public-site/ghaith/ask`
        : `${cleanBaseUrl}/api/public-site/ghaith/ask`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentPrompt }),
      });

      const data = await response.json();

      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.success ? data.answer : `خطأ: ${data.message}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: 'عفواً، متعذر الاتصال بالخادم حالياً. يرجى التأكد من استقرار الخدمة.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-100 p-2 sm:p-4" dir="rtl">
      <div className="w-full max-w-md sm:max-w-xl h-[88vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* 1. هيدر منظومة قرار وغيث */}
        <div className="bg-[#7a1528] text-white p-4 flex items-center justify-between shadow-md relative z-10">
          <div className="flex items-center gap-3">
            {/* أفق شارة غيث */}
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-900 font-black text-xl shadow-inner border border-amber-200">
                غ
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#7a1528] rounded-full"></span>
            </div>
            
            <div>
              <h2 className="font-bold text-lg leading-tight tracking-wide">منظومة قرار الرقمية</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-amber-300 font-semibold text-xs">غيث</span>
                <span className="text-white/40 text-xs">•</span>
                <span className="text-slate-200 text-xs opacity-90">المساعد الرقمي لوحدة الوحدة</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 px-3 py-1 rounded-full text-[11px] backdrop-blur-sm border border-white/15 text-emerald-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            متصل الآن
          </div>
        </div>

        {/* 2. منطقة عرض الرسائل والدردشة */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm text-sm ${
                  msg.sender === 'user'
                    ? 'bg-[#1e293b] text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                }`}
              >
                {msg.sender === 'bot' && (
                  <div className="text-xs font-bold text-[#7a1528] mb-1.5 flex items-center gap-1 border-b border-slate-100 pb-1">
                    <span>🤖 غيث</span>
                  </div>
                )}
                <div className="whitespace-pre-wrap">
                  {msg.sender === 'bot' ? renderFormattedText(msg.text) : msg.text}
                </div>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
            </div>
          ))}

          {/* مؤشر جاري الكتابة */}
          {loading && (
            <div className="flex flex-col items-start">
              <div className="bg-white border border-slate-200 p-3.5 rounded-2xl rounded-tl-none shadow-sm text-xs text-slate-500 flex items-center gap-2">
                <span className="font-semibold text-[#7a1528]">غيث يفكر ويحلل الإجابة</span>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* 3. شريط الكتابة والإرسال */}
        <form onSubmit={handleAsk} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            className="flex-1 p-3 text-sm bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:border-[#7a1528] focus:bg-white text-slate-800 transition placeholder:text-slate-400"
            placeholder="اكتب سؤالك لـ غيث..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="bg-[#7a1528] hover:bg-[#60101f] text-white font-medium p-3 rounded-xl transition disabled:opacity-40 flex items-center justify-center shadow-md min-w-[50px]"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span className="text-base">إرسال 🚀</span>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
