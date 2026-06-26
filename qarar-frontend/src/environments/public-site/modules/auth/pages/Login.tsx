import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 🧭 استيراد موجه المسارات الذكي
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, User, Lock, CreditCard, CheckCircle, AlertTriangle, Key, PhoneCall, LogIn, ChevronLeft, MessageSquareCode } from 'lucide-react'; 
import { useRegisterStore } from '../context/registerStore';
import { useAuth } from '../../../../../context/AuthContext';
import authApi from '../api/auth-api';

export const Login: React.FC = () => {
  const navigate = useNavigate(); // 🧭 تفعيل أداة الانتقال بين الصفحات
  const { loginUser } = useAuth();
  const { step, volunteerId, snapshot, maskedWhatsapp, setStep, setVolunteerId, setSnapshot, setMaskedWhatsapp, resetStore } = useRegisterStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearMessages = () => { setError(null); setSuccessMessage(null); };

  const formatSudanWhatsapp = (num: string) => {
    if (!num) return '249912***345+';
    return num.startsWith('+') ? num : `+249 ${num}`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      const data = await authApi.login(username, password);
      // 1. حفظ بيانات الجلسة والأمان في النظام
      loginUser(data.token, data.user); 
      // 2. 🚀 الانتقال الفوري والمباشر للوحة التحكم الموحدة
      navigate('/dashboard'); 
    } catch (err: any) {
      setError(err.response?.data?.error || 'تعذر التحقق من الحساب، يرجى التأكد من المرفقات');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      const data = await authApi.verifyVolunteer(volunteerId);
      setMaskedWhatsapp(data.masked_whatsapp);
      setSnapshot(data.snapshot);
      setTimeout(() => {
        setStep(3); 
        setLoading(false);
      }, 2800);
    } catch (err: any) {
      setError(err.response?.data?.error || 'رقم المتطوع الذي أدخلته غير مدرج في سجلاتنا المعتمدة');
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      await authApi.verifyOTP(volunteerId, otpCode);
      setStep(4);
    } catch (err: any) {
      setError(err.response?.data?.error || 'الرمز السري غير صحيح أو انتهت مهلة صلاحيته الزمنية');
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyRequest = async () => {
    clearMessages();
    setLoading(true);
    try {
      const data = await authApi.emergencyRequest(volunteerId);
      setSuccessMessage(data.message);
      setTimeout(() => { resetStore(); }, 5000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'تعذر إرسال طلب الطوارئ للإدارة حالياً');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (password !== confirmPassword) {
      setError('كلمات المرور المكتوبة غير متطابقة، يرجى إعادة التأكد');
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.register({ username, password, snapshot });
      setSuccessMessage(data.message);
      setTimeout(() => {
        resetStore();
        setUsername('');
        setPassword('');
        setConfirmPassword('');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'فشلت عملية إنشاء وتفعيل الحساب الجديد');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-center items-center p-4 font-sans text-right select-none relative overflow-hidden" dir="rtl">
      
      {/* 🌟 تأثيرات الخلفية الناعمة (Soft Background Elements) */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-0 w-[600px] h-[600px] bg-slate-200/40 rounded-full blur-[120px] pointer-events-none" 
      />
      <motion.div 
        animate={{ scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-300/30 rounded-full blur-[100px] pointer-events-none" 
      />

      {/* 📦 بطاقة تسجيل الدخول الرئيسية */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-gray-100 relative z-10">
        
        {/* 🏛️ الهيدر الفخم */}
        <div className="p-8 pb-6 text-center flex flex-col items-center bg-white relative">
          <motion.div whileHover={{ scale: 1.05 }} className="relative mb-4 z-10">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/20">
               <span className="text-white font-black text-2xl">ق</span>
            </div>
            {/* شارة الذكاء الاصطناعي (AI Badge) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-200 to-amber-400 text-amber-900 text-[9px] font-black px-2 py-0.5 rounded-full border-2 border-white flex items-center gap-1 shadow-sm"
            >
              <Shield className="w-2.5 h-2.5" />
              مدعوم بـ AI
            </motion.div>
          </motion.div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">منظومة قرار</h1>
          <p className="text-xs text-slate-500 mt-1.5 font-bold tracking-wide">الهلال الأحمر</p>
        </div>

        {/* 📊 شريط التقدم (Progress Bar) - يظهر فقط في خطوات التسجيل */}
        {step > 1 && (
          <div className="px-8 mb-2">
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
              <motion.div 
                initial={{ width: '0%' }}
                animate={{ width: step === 2 ? '33%' : step === 3 ? '66%' : '100%' }}
                className="h-full rounded-full bg-slate-900"
              />
            </div>
          </div>
        )}

        {/* 🚨 رسائل الخطأ والنجاح (Alerts) */}
        <AnimatePresence mode="wait">
          {(error || successMessage) && (
            <motion.div initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -10 }} className="px-8 pt-2">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-2xl flex items-start gap-3 text-xs font-bold shadow-sm mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              {successMessage && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-3 rounded-2xl flex items-start gap-3 text-xs font-bold shadow-sm mb-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="px-8 pb-8">
          <AnimatePresence mode="wait">
            
            {/* 🚪 الخطوة 1: تسجيل الدخول */}
            {step === 1 && (
              <motion.form key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} onSubmit={handleLogin} className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-black text-slate-800">تسجيل الدخول</h3>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">أدخل بيانات اعتمادك للوصول للوحة القيادة</p>
                </div>

                <div className="space-y-3">
                  <div className="relative group">
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-900 transition-colors duration-300" />
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full pr-12 pl-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all duration-300 text-left font-medium placeholder-slate-400 text-sm" dir="ltr" placeholder="اسم المستخدم" />
                  </div>

                  <div className="relative group">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-900 transition-colors duration-300" />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pr-12 pl-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all duration-300 text-left font-medium placeholder-slate-400 text-sm" dir="ltr" placeholder="كلمة المرور" />
                  </div>
                </div>

                <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 rounded-2xl flex justify-center items-center gap-2 transition duration-300 shadow-md shadow-slate-900/10 text-sm mt-6">
                  {loading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 stroke-[2.5]" />
                      متابعة
                    </>
                  )}
                </motion.button>

                <div className="text-center pt-4 border-t border-slate-100 mt-6">
                  <p className="text-[11px] text-slate-500 mb-2">ليس لديك حساب؟</p>
                  <button type="button" onClick={() => { clearMessages(); setStep(2); }} className="text-xs font-black text-slate-900 hover:text-slate-700 transition duration-300 bg-slate-100 px-4 py-2 rounded-xl">تفعيل حساب متطوع</button>
                </div>
              </motion.form>
            )}

            {/* 🆔 الخطوة 2: التحقق من المتطوع */}
            {step === 2 && (
              <motion.div key="verify-id-container" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                {loading ? (
                  /* 🤖 أنيميشن تواصل المساعد (غيث) */
                  <motion.div key="whatsapp-sending-animation" className="flex flex-col items-center justify-center py-8 space-y-8">
                    <div className="flex items-center justify-between w-full max-w-[200px] relative" dir="ltr">
                      
                      <motion.div 
                        animate={{ scale: [1, 1.05, 1], boxShadow: ["0px 0px 0px rgba(0,0,0,0)", "0px 0px 20px rgba(15,23,42,0.1)", "0px 0px 0px rgba(0,0,0,0)"] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="bg-white p-3.5 rounded-2xl text-slate-900 border border-slate-200 shadow-sm flex items-center justify-center z-10"
                      >
                        <User className="w-6 h-6 stroke-[1.5]" />
                      </motion.div>

                      <div className="flex items-center space-x-1.5 flex-1 justify-center px-2">
                        {[0, 1, 2].map((index) => (
                          <motion.div
                            key={index}
                            className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                            animate={{ opacity: [0.3, 1, 0.3], x: [0, 5, 0] }}
                            transition={{ duration: 1, repeat: Infinity, delay: index * 0.2 }}
                          />
                        ))}
                      </div>

                      <motion.div 
                        animate={{ scale: [1, 1.1, 1] }} 
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="bg-slate-900 p-3.5 rounded-2xl text-white shadow-lg shadow-slate-900/20 flex items-center justify-center z-10 relative"
                      >
                         <MessageSquareCode className="w-6 h-6 stroke-[1.5]" />
                         <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                      </motion.div>

                    </div>
                    <div className="text-center space-y-1.5">
                      <h3 className="text-sm font-black text-slate-900">يتواصل غيث الآن...</h3>
                      <p className="text-[10px] text-slate-500 px-4 leading-relaxed font-medium">يتم مطابقة الهوية وإرسال رمز التحقق الآمن لبريدك/واتساب.</p>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleVerifyVolunteer} className="space-y-4">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-black text-slate-800">تأكيد الهوية</h3>
                        <p className="text-[11px] text-slate-500 mt-1 font-medium">أدخل رقم المتطوع الموحد (VOL)</p>
                      </div>
                      <button type="button" onClick={() => { clearMessages(); setStep(1); }} className="text-slate-400 hover:text-slate-900 bg-slate-50 p-2.5 rounded-full transition-colors"><ChevronLeft className="w-5 h-5 transform rotate-180" /></button>
                    </div>

                    <div className="relative group">
                      <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-900 transition-colors duration-300" />
                      <input type="text" value={volunteerId} onChange={(e) => setVolunteerId(e.target.value)} required className="w-full pr-12 pl-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all duration-300 text-left font-bold tracking-widest placeholder-slate-400 text-sm uppercase" dir="ltr" placeholder="VOL-XXXXXX" />
                    </div>

                    <motion.button whileTap={{ scale: 0.98 }} type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 rounded-2xl transition duration-300 shadow-md shadow-slate-900/10 text-sm mt-4">
                      متابعة
                    </motion.button>
                  </form>
                )}
              </motion.div>
            )}

            {/* 🔑 الخطوة 3: إدخال رمز التحقق (OTP) */}
            {step === 3 && (
              <motion.form key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} onSubmit={handleVerifyOTP} className="space-y-5">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                     <Key className="w-6 h-6 text-slate-700" />
                  </div>
                  <h3 className="text-lg font-black text-slate-800">رمز التحقق</h3>
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed font-medium px-4">
                    أدخل الرمز المكون من 6 أرقام المرسل إلى:
                    <br />
                    <span dir="ltr" className="inline-block mt-1 text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md font-mono text-xs font-bold tracking-wider">{formatSudanWhatsapp(maskedWhatsapp)}</span>
                  </p>
                </div>

                <div className="relative group">
                  <input type="text" maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value)} required className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all duration-300 text-center tracking-[0.75em] font-black text-2xl placeholder-slate-300" placeholder="000000" />
                </div>

                <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 rounded-2xl transition duration-300 shadow-md shadow-slate-900/10 disabled:opacity-50 text-sm">
                  {loading ? 'جاري التحقق...' : 'تأكيد الرمز'}
                </motion.button>
                
                <div className="flex items-center justify-between mt-4">
                  <button type="button" onClick={handleEmergencyRequest} disabled={loading} className="text-[10px] font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors">
                    <PhoneCall className="w-3 h-3" />
                    تفعيل مسار الطوارئ
                  </button>
                  <button type="button" onClick={() => { clearMessages(); setStep(2); }} className="text-[10px] font-bold text-slate-500 hover:text-slate-900 transition-colors">
                    تعديل الرقم
                  </button>
                </div>
              </motion.form>
            )}

            {/* 📝 الخطوة 4: إنشاء الحساب النهائي */}
            {step === 4 && (
              <motion.form key="finalize" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} onSubmit={handleRegister} className="space-y-4">
                <div className="mb-4">
                  <h3 className="text-lg font-black text-slate-800">إعداد الحساب</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">الخطوة الأخيرة للوصول لمنظومة قرار</p>
                </div>
                
                {/* 💳 كارت بيانات المتطوع (مصمم بأسلوب البطاقة الذكية) */}
                <motion.div 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-slate-900 p-4 rounded-2xl text-white relative overflow-hidden shadow-lg shadow-slate-900/10 mb-4"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-slate-800 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="relative z-10 space-y-2">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-[10px] text-slate-400 font-bold">الاسم:</span>
                      <span className="font-black text-sm">{snapshot?.full_name}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-[10px] text-slate-400 font-bold">رقم المتطوع:</span>
                      <span className="font-mono text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300">{snapshot?.volunteer_id}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-[10px] text-slate-400 font-bold">الصلاحية:</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wide ${snapshot?.is_tot_trainer ? 'bg-amber-400 text-amber-950' : 'bg-slate-100 text-slate-900'}`}>
                        {snapshot?.is_tot_trainer ? 'مدرب (TOT)' : 'متطوع'}
                      </span>
                    </div>
                  </div>
                </motion.div>

                <div className="space-y-3">
                  <div className="relative group">
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-900 transition-colors duration-300" />
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full pr-12 pl-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all duration-300 text-left font-medium placeholder-slate-400 text-sm" dir="ltr" placeholder="اسم مستخدم جديد" />
                  </div>

                  <div className="relative group">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-900 transition-colors duration-300" />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pr-12 pl-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all duration-300 text-left font-medium placeholder-slate-400 text-sm" dir="ltr" placeholder="كلمة المرور" />
                  </div>

                  <div className="relative group">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-900 transition-colors duration-300" />
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full pr-12 pl-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all duration-300 text-left font-medium placeholder-slate-400 text-sm" dir="ltr" placeholder="تأكيد كلمة المرور" />
                  </div>
                </div>

                <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 rounded-2xl transition duration-300 shadow-md shadow-slate-900/10 disabled:opacity-50 text-sm mt-4">
                  {loading ? 'جاري التهيئة...' : 'إنشاء الحساب'}
                </motion.button>
              </motion.form>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default Login;
