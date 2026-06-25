import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, User, Lock, CreditCard, CheckCircle, AlertTriangle, Key, PhoneCall, LogIn, ChevronLeft } from 'lucide-react';
// استيراد أيقونة الواتساب المخصصة من مكتبة لوسيد
import { MessageSquareCode } from 'lucide-react'; 
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

  // دالة وهمية أو حقيقية لتنسيق الرقم المرمز بصيغة السودان الآمنة (مثال: 249912***345+)
  const formatSudanWhatsapp = (num: string) => {
    if (!num) return '249912***345+';
    // إذا كان الرقم قادماً من السيرفر جاهزاً، نعرضه، وإلا نطبق التنسيق المطلوب
    return num.startsWith('+') ? num : `+249 ${num}`;
  };

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
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'فشلت عملية إنشاء وتفعيل الحساب الجديد');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 flex flex-col justify-center items-center p-4 font-sans text-right select-none relative overflow-hidden" dir="rtl">

      {/* هالات ضوئية بلون أحمر ملكي فاخر خافت جداً في الخلفية البيضاء لإعطاء عمق باهر */}
      <motion.div 
        animate={{ scale: [1, 1.15, 1], x: [0, 20, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[140px] pointer-events-none" 
      />

      {/* لوحة العرض الزجاجية البيضاء الفاخرة المطرزة بالأحمر الملكي */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(150,0,0,0.12)] overflow-hidden border border-white relative z-10">

        {/* واجهة العرض العلوية - الهوية البصرية الرسمية باللون الأحمر الملكي */}
        <div className="p-8 pb-5 text-center flex flex-col items-center bg-gradient-to-b from-red-50/60 via-transparent to-transparent">
          <motion.div whileHover={{ scale: 1.05 }} className="relative mb-3">
            <div className="absolute inset-0 bg-red-600/10 rounded-2xl blur-xl" />
            <div className="bg-red-700 p-4 rounded-2xl border border-red-600 shadow-md relative z-10 text-white">
              <Shield className="w-9 h-9 stroke-[2]" />
            </div>
          </motion.div>
          <h1 className="text-2xl font-black text-slate-900 tracking-wide">نظام قرار الرقمي</h1>
          <p className="text-xs text-red-700/80 mt-1 font-bold tracking-wide">شؤون المتطوعين - الهلال الأحمر السوداني</p>
        </div>

        {/* شريط المراحل الخطي الأنيق باللون الأحمر الملكي */}
        {step > 1 && (
          <div className="px-8 pt-2">
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
              <motion.div 
                initial={{ width: '0%' }}
                animate={{ width: step === 2 ? '33%' : step === 3 ? '66%' : '100%' }}
                className="h-full rounded-full bg-gradient-to-r from-red-700 to-red-500"
              />
            </div>
          </div>
        )}

        {/* مساحة التنبيهات المنبثقة بنعومة متناسقة مع الألوان الجديدة */}
        <AnimatePresence mode="wait">
          {(error || successMessage) && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="px-8 pt-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-2xl flex items-start gap-3 text-xs font-bold shadow-sm">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              {successMessage && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3.5 rounded-2xl flex items-start gap-3 text-xs font-bold shadow-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* مساحة الاستمارات الداخلية التفاعلية */}
        <div className="p-8">
          <AnimatePresence mode="wait">

            {/* الشاشة ١: الدخول الروتيني */}
            {step === 1 && (
              <motion.form key="login" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.2 }} onSubmit={handleLogin} className="space-y-5">
                <div>
                  <h3 className="text-base font-black text-slate-800">تسجيل الدخول المعتمد</h3>
                  <p className="text-xs text-slate-500 mt-0.5">الرجاء كتابة بيانات حسابك الرسمي للعبور للمنصة</p>
                </div>

                <div className="relative group">
                  <User className="absolute right-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-red-700 transition-colors duration-300" />
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full pr-12 pl-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:border-red-700 focus:bg-white focus:ring-4 focus:ring-red-700/5 transition-all duration-300 text-left font-medium placeholder-slate-400 shadow-sm" dir="ltr" placeholder="اسم المستخدم" />
                </div>

                <div className="relative group">
                  <Lock className="absolute right-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-red-700 transition-colors duration-300" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pr-12 pl-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:border-red-700 focus:bg-white focus:ring-4 focus:ring-red-700/5 transition-all duration-300 text-left font-medium placeholder-slate-400 shadow-sm" dir="ltr" placeholder="كلمة المرور" />
                </div>

                <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-black py-4 rounded-2xl flex justify-center items-center gap-2 transition duration-300 shadow-lg shadow-red-700/10 text-sm">
                  <LogIn className="w-4 h-4 stroke-[2.5]" />
                  {loading ? 'جاري مراجعة الحساب...' : 'دخول للمنصة'}
                </motion.button>

                <div className="text-center pt-2">
                  <button type="button" onClick={() => { clearMessages(); setStep(2); }} className="text-xs font-black text-red-700 hover:text-red-600 transition duration-300 hover:underline">تفعيل حساب متطوع جديد</button>
                </div>
              </motion.form>
            )}

            {/* الشاشة ٢: فحص رقم المتطوع + مشهد الـ الفاخر الحركي للواتساب المستبدل بالكامل */}
            {step === 2 && (
              <motion.div key="verify-id-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                {loading ? (
                  /* ترقية المشهد: استخدام مسار الواتساب الحقيقي والأنيق بنقاط الاتصال */
                  <motion.div key="whatsapp-sending-animation" className="flex flex-col items-center justify-center py-6 space-y-6">
                    <div className="flex items-center justify-between w-full max-w-xs px-6 relative" dir="ltr">

                      {/* الهاتف المستلم */}
                      <div className="bg-slate-50 p-4 rounded-2xl text-slate-400 border border-slate-200 shadow-md flex items-center justify-center z-10">
                        <User className="w-6 h-6 text-slate-600" />
                      </div>

                      {/* سلسلة النقاط الضوئية الحمراء الملكية الفخمة */}
                      <div className="flex items-center space-x-1.5 flex-1 justify-center px-4">
                        {[0, 1, 2, 3, 4].map((index) => (
                          <motion.div
                            key={index}
                            className="w-2 h-2 bg-red-600 rounded-full shadow-[0_0_8px_rgba(185,28,28,0.6)]"
                            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.3, 0.8], y: [0, -3, 0] }}
                            transition={{ duration: 0.9, repeat: Infinity, delay: index * 0.12 }}
                          />
                        ))}
                      </div>

                      {/* شعار تطبيق الواتساب الأخضر الرسمي الفاخر النابض والمشع بديل الأيقونة السابقة */}
                      <motion.div 
                        animate={{ scale: [1, 1.1, 1] }} 
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 border border-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center justify-center z-10"
                      >
                        <MessageSquareCode className="w-6 h-6 stroke-[2.5]" />
                      </motion.div>

                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-sm font-black text-slate-800">جاري تواصل غيث وتوليد الرمز...</p>
                      <p className="text-[11px] text-slate-500 px-2 leading-relaxed">نتحقق من السجلات المعتمدة، ونبث الرمز الآمن مباشرة إلى تطبيق الواتساب الخاص بك.</p>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleVerifyVolunteer} className="space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-base font-black text-slate-800">التحقق من سجلات المتطوعين</h3>
                        <p className="text-xs text-slate-500 mt-0.5">أدخل رقم المتطوع الموحد والمثبت بالفرع</p>
                      </div>
                      <button type="button" onClick={() => { clearMessages(); setStep(1); }} className="text-slate-400 hover:text-slate-800 bg-slate-50 p-2 border border-slate-200 rounded-xl transition"><ChevronLeft className="w-4 h-4 transform rotate-180" /></button>
                    </div>

                    <div className="relative group">
                      <CreditCard className="absolute right-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-red-700 transition-colors duration-300" />
                      <input type="text" value={volunteerId} onChange={(e) => setVolunteerId(e.target.value)} required className="w-full pr-12 pl-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:border-red-700 focus:bg-white focus:ring-4 focus:ring-red-700/5 transition-all duration-300 text-left font-bold tracking-widest placeholder-slate-400 shadow-sm" dir="ltr" placeholder="VOL-XXXXXX" />
                    </div>

                    <motion.button whileTap={{ scale: 0.98 }} type="submit" className="w-full bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-black py-4 rounded-2xl transition duration-300 shadow-md text-sm">
                      تحقق وإرسال الرمز للواتساب
                    </motion.button>
                  </form>
                )}
              </motion.div>
            )}

            {/* الشاشة ٣: رمز الأمان المشفر وخيار الطوارئ */}
            {step === 3 && (
              <motion.form key="otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onSubmit={handleVerifyOTP} className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-black text-slate-800">تأكيد رمز الأمان</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      أدخل الرمز السري المرسل إلى حساب الواتساب المكتوم أمنياً:
                      <span dir="ltr" className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg mr-1.5 font-mono text-xs font-bold">{formatSudanWhatsapp(maskedWhatsapp)}</span>
                    </p>
                  </div>
                </div>

                <div className="relative group">
                  <Key className="absolute right-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors duration-300" />
                  <input type="text" maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value)} required className="w-full pr-12 pl-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 outline-none focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/5 transition-all duration-300 text-center tracking-[0.5em] font-black text-2xl placeholder-slate-300 text-emerald-700 shadow-inner" placeholder="000000" />
                </div>

                <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl transition duration-300 shadow-md disabled:opacity-40 text-sm">
                  {loading ? 'جاري مطابقة الرمز...' : 'تأكيد الرمز والمتابعة'}
                </motion.button>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-2.5 shadow-inner">
                  <p className="text-[11px] text-slate-500 text-center leading-relaxed">إذا واجهتك مشكلة اتصال في الميدان ولم يصلك الرمز، فَعِّل الاعتماد الاستثنائي البديـل:</p>
                  <button type="button" onClick={handleEmergencyRequest} disabled={loading} className="w-full bg-amber-500/5 border border-amber-200 text-amber-800 hover:bg-amber-500/10 font-bold py-2.5 rounded-xl text-xs flex justify-center items-center gap-2 transition duration-300">
                    <PhoneCall className="w-3.5 h-3.5 text-amber-700" />
                    تفعيل مسار الطوارئ الميداني والطلب اليدوي
                  </button>
                </div>

                <div className="text-center">
                  <button type="button" onClick={() => { clearMessages(); setStep(2); }} className="text-xs font-bold text-slate-500 hover:text-slate-800 transition underline">تعديل رقم المتطوع</button>
                </div>
              </motion.form>
            )}

            {/* الشاشة ٤: الهوية الرقمية المعتمدة وتعيين الحساب الحركي الفخم */}
            {step === 4 && (
              <motion.form key="finalize" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onSubmit={handleRegister} className="space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-base font-black text-slate-800">تأكيد بطاقة المتطوع</h3>
                  <p className="text-xs text-slate-500 mt-0.5">خطوتك الأخيرة لتأمين وتفعيل حسابك الرسمي بالمنصة</p>
                </div>

                {/* كارت هوية المتطوع بالثوب الجديد الأبيض الملكي بنقوش حمراء خفيفة مخملية */}
                <motion.div 
                  whileHover={{ y: -4, rotateX: 2, rotateY: -2 }}
                  style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
                  className="bg-gradient-to-br from-slate-900 via-slate-950 to-red-950 p-5 rounded-2xl border border-slate-800 text-xs space-y-3 text-slate-300 shadow-xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex justify-between items-center border-b border-slate-800/60 pb-2.5">
                    <span className="text-slate-400 font-bold">الاسم المعتمد:</span>
                    <span className="font-black text-white text-sm tracking-wide">{snapshot?.full_name}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-800/60 pb-2.5">
                    <span className="text-slate-400 font-bold">رقم المتطوع الموحد:</span>
                    <span className="font-mono font-bold text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-900/30">{snapshot?.volunteer_id}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-800/60 pb-2.5">
                    <span className="text-slate-400 font-bold">نطاق التواجد:</span>
                    <span className="font-bold text-slate-200">{snapshot?.current_status_in_khartoum}</span>
                  </div>
                  <div className="flex justify-between items-center pt-0.5">
                    <span className="text-slate-400 font-bold">الصفة والمسؤولية:</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wide shadow-md ${snapshot?.is_tot_trainer ? 'bg-gradient-to-r from-red-600 to-red-500 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                      {snapshot?.is_tot_trainer ? 'مدرب معتمد (TOT)' : 'متطوع نظامي'}
                    </span>
                  </div>
                </motion.div>

                <div className="relative group">
                  <User className="absolute right-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-red-700 transition-colors duration-300" />
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full pr-12 pl-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:border-red-700 focus:bg-white focus:ring-4 focus:ring-red-700/5 transition-all duration-300 text-left font-medium placeholder-slate-400 shadow-sm" dir="ltr" placeholder="اختر اسم مستخدم جديد" />
                </div>

                <div className="relative group">
                  <Lock className="absolute right-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-red-700 transition-colors duration-300" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pr-12 pl-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:border-red-700 focus:bg-white focus:ring-4 focus:ring-red-700/5 transition-all duration-300 text-left font-medium placeholder-slate-400 shadow-sm" dir="ltr" placeholder="أدخل كلمة المرور الجديدة" />
                </div>

                <div className="relative group">
                  <Lock className="absolute right-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-red-700 transition-colors duration-300" />
                  <input type="password" value={confirmPassword} onChange={(e) => setPassword(e.target.value)} required className="w-full pr-12 pl-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:border-red-700 focus:bg-white focus:ring-4 focus:ring-red-700/5 transition-all duration-300 text-left font-medium placeholder-slate-400 shadow-sm" dir="ltr" placeholder="تأكيد كلمة المرور" />
                </div>

                <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-black py-4 rounded-2xl transition duration-300 shadow-md disabled:opacity-40 text-sm">
                  {loading ? 'جاري تهيئة الملف والاعتماد السحابي...' : 'إنشاء وتفعيل حسابي فوراً'}
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

