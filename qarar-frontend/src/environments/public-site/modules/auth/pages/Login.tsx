import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, User, Lock, CreditCard, CheckCircle, AlertTriangle, Key, PhoneCall, LogIn, Phone, MessageCircle, ChevronLeft } from 'lucide-react';
import { useRegisterStore } from '../context/registerStore';
import { useAuth } from '../../../../../context/AuthContext';
import authApi from '../api/auth-api';

export const Login: React.FC = () => {
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
      setError(err.response?.data?.error || 'الرقم الموحد الذي أدخلته غير مدرج في سجلاتنا المعتمدة');
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
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'فشلت عملية إنشاء وتفعيل الحساب الجديد');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col justify-center items-center p-4 font-sans text-right select-none relative overflow-hidden" dir="rtl">
      
      {/* هالات ضوئية تفاعلية متحركة تعطي عمق مستقبلي للمكان */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/15 rounded-full blur-[120px] pointer-events-none" 
      />
      <motion.div 
        animate={{ scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, 40, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" 
      />

      {/* لوحة العرض الزجاجية الرئيسية المفرغة الفاخرة */}
      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-2xl rounded-[2rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden border border-slate-800/60 relative z-10">
        
        {/* واجهة العرض العلوية وشعار النظام */}
        <div className="p-8 pb-4 text-center flex flex-col items-center border-b border-slate-800/40 bg-gradient-to-b from-red-500/10 via-transparent to-transparent">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="relative cursor-pointer"
          >
            <div className="absolute inset-0 bg-red-500/30 rounded-2xl blur-xl" />
            <div className="bg-slate-950 p-4 rounded-2xl border border-red-500/20 shadow-inner mb-3 relative z-10">
              <Shield className="w-10 h-10 text-red-500" />
            </div>
          </motion.div>
          <h1 className="text-2xl font-black text-white tracking-wide bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">نظام قرار الرقمي</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium tracking-normal">شؤون المتطوعين - الهلال الأحمر السوداني</p>
        </div>

        {/* شريط معلومات المراحل والخطوات الذكي الخطي النظيف */}
        {step > 1 && (
          <div className="px-8 pt-4">
            <div className="flex items-center justify-between h-1.5 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800/40">
              <motion.div 
                initial={{ width: '0%' }}
                animate={{ width: step === 2 ? '33%' : step === 3 ? '66%' : '100%' }}
                className={`h-full rounded-full bg-gradient-to-r ${step === 3 ? 'from-red-500 to-emerald-500' : step === 4 ? 'from-emerald-500 to-amber-500' : 'from-red-600 to-red-400'}`}
              />
            </div>
          </div>
        )}

        {/* مساحة التنبيهات والرسائل الإرشادية المنبثقة بنعومة */}
        <AnimatePresence mode="wait">
          {(error || successMessage) && (
            <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="px-8 pt-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl flex items-start gap-3 text-xs font-semibold leading-relaxed">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              {successMessage && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-xl flex items-start gap-3 text-xs font-semibold leading-relaxed">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* المساحة التفاعلية لعرض الشاشات الأربع والتحركات الانزلاقية */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            
            {/* الشاشة ١: الدخول الروتيني للمنصة */}
            {step === 1 && (
              <motion.form key="login" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} transition={{ duration: 0.25 }} onSubmit={handleLogin} className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-white">تسجيل الدخول المعتمد</h3>
                  <p className="text-xs text-slate-400 mt-0.5">مرحباً بك، الرجاء كتابة بيانات حسابك الرسمي للعبور</p>
                </div>

                <div className="relative group">
                  <User className="absolute right-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-red-500 transition-colors duration-300" />
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full pr-12 pl-4 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white outline-none focus:border-red-500/80 focus:ring-4 focus:ring-red-500/10 group-hover:border-slate-700 transition-all duration-300 text-left font-medium tracking-wide placeholder-slate-600 shadow-inner" dir="ltr" placeholder="اسم المستخدم" />
                </div>

                <div className="relative group">
                  <Lock className="absolute right-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-red-500 transition-colors duration-300" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pr-12 pl-4 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white outline-none focus:border-red-500/80 focus:ring-4 focus:ring-red-500/10 group-hover:border-slate-700 transition-all duration-300 text-left font-medium placeholder-slate-600 shadow-inner" dir="ltr" placeholder="كلمة المرور" />
                </div>

                <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full bg-white hover:bg-slate-50 text-slate-950 font-black py-4 rounded-xl flex justify-center items-center gap-2 transition duration-300 shadow-xl disabled:opacity-40 text-sm">
                  <LogIn className="w-4 h-4 stroke-[2.5]" />
                  {loading ? 'جاري مراجعة الحساب...' : 'دخول للمنصة'}
                </motion.button>

                <div className="text-center pt-2">
                  <button type="button" onClick={() => { clearMessages(); setStep(2); }} className="text-xs font-bold text-red-400 hover:text-red-300 transition duration-300 hover:underline decoration-red-500/50">تفعيل حساب متطوع جديد</button>
                </div>
              </motion.form>
            )}

            {/* الشاشة ٢: فحص القيد والمشهد الحركي التفاعلي للواتساب */}
            {step === 2 && (
              <motion.div key="verify-id-container" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} transition={{ duration: 0.25 }}>
                {loading ? (
                  <motion.div key="whatsapp-sending-animation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-6 space-y-6">
                    <div className="flex items-center justify-between w-full max-w-xs px-6 relative" dir="ltr">
                      
                      <div className="bg-slate-950 p-4 rounded-2xl text-slate-400 border border-slate-800 shadow-2xl flex items-center justify-center z-10">
                        <Phone className="w-6 h-6 animate-pulse" />
                      </div>

                      <div className="flex items-center space-x-2 flex-1 justify-center px-4">
                        {[0, 1, 2, 3, 4].map((index) => (
                          <motion.div
                            key={index}
                            className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.4, 0.8], y: [0, -4, 0] }}
                            transition={{ duration: 1, repeat: Infinity, delay: index * 0.15 }}
                          />
                        ))}
                      </div>

                      <div className="bg-emerald-950/40 p-4 rounded-2xl text-emerald-400 border border-emerald-500/30 shadow-[0_0_20px_rgba(52,211,153,0.3)] flex items-center justify-center z-10">
                        <MessageCircle className="w-6 h-6 fill-emerald-400/10 animate-bounce" />
                      </div>

                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-sm font-black text-white">يتم الآن بث رمز الأمان...</p>
                      <p className="text-[11px] text-slate-400 px-2 leading-relaxed">نتحقق من قاعدة بيانات القيد السحابية، ونرسل الرمز المشفر فوراً إلى تطبيق الواتساب المربوط بملفك.</p>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleVerifyVolunteer} className="space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
                      <div>
                        <h3 className="text-base font-bold text-white">التحقق من سجلات القيد</h3>
                        <p className="text-xs text-slate-400 mt-0.5">أدخل الرقم الموحد المثبت مسبقاً في الفرع</p>
                      </div>
                      <button type="button" onClick={() => { clearMessages(); setStep(1); }} className="text-slate-500 hover:text-white bg-slate-950/60 p-2 border border-slate-800 rounded-xl transition"><ChevronLeft className="w-4 h-4 transform rotate-180" /></button>
                    </div>

                    <div className="relative group">
                      <CreditCard className="absolute right-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-red-500 transition-colors duration-300" />
                      <input type="text" value={volunteerId} onChange={(e) => setVolunteerId(e.target.value)} required className="w-full pr-12 pl-4 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 group-hover:border-slate-700 transition-all duration-300 text-left font-bold tracking-widest placeholder-slate-600 shadow-inner" dir="ltr" placeholder="VOL-XXXXXX" />
                    </div>

                    <motion.button whileTap={{ scale: 0.98 }} type="submit" className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black py-4 rounded-xl transition duration-300 shadow-lg shadow-red-950/40 text-sm">
                      تحقق وبث رمز الأمان للواتساب
                    </motion.button>
                  </form>
                )}
              </motion.div>
            )}

            {/* الشاشة ٣: رمز الأمان وخيار الطوارئ */}
            {step === 3 && (
              <motion.form key="otp" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} transition={{ duration: 0.25 }} onSubmit={handleVerifyOTP} className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white">تأكيد رمز الأمان</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      أدخل الرمز المكون من 6 أرقام المرسل لهاتفك:
                      <span dir="ltr" className="text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 px-2 py-0.5 rounded-md mr-1.5 font-mono text-xs font-bold">{maskedWhatsapp}</span>
                    </p>
                  </div>
                </div>

                <div className="relative group">
                  <Key className="absolute right-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors duration-300" />
                  <input type="text" maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value)} required className="w-full pr-12 pl-4 py-3.5 bg-slate-950/50 border-2 border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 group-hover:border-slate-700 transition-all duration-300 text-center tracking-[0.5em] font-black text-2xl placeholder-slate-700 text-emerald-400 shadow-inner" placeholder="000000" />
                </div>

                <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl transition duration-300 shadow-xl shadow-emerald-950/20 disabled:opacity-40 text-sm">
                  {loading ? 'جاري مطابقة الرمز...' : 'تأكيد الرمز والمتابعة'}
                </motion.button>
                
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/60 space-y-2.5 shadow-inner">
                  <p className="text-[11px] text-slate-400 text-center leading-relaxed">إذا واجهتك مشكلة في التغطية الميدانية ولم يصلك الرمز، فَعِّل طلب الاعتماد الاستثنائي:</p>
                  <button type="button" onClick={handleEmergencyRequest} disabled={loading} className="w-full bg-amber-500/5 border border-amber-500/20 text-amber-400 hover:bg-amber-500/10 font-bold py-2.5 rounded-xl text-xs flex justify-center items-center gap-2 transition duration-300 active:scale-[0.98]">
                    <PhoneCall className="w-3.5 h-3.5" />
                    تفعيل مسار الطوارئ والطلب اليدوي
                  </button>
                </div>
                
                <div className="text-center">
                  <button type="button" onClick={() => { clearMessages(); setStep(2); }} className="text-xs font-semibold text-slate-500 hover:text-white transition underline decoration-slate-700">تعديل رقم القيد</button>
                </div>
              </motion.form>
            )}

            {/* الشاشة ٤: كارت الهوية الرقمي الفاخر والمستقبلي وتعيين الباسورد */}
            {step === 4 && (
              <motion.form key="finalize" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} transition={{ duration: 0.25 }} onSubmit={handleRegister} className="space-y-4">
                <div className="border-b border-slate-800/40 pb-2">
                  <h3 className="text-base font-bold text-white">تأكيد الهوية الرقمية</h3>
                  <p className="text-xs text-slate-400 mt-0.5">خطوتك الأخيرة لتأمين وتفعيل حسابك الرسمي بالمنصة</p>
                </div>
                
                {/* كارت الهوية المطور بتأثير ثلاثي الأبعاد ولمسات زجاجية فاخرة */}
                <motion.div 
                  whileHover={{ y: -4, rotateX: 2, rotateY: -2 }}
                  style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
                  className="bg-gradient-to-br from-slate-900 via-slate-950 to-red-950/20 p-5 rounded-2xl border border-slate-800 text-xs space-y-3 text-slate-300 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex justify-between items-center border-b border-slate-800/60 pb-2.5">
                    <span className="text-slate-500 font-bold">الاسم الكامل:</span>
                    <span className="font-black text-white text-sm tracking-wide">{snapshot?.full_name}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-800/60 pb-2.5">
                    <span className="text-slate-500 font-bold">رقم القيد الموحد:</span>
                    <span className="font-mono font-bold text-red-400 bg-red-950/30 px-2 py-0.5 rounded border border-red-900/30">{snapshot?.volunteer_id}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-800/60 pb-2.5">
                    <span className="text-slate-500 font-bold">نطاق العمل الحالي:</span>
                    <span className="font-bold text-slate-200">{snapshot?.current_status_in_khartoum}</span>
                  </div>
                  <div className="flex justify-between items-center pt-0.5">
                    <span className="text-slate-500 font-bold">الصفة والمسؤولية:</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wide shadow-sm ${snapshot?.is_tot_trainer ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-red-900/40' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                      {snapshot?.is_tot_trainer ? 'مدرب معتمد (TOT)' : 'متطوع نظامي'}
                    </span>
                  </div>
                </motion.div>

                <div className="relative group">
                  <User className="absolute right-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-red-500 transition-colors duration-300" />
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full pr-12 pl-4 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 group-hover:border-slate-700 transition-all duration-300 text-left font-medium placeholder-slate-600 shadow-inner" dir="ltr" placeholder="اختر اسم مستخدم جديد" />
                </div>

                <div className="relative group">
                  <Lock className="absolute right-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-red-500 transition-colors duration-300" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pr-12 pl-4 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 group-hover:border-slate-700 transition-all duration-300 text-left font-medium placeholder-slate-600 shadow-inner" dir="ltr" placeholder="أدخل كلمة المرور الجديدة" />
                </div>

                <div className="relative group">
                  <Lock className="absolute right-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-red-500 transition-colors duration-300" />
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full pr-12 pl-4 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 group-hover:border-slate-700 transition-all duration-300 text-left font-medium placeholder-slate-600 shadow-inner" dir="ltr" placeholder="تأكيد كلمة المرور" />
                </div>

                <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full bg-white hover:bg-slate-50 text-slate-950 font-black py-4 rounded-xl transition duration-300 shadow-2xl disabled:opacity-40 text-sm">
                  {loading ? 'جاري تهيئة الحساب السحابي...' : 'إنشاء وتفعيل حسابي فوراً'}
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
