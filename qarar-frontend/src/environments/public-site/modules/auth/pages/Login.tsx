import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, User, Lock, CreditCard, CheckCircle, AlertTriangle, Key, PhoneCall, LogIn, Phone, MessageCircle, ChevronLeft } from 'lucide-react';
import { useRegisterStore } from '../context/registerStore';
import { useAuth } from '../../../../../context/AuthContext';
import authApi from '../api/auth-api';

export const Login: React.FC = () => {
  const { loginUser } = useAuth();
  const { step, volunteerId, snapshot, maskedWhatsapp, setStep, setVolunteerId, setSnapshot, setMaskedWhatsapp, resetStore } = useRegisterStore();

  // حالات كتابة النصوص والتحقق
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // مسح رسائل التنبيه عند التنقل
  const clearMessages = () => { setError(null); setSuccessMessage(null); };

  // ١️⃣ الشاشة الأولى: الدخول الروتيني للمنصة
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      const data = await authApi.login(username, password);
      loginUser(data.token, data.user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'تعذر التحقق من الحساب، يرجى التأكد من المرفقات');
    } finally {
      setLoading(false);
    }
  };

  // ٢️⃣ الشاشة الثانية: فحص وجود الاسم في سجلات المتطوعين
  const handleVerifyVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      const data = await authApi.verifyVolunteer(volunteerId);
      setMaskedWhatsapp(data.masked_whatsapp);
      setSnapshot(data.snapshot);
      // مهلة زمنية مقصودة ليتمتع المتطوع بمشهد الحركة ونقاط الاتصال بالواتساب
      setTimeout(() => {
        setStep(3); 
        setLoading(false);
      }, 2800);
    } catch (err: any) {
      setError(err.response?.data?.error || 'الرقم الموحد الذي أدخلته غير مدرج في سجلاتنا المعتمدة');
      setLoading(false);
    }
  };

  // ٣️⃣ الشاشة الثالثة: مطابقة الرمز السري المرسل
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

  // ٣️⃣ مكرر: مسار الطوارئ والاعتماد اليدوي في حالة انقطاع الشبكة
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

  // ٤️⃣ الشاشة الرابعة: صياغة اسم المستخدم وكلمة المرور النهائية
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
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'فشلت عملية إنشاء وتفعيل الحساب الجديد');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 font-sans text-right select-none relative overflow-hidden" dir="rtl">
      
      {/* هالات ضوئية خلفية خافتة لإعطاء طابع ذكي ومستقبلي للمكان */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-800/20 rounded-full blur-3xl pointer-events-none" />

      {/* لوحة العرض الزجاجية الرئيسية المطفية */}
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-800/80 transition-all duration-300 relative z-10">
        
        {/* واجهة العرض العلوية وشعار النظام */}
        <div className="p-6 pb-4 text-center flex flex-col items-center border-b border-slate-800/50 bg-gradient-to-b from-red-950/20 to-transparent">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="relative">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-md" />
            <Shield className="w-14 h-14 mb-2 text-red-500 relative z-10" />
          </motion.div>
          <h1 className="text-2xl font-black text-white tracking-wide bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">نظام قرار الرقمي</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">شؤون المتطوعين - الهلال الأحمر</p>
        </div>

        {/* شريط معلومات المراحل والخطوات الذكي */}
        {step > 1 && (
          <div className="px-6 pt-4 flex items-center justify-between text-[11px] text-slate-500 font-bold">
            <div className="flex items-center gap-1.5 w-full">
              <span className={`w-2 h-2 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-slate-800'}`} />
              <div className={`h-0.5 flex-1 transition-all duration-500 ${step >= 3 ? 'bg-red-500/50' : 'bg-slate-800'}`} />
              <span className={`w-2 h-2 rounded-full transition-all duration-300 ${step >= 3 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-800'}`} />
              <div className={`h-0.5 flex-1 transition-all duration-500 ${step >= 4 ? 'bg-emerald-500/50' : 'bg-slate-800'}`} />
              <span className={`w-2 h-2 rounded-full transition-all duration-300 ${step >= 4 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-slate-800'}`} />
            </div>
          </div>
        )}

        {/* مساحة التنبيهات والرسائل الإرشادية المنبثقة بنعومة */}
        <AnimatePresence mode="wait">
          {(error || successMessage) && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="px-6 pt-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-center gap-3 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {successMessage && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl flex items-center gap-3 text-xs font-semibold">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* المساحة التفاعلية لعرض الشاشات الأربع والتحركات الانزلاقية */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            
            {/* الشاشة ١: الدخول الروتيني للمنصة */}
            {step === 1 && (
              <motion.form key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }} onSubmit={handleLogin} className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-white">تسجيل الدخول المعتمد</h3>
                  <p className="text-xs text-slate-400 mt-0.5">مرحباً بك، الرجاء كتابة بيانات حسابك الرسمي للعبور</p>
                </div>

                {/* حقل اسم المستخدم التفاعلي */}
                <div className="relative group">
                  <User className="absolute right-3.5 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-red-500 transition-colors duration-300" />
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full pr-11 pl-4 py-3.5 bg-slate-950/40 border border-slate-800 rounded-xl text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 transition-all duration-300 text-left font-medium tracking-wide placeholder-slate-600" dir="ltr" placeholder="اسم المستخدم" />
                </div>

                {/* حقل كلمة المرور التفاعلي */}
                <div className="relative group">
                  <Lock className="absolute right-3.5 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-red-500 transition-colors duration-300" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pr-11 pl-4 py-3.5 bg-slate-950/40 border border-slate-800 rounded-xl text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 transition-all duration-300 text-left font-medium placeholder-slate-600" dir="ltr" placeholder="كلمة المرور" />
                </div>

                <button type="submit" disabled={loading} className="w-full bg-white hover:bg-slate-100 text-slate-950 font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 transition shadow-lg active:scale-[0.98] disabled:opacity-40">
                  <LogIn className="w-4 h-4" />
                  {loading ? 'جاري مراجعة الطلب...' : 'دخول للمنصة'}
                </button>

                <div className="text-center pt-2">
                  <button type="button" onClick={() => { clearMessages(); setStep(2); }} className="text-xs font-bold text-red-400 hover:text-red-300 hover:underline transition duration-300">متطوع جديد؟ اضغط هنا لتأكيد قيدك وتفعيل حسابك</button>
                </div>
              </motion.form>
            )}

            {/* الشاشة ٢: فحص وجود المتطوع + مشهد حركة نقاط الاتصال بالواتساب الفاخر */}
            {step === 2 && (
              <motion.div key="verify-id-container" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                {loading ? (
                  /* مشهد اتصال الهاتف بالواتساب الحركي الممتع */
                  <motion.div key="whatsapp-sending-animation" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-8 space-y-6">
                    <div className="flex items-center justify-between w-full max-w-xs px-4 relative" dir="ltr">
                      
                      {/* الهاتف الافتراضي المستلم */}
                      <div className="bg-slate-950 p-4 rounded-2xl text-slate-400 border border-slate-800 shadow-xl flex items-center justify-center z-10">
                        <Phone className="w-6 h-6" />
                      </div>

                      {/* سلسلة النقاط الضوئية المتحركة المتجهة للواتساب */}
                      <div className="flex items-center space-x-2 flex-1 justify-center px-2">
                        {[0, 1, 2, 3, 4].map((index) => (
                          <motion.div
                            key={index}
                            className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                            animate={{
                              opacity: [0.1, 1, 0.1],
                              scale: [0.7, 1.3, 0.7],
                              y: [0, -3, 0]
                            }}
                            transition={{
                              duration: 1.2,
                              repeat: Infinity,
                              delay: index * 0.15,
                            }}
                          />
                        ))}
                      </div>

                      {/* أيقونة الواتساب الخضراء المشعة */}
                      <div className="bg-emerald-950/50 p-4 rounded-2xl text-emerald-400 border border-emerald-900/50 shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center justify-center z-10">
                        <MessageCircle className="w-6 h-6 fill-emerald-950/20" />
                      </div>

                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm font-bold text-white">جاري إرسال الرمز السري بآمان...</p>
                      <p className="text-[11px] text-slate-400 px-4">نقوم الآن بالاتصال بسجلات القيد وبث الرمز إلى تطبيق الواتساب الخاص بك</p>
                    </div>
                  </motion.div>
                ) : (
                  /* استمارة كتابة رقم المتطوع النظيفة */
                  <form onSubmit={handleVerifyVolunteer} className="space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                      <div>
                        <h3 className="text-base font-bold text-white">التحقق من سجلات القيد</h3>
                        <p className="text-xs text-slate-400 mt-0.5">الرجاء إدخال الرقم الموحد الخاص بك والمثبت مسبقاً</p>
                      </div>
                      <button type="button" onClick={() => { clearMessages(); setStep(1); }} className="text-slate-500 hover:text-white transition p-1"><ChevronLeft className="w-5 h-5 transform rotate-180" /></button>
                    </div>

                    <div className="relative group">
                      <CreditCard className="absolute right-3.5 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-red-500 transition-colors duration-300" />
                      <input type="text" value={volunteerId} onChange={(e) => setVolunteerId(e.target.value)} required className="w-full pr-11 pl-4 py-3.5 bg-slate-950/40 border border-slate-800 rounded-xl text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 transition-all duration-300 text-left font-bold tracking-wider placeholder-slate-600" dir="ltr" placeholder="VOL-XXXXXX" />
                    </div>

                    <button type="submit" className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-red-950/20 active:scale-[0.98]">
                      تحقق وإرسال الرمز السري للواتساب
                    </button>
                  </form>
                )}
              </motion.div>
            )}

            {/* الشاشة ٣: كتابة الرمز السري وخيار الطوارئ */}
            {step === 3 && (
              <motion.form key="otp" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }} onSubmit={handleVerifyOTP} className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                  <div>
                    <h3 className="text-base font-bold text-white">تأكيد رمز الأمان</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      أدخل الرمز السري المرسل إلى رقم الواتساب المعتمد: 
                      <span dir="ltr" className="text-white bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-md mr-1.5 font-mono text-xs">{maskedWhatsapp}</span>
                    </p>
                  </div>
                </div>

                <div className="relative group">
                  <Key className="absolute right-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors duration-300" />
                  <input type="text" maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value)} required className="w-full pr-12 pl-4 py-3.5 bg-slate-950/40 border-2 border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 text-center tracking-[0.6em] font-black text-xl placeholder-slate-700" placeholder="000000" />
                </div>

                <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-emerald-950/20 active:scale-[0.98] disabled:opacity-40">
                  {loading ? 'جاري التحقق من الرمز...' : 'تأكيد الرمز والمتابعة'}
                </button>
                
                {/* صندوق مسار الطوارئ الميداني في حال انقطاع الشبكة */}
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/60 space-y-2">
                  <p className="text-[11px] text-slate-400 text-center leading-relaxed">إذا لم يصلك الرمز السري بسبب مشاكل في شبكة الاتصال الميدانية، يمكنك تفعيل الحل البديل التالي:</p>
                  <button type="button" onClick={handleEmergencyRequest} disabled={loading} className="w-full bg-amber-600/10 border border-amber-600/20 text-amber-400 hover:bg-amber-600/20 font-bold py-2.5 rounded-xl text-xs flex justify-center items-center gap-1.5 transition active:scale-[0.98]">
                    <PhoneCall className="w-3.5 h-3.5" />
                    تفعيل مسار الطوارئ الميداني والطلب اليدوي من الإدارة
                  </button>
                </div>
                
                <div className="text-center">
                  <button type="button" onClick={() => { clearMessages(); setStep(2); }} className="text-xs font-medium text-slate-400 hover:text-white transition underline">الرجوع للخطوة السابقة</button>
                </div>
              </motion.form>
            )}

            {/* الشاشة ٤: مراجعة السجل وتعيين كلمة المرور للمنصة */}
            {step === 4 && (
              <motion.form key="finalize" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }} onSubmit={handleRegister} className="space-y-4">
                <div className="border-b border-slate-800/60 pb-2">
                  <h3 className="text-base font-bold text-white">تأكيد البيانات وتعيين الحساب</h3>
                  <p className="text-xs text-slate-400 mt-0.5">هذه هي خطوتك الأخيرة لتأمين وتفعيل حسابك الرسمي في النظام</p>
                </div>
                
                {/* كارت عرض معلومات المتطوع التي تم سحبها من السجلات */}
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 text-xs space-y-2.5 text-slate-300 shadow-inner">
                  <div className="flex justify-between border-b border-slate-800/50 pb-2">
                    <span className="text-slate-500 font-semibold">الاسم الكامل المعتمد:</span>
                    <span className="font-bold text-white">{snapshot?.full_name}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/50 pb-2">
                    <span className="text-slate-500 font-semibold">رقم القيد الموحد:</span>
                    <span className="font-mono font-bold text-slate-400">{snapshot?.volunteer_id}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/50 pb-2">
                    <span className="text-slate-500 font-semibold">نطاق التواجد الحالي:</span>
                    <span className="font-bold text-white">{snapshot?.current_status_in_khartoum}</span>
                  </div>
                  <div className="flex justify-between items-center pt-0.5">
                    <span className="text-slate-500 font-semibold">الصفة والمسؤولية:</span>
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black ${snapshot?.is_tot_trainer ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-slate-800 text-slate-300'}`}>
                      {snapshot?.is_tot_trainer ? 'مدرب معتمد (TOT)' : 'متطوع نظامي'}
                    </span>
                  </div>
                </div>

                {/* تعيين اسم مستخدم جديد */}
                <div className="relative group">
                  <User className="absolute right-3.5 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-red-500 transition-colors duration-300" />
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full pr-11 pl-4 py-3.5 bg-slate-950/40 border border-slate-800 rounded-xl text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 transition-all duration-300 text-left font-medium placeholder-slate-600" dir="ltr" placeholder="اختر اسم مستخدم جديد" />
                </div>

                {/* تعيين كلمة المرور */}
                <div className="relative group">
                  <Lock className="absolute right-3.5 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-red-500 transition-colors duration-300" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pr-11 pl-4 py-3.5 bg-slate-950/40 border border-slate-800 rounded-xl text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 transition-all duration-300 text-left font-medium placeholder-slate-600" dir="ltr" placeholder="أدخل كلمة المرور للنظام" />
                </div>

                {/* تأكيد كلمة المرور */}
                <div className="relative group">
                  <Lock className="absolute right-3.5 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-red-500 transition-colors duration-300" />
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full pr-11 pl-4 py-3.5 bg-slate-950/40 border border-slate-800 rounded-xl text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 transition-all duration-300 text-left font-medium placeholder-slate-600" dir="ltr" placeholder="تأكيد كلمة المرور" />
                </div>

                <button type="submit" disabled={loading} className="w-full bg-white hover:bg-slate-100 text-slate-950 font-bold py-3.5 rounded-xl transition shadow-lg active:scale-[0.98] disabled:opacity-40">
                  {loading ? 'جاري تفعيل الحساب وحفظ الملف...' : 'إنشاء وتفعيل حسابي فوراً'}
                </button>
              </motion.form>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default Login;
