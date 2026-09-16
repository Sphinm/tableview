import { useState } from 'react';
import { X, Mail, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../lib/useAuth';

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, sendMagicLink, verifyMagicLink, loginAsDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await sendMagicLink(email);
    setIsSubmitting(false);

    if (res.success) {
      setSentSuccess(true);
      if (res.devToken) {
        setDevToken(res.devToken);
      }
    } else {
      setErrorMessage(res.message || 'Failed to send magic link');
    }
  };

  const handleQuickVerify = async () => {
    if (!devToken) return;
    setIsSubmitting(true);
    await verifyMagicLink(devToken);
    setIsSubmitting(false);
    closeAuthModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl transition-all"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-7">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sign In to TableView</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Get 30 free monthly credits to compress larger videos & images
            </p>
          </div>

          {/* Social Sign-In (Google) */}
          <div className="space-y-3 mb-5">
            <button
              onClick={() => loginAsDemo('free')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium rounded-xl transition-all shadow-sm active:scale-[0.99]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center mb-5">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Or with email magic link
            </span>
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
          </div>

          {/* Email Magic Link Form */}
          {!sentSuccess ? (
            <form onSubmit={handleSendMagicLink} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Magic Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-4 space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-1">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Check your email</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                We sent a sign-in link to <span className="font-semibold text-slate-700 dark:text-slate-200">{email}</span>.
              </p>

              {devToken && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-left">
                  <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
                    Local Dev Simulation:
                  </div>
                  <button
                    onClick={handleQuickVerify}
                    className="w-full py-2 px-3 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Click to Verify Instantly ({devToken.slice(0, 8)}...)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Instant Quick Test Buttons (for effortless evaluation) */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <div className="text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Quick Preview Roles
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => loginAsDemo('free')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                <span>Free Plan (30 Cr)</span>
              </button>
              <button
                onClick={() => loginAsDemo('pro')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-lg text-xs font-medium transition-colors"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Pro Member</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
