import { useState, useRef, useEffect, FormEvent } from 'react';
import { Paperclip, Image as ImageIcon, Mic, Send, RotateCcw } from 'lucide-react';

// تعريف نوع الرسالة
interface Message {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

// مكون فرعي لعرض النص بتأثير الكتابة التدريجية (Typewriter Effect)
function BotMessageContent({ 
  text, 
  isLatest, 
  onType 
}: { 
  text: string; 
  isLatest: boolean; 
  onType?: () => void 
}) {
  const [displayedText, setDisplayedText] = useState(isLatest ? '' : text);

  useEffect(() => {
    if (!isLatest) {
      setDisplayedText(text);
      return;
    }

    setDisplayedText('');
    let currentIndex = 0;
    
    const timer = setInterval(() => {
      currentIndex += 2;
      if (currentIndex >= text.length) {
        setDisplayedText(text);
        clearInterval(timer);
      } else {
        setDisplayedText(text.slice(0, currentIndex));
      }
      if (onType) onType();
    }, 15);

    return () => clearInterval(timer);
  }, [text, isLatest]);

  const renderFormattedText = (rawText: string) => {
    if (!rawText) return null;

    return rawText.split('\n').map((line: string, lineIdx: number) => {
      const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);

      return (
        <p key={lineIdx} className="min-h-[1.25rem] mb-1 last:mb-0 leading-relaxed">
          {parts.map((part: string, partIdx: number) => {
            if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('*') && part.endsWith('*'))) {
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

  return <div className="whitespace-pre-wrap">{renderFormattedText(displayedText)}</div>;
}

export default function GhaithPage() {
  const [prompt, setPrompt] = useState<string>('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleNewChat = () => {
    setSessionId(null);
    setMessages([]);
    setPrompt('');
  };

  const handleAsk = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim() || loading) return;

    const userMessage: Message = {
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
        body: JSON.stringify({ 
          prompt: currentPrompt,
          sessionId: sessionId 
        }),
      });

      const data = await response.json();

      if (data.success && data.sessionId) {
        setSessionId(data.sessionId);
      }

      const botMessage: Message = {
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
    <div className="flex justify-center items-center h-[100dvh] bg-slate-100 p-0 sm:p-4 overflow-hidden" dir="rtl">
      <div className="w-full sm:max-w-xl h-full sm:h-[92vh] bg-white sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 relative">

        {/* الهيدر */}
        <div className="bg-[#7a1528] text-white p-3.5 sm:p-4 flex items-center justify-between shadow-md flex-shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white p-1 flex items-center justify-center shadow-inner border border-amber-300/40 overflow-hidden">
                <img 
                  src="/logo.png" 
                  alt="شعار نظام قرار" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#7a1528] rounded-full"></span>
            </div>

            <div>
              <h2 className="font-bold text-base sm:text-lg leading-tight tracking-wide">نظام قرار الرقمي</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-amber-300 font-semibold text-xs">غيث</span>
                <span className="text-white/40 text-xs">•</span>
                <span className="text-slate-200 text-xs opacity-90">المساعد الرقمي لوحدة الوحدة</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={handleNewChat}
                className="bg-white/10 hover:bg-white/20 text-slate-100 px-3 py-1.5 rounded-full text-xs backdrop-blur-sm border border-white/15 transition flex items-center gap-1.5"
                title="محادثة جديدة"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">جديد</span>
              </button>
            )}

            <div className="bg-white/10 px-3 py-1 rounded-full text-[11px] backdrop-blur-sm border border-white/15 text-emerald-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              متصل الآن
            </div>
          </div>
        </div>

        {/* منطقة الرسائل */}
        <div className="flex-1 min-h-0 p-4 overflow-y-auto bg-slate-50 space-y-4 relative">

          {messages.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 select-none pointer-events-none opacity-25">
              <div className="w-24 h-24 mb-4 rounded-3xl bg-[#7a1528]/10 flex items-center justify-center p-4 border border-[#7a1528]/20 backdrop-blur-sm">
                <img src="/logo.png" alt="قرار" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-2xl font-black text-[#7a1528] tracking-wide mb-1">ابدأ المحادثة الآن مع غيث</h3>
              <p className="text-xs text-slate-600 font-medium">المساعد الرقمي الذكي لوحدة الوحدة • منظومة قرار</p>
            </div>
          )}

          {messages.map((msg, index) => {
            const isLatestBot = msg.sender === 'bot' && index === messages.length - 1;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} relative z-10`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm text-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#1e293b] text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                  }`}
                >
                  {msg.sender === 'bot' && (
                    <div className="text-xs font-bold text-[#7a1528] mb-1.5 flex items-center gap-1.5 border-b border-slate-100 pb-1">
                      <img src="/logo.png" alt="لوقو" className="w-4 h-4 object-contain" />
                      <span>غيث</span>
                    </div>
                  )}

                  {msg.sender === 'bot' ? (
                    <BotMessageContent 
                      text={msg.text} 
                      isLatest={isLatestBot} 
                      onType={scrollToBottom}
                    />
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
              </div>
            );
          })}

          {loading && (
            <div className="flex flex-col items-start relative z-10">
              <div className="bg-white border border-slate-200 p-3.5 rounded-2xl rounded-tl-none shadow-sm text-xs text-slate-500 flex items-center gap-2">
                <span className="font-semibold text-[#7a1528]">غيث يكتب الآن...</span>
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

        {/* شريط الإدخال بأيقونات Lucide الاحترافية */}
        <form onSubmit={handleAsk} className="p-3 bg-white border-t border-slate-200 flex items-end gap-2 flex-shrink-0 relative z-10">
          
          <div className="flex items-center gap-1 text-slate-400 pb-2.5">
            <button 
              type="button" 
              className="p-2 hover:bg-slate-100 rounded-full transition text-slate-500"
              title="إرفاق ملف"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <button 
              type="button" 
              className="p-2 hover:bg-slate-100 rounded-full transition text-slate-500 hidden sm:block"
              title="إرفاق صورة"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
          </div>

          <textarea
            className="flex-1 p-3 text-sm bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:border-[#7a1528] focus:bg-white text-slate-800 transition placeholder:text-slate-400 resize-none max-h-24 min-h-[46px]"
            placeholder="اكتب رسالتك إلى غيث..."
            rows={1}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAsk();
              }
            }}
            disabled={loading}
          />

          <button 
            type="button" 
            className="p-2.5 mb-1 text-slate-400 hover:text-[#7a1528] transition rounded-full hidden sm:block"
            title="تسجيل صوتي"
          >
            <Mic className="w-4 h-4" />
          </button>

          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="bg-[#7a1528] hover:bg-[#60101f] text-white font-medium p-3 mb-0.5 rounded-xl transition disabled:opacity-40 flex items-center justify-center shadow-md min-w-[46px] h-[46px]"
            title="إرسال"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
