import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, User, Lock, CreditCard, CheckCircle, AlertTriangle, Key, PhoneCall, LogIn } from 'lucide-react';
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
      setStep(3); // الانتقال لشاشة التحقق
    } catch (err: any) {
      setError(err.response?.data?.error || 'المعرف غير صحيح أو غير مدرج بالحصر');
    } finally {
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
    <div className="min-h-screen bg-brand-dark flex flex-col justify-center items-center p-4 font-sans text-right" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        
        {/* الهيدر العلوي الموحد للبوابة */}
        <div className="bg-brand-red p-6 text-white text-center flex flex-col items-center">
          <Shield className="w-12 h-12 mb-2" />
          <h1 className="text-2xl font-bold tracking-wide">نظام قرار الرقمي</h1>
          <p className="text-xs text-rose-100 mt-1">وحدة المتطوعين - الهلال الأحمر</p>
        </div>

        {/* مساحة عرض الرسائل والأخطاء الديناميكية */}
        <div className="px-6 pt-4">
          {error && (
            <div className="bg-amber-50 border-r-4 border-amber-500 text-amber-900 p-3 rounded-lg flex items-center gap-3 text-sm">
              <AlertTriangle className="w-5 " />
              <span>{error}</span>
            </div>
          )}
          {successMessage && (
            <div className="bg-emerald-50 border-r-4 border-emerald-500 text-emerald-900 p-3 rounded-lg flex items-center gap-3 text-sm">
              <CheckCircle className="w-5 " />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* الموجه الحركي للشاشات الأربعة */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            
            {/* الشاشة 1: تسجيل الدخول الروتيني */}
            {step === 1 && (
              <motion.form key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleLogin} className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">تسجيل الدخول الروتيني</h3>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">اسم المستخدم</label>
                  <div className="relative">
                    <User className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full pr-10 pl-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-red outline-none text-left" dir="ltr" placeholder="username" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">كلمة المرور</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pr-10 pl-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-red outline-none text-left" dir="ltr" placeholder="••••••••" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-brand-dark hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg flex justify-center items-center gap-2 transition">
                  <LogIn className="w-5 h-5" />
                  {loading ? 'جاري الفحص...' : 'دخول للمنصة'}
                </button>
                <div className="text-center pt-2">
                  <button type="button" onClick={() => { clearMessages(); setStep(2); }} className="text-sm font-bold text-brand-red hover:underline">متطوع جديد؟ أنشئ حسابك وتأكد من الحصر</button>
                </div>
              </motion.form>
            )}

            {/* الشاشة 2: فحص المعرف في الحصر */}
            {step === 2 && (
              <motion.form key="verify-id" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleVerifyVolunteer} className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">التحقق من رقم المتطوع الموحد</h3>
                <p className="text-xs text-gray-500">سيقوم النظام بالتحقق الآمن من وجود معرفك داخل لقطة بيانات الحصر المعتمدة وسحب ملفك تلقائياً.</p>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">رقم المتطوع الموحد</label>
                  <div className="relative">
                    <CreditCard className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                    <input type="text" value={volunteerId} onChange={(e) => setVolunteerId(e.target.value)} required className="w-full pr-10 pl-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-red outline-none text-left" dir="ltr" placeholder="VOL-XXXXXX" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-brand-red hover:bg-rose-700 text-white font-bold py-2.5 rounded-lg transition">
                  {loading ? 'جاري فحص الحصر...' : 'تحقق وإرسال الرمز'}
                </button>
                <div className="text-center">
                  <button type="button" onClick={() => { clearMessages(); setStep(1); }} className="text-sm text-gray-600 hover:underline">العودة لشاشة الدخول</button>
                </div>
              </motion.form>
            )}

            {/* الشاشة 3: إدخال الـ OTP ومسار الطوارئ البديل */}
            {step === 3 && (
              <motion.form key="otp" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleVerifyOTP} className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">أمن الحساب والتحقق</h3>
                <p className="text-xs text-gray-600">تم إرسال رمز تحقق مؤقت إلى رقم الواتساب المعتمد لديك في لقطة الحصر: <strong dir="ltr" className="text-brand-dark inline-block">{maskedWhatsapp}</strong></p>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">أدخل رمز التحقق (6 أرقام)</label>
                  <div className="relative">
                    <Key className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                    <input type="text" maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value)} required className="w-full pr-10 pl-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-red outline-none text-center tracking-widest font-bold text-lg" placeholder="000000" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg transition">
                  {loading ? 'جاري مطابقة الرمز...' : 'تأكيد الرمز والعبور'}
                </button>
                
                <div className="border-t pt-3 mt-2">
                  <p className="text-xs text-gray-400 mb-2">الرمز لم يصلك بسبب مشاكل شبكة الاتصال أو انقطاع الواتساب الميداني؟</p>
                  <button type="button" onClick={handleEmergencyRequest} disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-1.5 rounded-lg text-xs flex justify-center items-center gap-1 transition">
                    <PhoneCall className="w-4 h-4" />
                    تفعيل مسار الطوارئ والطلب اليدوي من إدارة الوحدة
                  </button>
                </div>
                
                <div className="text-center">
                  <button type="button" onClick={() => { clearMessages(); setStep(2); }} className="text-sm text-gray-600 hover:underline">الرجوع للخطوة السابقة</button>
                </div>
              </motion.form>
            )}

            {/* الشاشة 4: صياغة استمارة الحساب المعزولة الرشيقة */}
            {step === 4 && (
              <motion.form key="finalize" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleRegister} className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">تأكيد البيانات وتعيين الحساب</h3>
                
                {/* كارت معلومات اللقطة المعزولة القادمة من نظام الحصر */}
                <div className="bg-gray-50 p-3 rounded-lg border text-xs space-y-1 text-gray-700">
                  <p><strong>الاسم المعتمد:</strong> {snapshot?.full_name}</p>
                  <p><strong>رقم المتطوع:</strong> {snapshot?.volunteer_id}</p>
                  <p><strong>حالة التواجد في الخرطوم:</strong> {snapshot?.current_status_in_khartoum}</p>
                  <p><strong>صفة التدريب:</strong> {snapshot?.is_tot_trainer ? 'مدرب معتمد (TOT)' : 'متطوع نظامي'}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">اختر اسم مستخدم فريد</label>
                  <div className="relative">
                    <User className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full pr-10 pl-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-red outline-none text-left" dir="ltr" placeholder="ex: ahmad_khaled" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">كلمة المرور للنظام</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                    <input type="password" value={password} className="w-full pr-10 pl-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-red outline-none text-left" dir="ltr" placeholder="••••••••" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">تأكيد كلمة المرور</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full pr-10 pl-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-red outline-none text-left" dir="ltr" placeholder="••••••••" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-brand-dark hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg transition">
                  {loading ? 'جاري حفظ الحساب الموحد...' : 'إنشاء وتفعيل الحساب فوراً'}
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
