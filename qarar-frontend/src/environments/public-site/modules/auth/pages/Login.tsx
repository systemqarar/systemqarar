import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, User, Lock, CreditCard, CheckCircle, AlertTriangle, Key, PhoneCall, LogIn, ChevronLeft, Sparkles } from 'lucide-react'; 
import { useRegisterStore } from '../context/registerStore';
import { useAuth } from '../../../../../context/AuthContext';
import authApi from '../api/auth-api';

export const Login: React.FC = () => {
  const navigate = useNavigate(); 
  const { loginUser } = useAuth();
  
  // 🔄 تحديث استخراج البيانات من Zustand Store لتطابق المسميات الجديدة الموحدة
  const { 
    step, 
    volunteerNumber, 
    snapshot, 
    maskedWhatsapp, 
    setStep, 
    setVolunteerNumber, 
    setSnapshot, 
    setMaskedWhatsapp, 
    resetStore 
  } = useRegisterStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearMessages = () => { setError(null); setSuccessMessage(null); };

  const formatSudanWhatsapp = (num: string) => {
    if (!num) return '+249912***345';
    return num.startsWith('+') ? num : `+249 ${num}`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      const data = await authApi.login(username, password);
      loginUser(data.token, data.user); 
      
      // 🔄 التوجيه الذكي والديناميكي بناءً على صلاحية ورتبة الحساب الممررة من الـ API
      if (data.user?.role === 'super_admin') {
        navigate('/developer');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'تعذر التحقق من الحساب، يرجى التأكد من المعطيات المرفقة');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      const data = await authApi.verifyVolunteer(volunteerNumber);
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
      await authApi.verifyOTP(volunteerNumber, otpCode);
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
      const data = await authApi.emergencyRequest(volunteerNumber);
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
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-center items-center p-5 font-sans text-right select-none relative overflow-hidden" dir="rtl">
      
      <motion.div 
        animate={{ scale: [1, 1.15, 1], x: [0, 20, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-0 w-[550px] h-[550px] bg-red-900/5 rounded-full blur-[110px] pointer-events-none" 
      />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], x: [0, -30, 0], y: [0, 30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" 
      />

      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden border border-gray-100 relative z-10">
        
        <div className="p-8 pb-4 text-center flex flex-col items-center bg-white relative">
          <motion.div whileHover={{ scale: 1.03 }} className="relative mb-3 z-10">
            <div className="w-16 h-16 bg-white rounded-2xl p-2.5 flex items-center justify-center shadow-[0_8px_25px_rgba(122,28,46,0.12)] border border-red-100 select-none">
               <img src="/logo.png" alt="شعار منظومة قرار" className="w-full h-full object-contain" />
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="absolute -bottom-1 -right-3 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-[9px] font-black px-2 py-0.5 rounded-full border-2 border-white flex items-center gap-1 shadow-sm shadow-amber-500/20"
            >
              <Shield className="w-2.5 h-2.5 stroke-[2.5]" />
              نظام آمن الذكاء
            </motion.div>
          </motion.div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">منظومة قرار الإدارية</h1>
          <p className="text-[10px] text-[#7A1C2E] font-black mt-1 bg-red-50 px-3 py-0.5 rounded-full tracking-wide">جمعية الهلال الأحمر السوداني</p>
        </div>

        {step > 1 && (
          <div className="px-8 mb-2">
            <div className="h-1.5 w-full bg-red-50 rounded-full overflow-hidden p-0.5">
              <motion.div 
                initial={{ width: '0%' }}
                animate={{ width: step === 2 ? '33%' : step === 3 ? '66%' : '100%' }}
                className="h-full rounded-full bg-gradient-to-r from-[#7A1C2E] to-[#400A13]"
              />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {(error || successMessage) && (
            <motion.div initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -10 }} className="px-8 pt-2">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-700 p-3.5 rounded-2xl flex items-start gap-3 text-xs font-bold shadow-sm mb-1">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              {successMessage && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-3.5 rounded-2xl flex items-start gap-3 text-xs font-bold shadow-sm mb-1">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="px-8 pb-8 pt-4">
          <AnimatePresence mode="wait">
            
            {step === 1 && (
              <motion.form key="login" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.25 }} onSubmit={handleLogin} className="space-y-4">
                <div className="text-center mb-5">
                  <h3 className="text-base font-black text-slate-800">سجل دخولك الآن</h3>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">أدخل معطيات الاعتماد السرية الممنوحة لك لتفعيل الجلسة</p>
                </div>

                <div className="space-y-3">
                  <div className="relative group">
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-[#7A1C2E] transition-colors duration-300" />
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full pr-11 pl-4 py-3.5 bg-gray-50/70 border border-slate-100 rounded-2xl text-slate-900 outline-none focus:border-[#7A1C2E] focus:bg-white focus:ring-4 focus:ring-red-700/5 transition-all duration-300 text-left font-bold placeholder-slate-400 text-xs" dir="ltr" placeholder="Username" />
                  </div>

                  <div className="relative group">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-[#7A1C2E] transition-colors duration-300" />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pr-11 pl-4 py-3.5 bg-gray-50/70 border border-slate-100 rounded-2xl text-slate-900 outline-none focus:border-[#7A1C2E] focus:bg-white focus:ring-4 focus:ring-red-700/5 transition-all duration-300 text-left font-bold placeholder-slate-400 text-xs" dir="ltr" placeholder="Password" />
                  </div>
                </div>

                <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#560E1A] via-[#7A1C2E] to-[#400A13] hover:opacity-95 text-white font-black py-3.5 rounded-2xl flex justify-center items-center gap-2 transition duration-300 shadow-md shadow-red-900/10 text-xs mt-6 cursor-pointer">
                  {loading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 stroke-[2.5]" />
                      موافق ومتابعة
                    </>
                  )}
                </motion.button>

                <div className="text-center pt-4 border-t border-slate-100 mt-6">
                  <p className="text-[10px] text-slate-400 mb-2.5">منسوبي وكوادر الهلال الأحمر</p>
                  <button type="button" onClick={() => { clearMessages(); setStep(2); }} className="text-[11px] font-black text-[#7A1C2E] hover:text-[#560E1A] transition duration-300 bg-red-50/60 px-5 py-2.5 rounded-xl cursor-pointer">تفعيل حساب متطوع جديد</button>
                </div>
              </motion.form>
            )}

            {step === 2 && (
              <motion.div key="verify-id-container" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.25 }}>
                {loading ? (
                  <motion.div key="ghaith-smart-engine" className="flex flex-col items-center justify-center py-6 space-y-6">
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <motion.div 
                        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-[#7A1C2E]/10 rounded-full"
                      />
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0.2, 0.8] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                        className="absolute inset-2 bg-amber-400/10 rounded-full"
                      />
                      <div className="w-12 h-12 bg-gradient-to-br from-[#7A1C2E] to-[#400A13] rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/20 z-10 border border-white/10">
                        <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                      </div>
                    </div>
                    <div className="text-center space-y-1">
                      <h3 className="text-xs font-black text-slate-900 flex items-center justify-center gap-1.5">
                        جاري تشغيل محرك غيث الذكي
                      </h3>
                      <p className="text-[10px] text-slate-400 max-w-[240px] leading-relaxed font-bold">يتم الآن التحقق من قاعدة البيانات المشفرة لإرسال كود الـ OTP عبر الواتساب الآمن...</p>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleVerifyVolunteer} className="space-y-4">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="text-base font-black text-slate-800">تأكيد رقم القيد الموحد</h3>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">أدخل كود الهوية التنظيمية للمتطوعين</p>
                      </div>
                      <button type="button" onClick={() => { clearMessages(); setStep(1); }} className="text-slate-400 hover:text-slate-900 bg-slate-50 p-2 rounded-full transition-colors cursor-pointer"><ChevronLeft className="w-4 h-4 transform rotate-180" /></button>
                    </div>

                    <div className="relative group">
                      <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-[#7A1C2E] transition-colors duration-300" />
                      <input type="text" value={volunteerNumber} onChange={(e) => setVolunteerNumber(e.target.value)} required className="w-full pr-11 pl-4 py-3.5 bg-gray-50/70 border border-slate-100 rounded-2xl text-slate-900 outline-none focus:border-[#7A1C2E] focus:bg-white focus:ring-4 focus:ring-red-700/5 transition-all duration-300 text-left font-black tracking-widest placeholder-slate-400 text-xs uppercase" dir="ltr" placeholder="VOL-XXXXXX" />
                    </div>

                    <motion.button whileTap={{ scale: 0.97 }} type="submit" className="w-full bg-gradient-to-r from-[#560E1A] via-[#7A1C2E] to-[#400A13] text-white font-black py-3.5 rounded-2xl transition duration-300 shadow-md shadow-red-900/10 text-xs mt-4 cursor-pointer">
                      تأكيد ومطابقة السجلات
                    </motion.button>
                  </form>
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.form key="otp" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.25 }} onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="text-center mb-4">
                  <div className="w-11 h-11 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-red-100">
                     <Key className="w-4.5 h-4.5 text-[#7A1C2E]" />
                  </div>
                  <h3 className="text-base font-black text-slate-800">شفرة التحقق الآمنة</h3>
                  <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed font-bold px-4">
                    أدخل الرمز السري المكون من 6 أرقام المرسل لواتساب الحساب:
                    <br />
                    <span dir="ltr" className="inline-block mt-1.5 text-[#7A1C2E] bg-red-50/80 px-3 py-0.5 rounded-full font-mono text-xs font-black tracking-wider border border-red-100/50">{formatSudanWhatsapp(maskedWhatsapp)}</span>
                  </p>
                </div>

                <div className="relative group">
                  <input type="text" maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value)} required className="w-full px-4 py-3.5 bg-gray-50/70 border border-slate-100 rounded-2xl text-[#7A1C2E] outline-none focus:border-[#7A1C2E] focus:bg-white focus:ring-4 focus:ring-red-700/5 transition-all duration-300 text-center tracking-[0.6em] font-black text-xl placeholder-slate-200" placeholder="000000" />
                </div>

                <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#560E1A] via-[#7A1C2E] to-[#400A13] text-white font-black py-3.5 rounded-2xl transition duration-300 shadow-md shadow-red-900/10 disabled:opacity-50 text-xs cursor-pointer">
                  {loading ? 'جاري تأكيد التوقيع...' : 'اعتماد كود التحقق'}
                </motion.button>
                
                <div className="flex items-center justify-between mt-4 px-1">
                  <button type="button" onClick={handleEmergencyRequest} disabled={loading} className="text-[10px] font-black text-slate-500 hover:text-[#7A1C2E] flex items-center gap-1 transition-colors cursor-pointer">
                    <PhoneCall className="w-3 h-3 text-red-500 animate-pulse" />
                    اضطراري: تفعيل مسار الطوارئ
                  </button>
                  <button type="button" onClick={() => { clearMessages(); setStep(2); }} className="text-[10px] font-black text-[#7A1C2E] hover:underline transition-colors cursor-pointer">
                    تغيير المعرف
                  </button>
                </div>
              </motion.form>
            )}

            {step === 4 && (
              <motion.form key="finalize" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.25 }} onSubmit={handleRegister} className="space-y-4">
                <div className="mb-3">
                  <h3 className="text-base font-black text-slate-800">مرحباً بك في قرار</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">قم بصياغة بيانات الاعتماد الشخصية لربطها بملفك الإلكتروني</p>
                </div>
                
                <motion.div 
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="bg-gradient-to-br from-[#560E1A] via-[#7A1C2E] to-[#380710] p-4 rounded-3xl text-white relative overflow-hidden shadow-lg shadow-red-950/20 mb-4 border border-white/10"
                >
                  <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full blur-xl pointer-events-none" />
                  <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="relative z-10 space-y-2">
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                      <span className="text-[9px] text-red-200/70 font-bold">المتطوع المعتمد:</span>
                      <span className="font-black text-xs tracking-wide">{snapshot?.full_name}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                      <span className="text-[9px] text-red-200/70 font-bold">الرقم التنظيمي:</span>
                      <span className="font-mono text-xs bg-black/20 px-2 py-0.5 rounded-lg text-amber-300 font-bold border border-white/5">{snapshot?.volunteer_number}</span>
                    </div>
                    <div className="flex justify-between items-center pt-0.5">
                      <span className="text-[9px] text-red-200/70 font-bold">مستوى الصلاحية الممنوح:</span>
                      <span className={`px-2 py-0.5 rounded-md text-[8px] font-black tracking-wide ${snapshot?.is_tot_trainer ? 'bg-amber-400 text-amber-950 shadow-sm shadow-amber-500/30' : 'bg-white/10 text-white'}`}>
                        {snapshot?.is_tot_trainer ? 'خبير مدرب (TOT)' : 'عضو متطوع أساسي'}
                      </span>
                    </div>
                  </div>
                </motion.div>

                <div className="space-y-3">
                  <div className="relative group">
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-[#7A1C2E] transition-colors duration-300" />
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full pr-11 pl-4 py-3.5 bg-gray-50/70 border border-slate-100 rounded-2xl text-slate-900 outline-none focus:border-[#7A1C2E] focus:bg-white focus:ring-4 focus:ring-red-700/5 transition-all duration-300 text-left font-bold placeholder-slate-400 text-xs" dir="ltr" placeholder="Choose Username" />
                  </div>

                  <div className="relative group">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-[#7A1C2E] transition-colors duration-300" />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pr-11 pl-4 py-3.5 bg-gray-50/70 border border-slate-100 rounded-2xl text-slate-900 outline-none focus:border-[#7A1C2E] focus:bg-white focus:ring-4 focus:ring-red-700/5 transition-all duration-300 text-left font-bold placeholder-slate-400 text-xs" dir="ltr" placeholder="Create Password" />
                  </div>

                  <div className="relative group">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-[#7A1C2E] transition-colors duration-300" />
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full pr-11 pl-4 py-3.5 bg-gray-50/70 border border-slate-100 rounded-2xl text-slate-900 outline-none focus:border-[#7A1C2E] focus:bg-white focus:ring-4 focus:ring-red-700/5 transition-all duration-300 text-left font-bold placeholder-slate-400 text-xs" dir="ltr" placeholder="Confirm Password" />
                  </div>
                </div>

                <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#560E1A] via-[#7A1C2E] to-[#400A13] text-white font-black py-3.5 rounded-2xl transition duration-300 shadow-md shadow-red-900/10 disabled:opacity-50 text-xs mt-4 cursor-pointer">
                  {loading ? 'جاري بناء الحساب السحابي...' : 'إنشاء وتفعيل الحساب بشكل نهائي'}
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
