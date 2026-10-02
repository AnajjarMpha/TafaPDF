import React, { useState } from 'react';
import { Lock, Key, User, ShieldAlert, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { SupportedLanguage } from '../constants/i18n';
import { verifyAdminCredentials, setAdminAuthenticated } from '../utils/siteSettingsStorage';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  language: SupportedLanguage;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  language
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const isAr = language === 'ar';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const isValid = verifyAdminCredentials(username, password);
      if (isValid) {
        setAdminAuthenticated(true);
        setIsSubmitting(false);
        onSuccess();
      } else {
        setIsSubmitting(false);
        setErrorMsg(
          isAr
            ? 'اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التأكد من البيانات والمحاولة مجدداً.'
            : 'Invalid username or password. Please verify credentials and try again.'
        );
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-md overflow-hidden text-neutral-900"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header with security shield */}
        <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-950 px-6 py-8 text-white text-center relative">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-500 flex items-center justify-center mb-3 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold tracking-tight">
            {isAr ? 'بوابة المشرف السرية (/adminapp)' : 'Secret Admin Gateway (/adminapp)'}
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            {isAr
              ? 'الوصول مقتصر على مدير المنصة لإدارة إعلانات Google AdSense والسيو'
              : 'Restricted administrative access for platform settings, AdSense & SEO'}
          </p>
          <div className="absolute top-3 end-3">
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer text-xs"
              title={isAr ? 'العودة للمنصة' : 'Back to platform'}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              {isAr ? 'اسم المستخدم (User)' : 'Username'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-neutral-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                autoFocus
                placeholder={isAr ? 'أدخل اسم المستخدم' : 'Enter username'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full ps-9 pe-3 py-2.5 text-xs font-semibold border border-neutral-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-600 outline-hidden bg-white text-neutral-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              {isAr ? 'كلمة المرور (Password)' : 'Password'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-neutral-400">
                <Key className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full ps-9 pe-10 py-2.5 text-xs font-mono font-semibold border border-neutral-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-600 outline-hidden bg-white text-neutral-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 end-0 flex items-center pe-3 text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-2.5 px-4 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <span>{isAr ? 'جاري التحقق من الهوية...' : 'Verifying credentials...'}</span>
            ) : (
              <>
                <span>{isAr ? 'تسجيل الدخول للوحة التحكم' : 'Sign in to Console'}</span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-neutral-500 hover:text-neutral-800 underline transition-colors cursor-pointer"
            >
              {isAr ? 'الرجوع إلى محرر المستندات' : 'Return to Document Editor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
