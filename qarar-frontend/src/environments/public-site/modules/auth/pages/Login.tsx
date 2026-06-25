import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, User, Lock, CreditCard, CheckCircle, AlertTriangle, Key, PhoneCall, LogIn, Phone, MessageCircle } from 'lucide-react';
import { useRegisterStore } from '../context/registerStore';
import { useAuth } from '../../../../../context/AuthContext';
import authApi from '../api/auth-api';

export const Login: React.FC = () => {
  const { loginUser } = useAuth();
  const { step, volunteerId, snapshot, maskedWhatsapp, setStep, setVolunteerId, setSnapshot, setMaskedWhatsapp, resetStore } = useRegisterStore();

  // حالات النموذج المحلي
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // تنظيف الأخطاء عند الانتقال
  const clearMessages = () => { setError(null); setSuccessMessage(null); };

  // 1️⃣ الشاشة 1: تسجيل الدخول الروتيني
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      const data = await authApi.login(username, password);
      loginUser(data.token, data.user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  // 2️⃣ الشاشة 2: فحص المعرف في نظام الحصر
  const handleVerifyVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      const data = await authApi.verifyVolunteer(volunteerId);
      setMaskedWhatsapp(data.masked_whatsapp);
      setSnapshot(data.snapshot);
      // تأخير بسيط مقصود لمنح المتطوع فرصة للاستمتاع بالحركة البصرية والتأكد من الإرسال
      setTimeout(() => {
        setStep(3); 
        setLoading(false);
      }, 2500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'المعرف غير صحيح أو غير مدرج بالحصر');
      setLoading(false);
    }
  };

  // 3️⃣ الشاشة 3: مطابقة رمز الـ OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      await authApi.verifyOTP(volunteerId, otpCode);
      setStep(4); // الانتقال لاستمارة الحساب النهائية
    } catch (err: any) {
      setError(err.response?.data?.error || 'رمز التحقق غير صحيح أو انتهت صلاحيته');
    } finally {
      setLoading(false);
    }
  };

  // 3️⃣ مكرر: مسار الطوارئ والتحقق اليدوي
  const handleEmergencyRequest = async () => {
    clearMessages();
    setLoading(true);
    try {
      const data = await authApi.emergencyRequest(volunteerId);
      setSuccessMessage(data.message);
      setTimeout(() => { resetStore(); }, 5000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'فشل رفع طلب الطوارئ');
    } finally {
      setLoading(false);
    }
  };

  // 4️⃣ الشاشة 4: إنشاء الحساب النهائي وحفظ اللقطة المعزولة
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة!');
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
      setError(err.response?.data?.error || 'فشل إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col justify-center items-center p-4 font-sans text-right select-none" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 transition-all duration-300">

        {/* الهيدر العلوي الموحد للبوابة */}
        <div className="bg-gradient-to-r from-red-600 to-rose-600 p-6 text-white text-center flex flex-col items-center shadow-md">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
            <Shield className="w-14 h-14 mb-2 filter drop-shadow-sm" />
          </motion.div>
          <h1 className="text-2xl font-bold tracking-wide">نظام قرار الرقمي</h1>
          <p className="text-xs text-rose-100 mt-1 opacity-90">وحدة تسيير المتطوعين - الهلال الأحمر</p>
        </div>

        {/* مساحة عرض الرسائل والأخطاء الديناميكية بنعومة */}
        <AnimatePresence mode="wait">
          {(error || successMessage) && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="px-6 pt-4">
              {error && (
                <div className="bg-rose-50 border-r-4 border-red-500 text-red-900 p-3 rounded-lg flex items-center gap-3 text-sm font-medium">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {successMessage && (
                <div className="bg-emerald-50 border-r-4 border-emerald-500 text-emerald-900 p-3 rounded-lg flex items-center gap-3 text-sm font-medium">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* الموجه الحركي للشاشات الأربعة */}
        <div className="p-6">
          <AnimatePresence mode="wait">

            {/* الشاشة 1: تسجيل الدخول الروتيني */}
            {step === 1 && (
              <motion.form key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }} onSubmit={handleLogin} className="space-y-4">
                <div className="border-b pb-2">
                  <h3 className="text-lg font-bold text-slate-800">تسجيل الدخول الروتيني</h3>
                  <p className="text-xs text-slate-400 mt-0.5">مرحباً بك مجدداً، الرجاء إدخال تفاصيل حسابك</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">اسم المستخدم</label>
                  <div className="relative">
                    <User className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full pr-10 pl-3 py-2.5 border border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 transition outline-none text-left font-medium" dir="ltr" placeholder="username" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">كلمة المرور</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pr-10 pl-3 py-2.5 border border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 transition outline-none text-left" dir="ltr" placeholder="••••••••" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 transition shadow-md active:scale-95 disabled:opacity-50">
                  <LogIn className="w-5 h-5" />
                  {loading ? 'جاري التحقق الآمن...' : 'دخول للمنصة'}
                </button>
                <div className="text-center pt-2">
                  <button type="button" onClick={() => { clearMessages(); setStep(2); }} className="text-sm font-bold text-red-600 hover:text-red-700 hover:underline transition">متطوع جديد؟ أنشئ حسابك وتأكد من الحصر</button>
                </div>
              </motion.form>
            )}

            {/* الشاشة 2: فحص المعرف في الحصر + مشهد حركة الواتساب الساحر */}
            {step === 2 && (
              <motion.div key="verify-id-container" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                {loading ? (
                  /* مشهد إرسال الرمز التفاعلي المتنفس والمتحرك */
                  <motion.div key="whatsapp-sending-animation" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-8 space-y-6">
                    <div className="flex items-center justify-between w-full max-w-xs px-2 relative" dir="ltr">

                      {/* رمز الهاتف الوطني */}
                      <div className="bg-slate-100 p-4 rounded-2xl text-slate-700 shadow-md border border-slate-200 flex items-center justify-center z-10">
                        <Phone className="w-7 h-7" />
                      </div>

                      {/* النقاط المتصلة والمتحركة التي تنطلق باتجاه الواتساب */}
                      <div className="flex items-center space-x-2 flex-1 justify-center px-4">
                        {[0, 1, 2, 3, 4].map((index) => (
                          <motion.div
                            key={index}
                            className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-sm"
                            animate={{
                              opacity: [0.2, 1, 0.2],
                              scale: [0.8, 1.2, 0.8],
                              y: [0, -2, 0]
                            }}
                            transition={{
                              duration: 1.2,
                              repeat: Infinity,
                              delay: index * 0.15,
                            }}
                          />
                        ))}
                      </div>

                      {/* رمز تطبيق الواتساب المعتمد */}
                      <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 shadow-md border border-emerald-100 flex items-center justify-center z-10">
                        <MessageCircle className="w-7 h-7 fill-emerald-50" />
                      </div>

                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm font-bold text-slate-700 animate-pulse">جاري تأمين الاتصال وإرسال الرمز...</p>
                      <p className="text-xs text-slate-400">نصل الآن بملفات الحصر لبث رسالة التحقق للواتساب الخاص بك</p>
                    </div>
                  </motion.div>
                ) : (
                  /* استمارة إدخال الرقم العادية المريحة */
                  <form onSubmit={handleVerifyVolunteer} className="space-y-4">
                    <div className="border-b pb-2">
                      <h3 className="text-lg font-bold text-slate-800">التحقق من رقم المتطوع الموحد</h3>
                      <p className="text-xs text-slate-400 mt-0.5">سيقوم النظام بسحب ملفك المعتمد تلقائياً وبأمان</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">رقم المتطوع الموحد</label>
                      <div className="relative">
                        <CreditCard className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
                        <input type="text" value={volunteerId} onChange={(e) => setVolunteerId(e.target.value)} required className="w-full pr-10 pl-3 py-2.5 border border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 transition outline-none text-left font-bold tracking-wider" dir="ltr" placeholder="VOL-XXXXXX" />
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold py-3 rounded-xl transition shadow-md active:scale-95">
                      تحقق وإرسال الرمز السري
                    </button>
                    <div className="text-center">
                      <button type="button" onClick={() => { clearMessages(); setStep(1); }} className="text-sm font-medium text-slate-500 hover:text-slate-700 hover:underline transition">العودة لشاشة الدخول</button>
                    </div>
                  </form>
                )}
              </motion.div>
            )}

            {/* الشاشة 3: إدخال الـ OTP ومسار الطوارئ البديل */}
            {step === 3 && (
              <motion.form key="otp" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }} onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="border-b pb-2">
                  <h3 className="text-lg font-bold text-slate-800">أمن الحساب والتحقق</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    تم بث رمز أمان مؤقت إلى تطبيق الواتساب المعتمد برقمك: 
                    <strong dir="ltr" className="text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded-md mr-1 inline-block font-mono text-xs">{maskedWhatsapp}</strong>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 text-center">أدخل الرمز السري المكون من (6 أرقام)</label>
                  <div className="relative">
                    <Key className="absolute right-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input type="text" maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value)} required className="w-full pr-12 pl-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition outline-none text-center tracking-[0.75em] font-black text-xl text-slate-800" placeholder="000000" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition shadow-md active:scale-95 disabled:opacity-50">
                  {loading ? 'جاري مطابقة الرمز...' : 'تأكيد الرمز والعبور'}
                </button>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2 space-y-2">
                  <p className="text-xs text-slate-400 text-center leading-relaxed">في حال تعذر وصول الرمز بسبب ظروف الشبكة الميدانية، يمكنك استخدام الحل البديل:</p>
                  <button type="button" onClick={handleEmergencyRequest} disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded-lg text-xs flex justify-center items-center gap-1 transition shadow-sm active:scale-95">
                    <PhoneCall className="w-3.5 h-3.5" />
                    تفعيل مسار الطوارئ الميداني واعتماد الحساب يدوياً
                  </button>
                </div>

                <div className="text-center">
                  <button type="button" onClick={() => { clearMessages(); setStep(2); }} className="text-sm font-medium text-slate-500 hover:text-slate-700 hover:underline transition">الرجوع للخطوة السابقة</button>
                </div>
              </motion.form>
            )}

            {/* الشاشة 4: صياغة استمارة الحساب النهائية المنسقة */}
            {step === 4 && (
              <motion.form key="finalize" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }} onSubmit={handleRegister} className="space-y-4">
                <div className="border-b pb-2">
                  <h3 className="text-lg font-bold text-slate-800">تأكيد البيانات وتعيين الحساب</h3>
                  <p className="text-xs text-slate-400 mt-0.5">خطوتك الأخيرة لتأمين وتفعيل حسابك الرسمي في النظام</p>
                </div>

                {/* لوحة مراجعة معلومات المتطوع المسحوبة من ملف الحصر */}
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-xl border border-slate-200 text-xs space-y-2 text-slate-700 shadow-inner">
                  <div className="flex justify-between border-b border-slate-200 pb-1.5">
                    <span className="font-semibold text-slate-500">الاسم المعتمد:</span>
                    <span className="font-bold text-slate-800">{snapshot?.full_name}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1.5">
                    <span className="font-semibold text-slate-500">رقم القيد الموحد:</span>
                    <span className="font-mono font-bold text-slate-800">{snapshot?.volunteer_id}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1.5">
                    <span className="font-semibold text-slate-500">حالة التواجد الجغرافي:</span>
                    <span className="font-bold text-slate-800">{snapshot?.current_status_in_khartoum}</span>
                  </div>
                  <div className="flex justify-between pt-0.5">
                    <span className="font-semibold text-slate-500">الصفة والمسؤولية:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${snapshot?.is_tot_trainer ? 'bg-red-100 text-red-800' : 'bg-slate-200 text-slate-800'}`}>
                      {snapshot?.is_tot_trainer ? 'مدرب معتمد (TOT)' : 'متطوع نظامي'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">اختر اسم مستخدم جديد</label>
                  <div className="relative">
                    <User className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full pr-10 pl-3 py-2.5 border border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 transition outline-none text-left font-medium" dir="ltr" placeholder="ex: ahmad_khaled" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">كلمة المرور الخاصة بك</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pr-10 pl-3 py-2.5 border border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 transition outline-none text-left" dir="ltr" placeholder="••••••••" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">تأكيد كلمة المرور</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full pr-10 pl-3 py-2.5 border border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 transition outline-none text-left" dir="ltr" placeholder="••••••••" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition shadow-md active:scale-95 disabled:opacity-50">
                  {loading ? 'جاري حفظ واعتماد الحساب...' : 'إنشاء وتفعيل الحساب فوراً'}
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
