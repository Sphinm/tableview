import { useState, useEffect, useRef } from 'react';
import { X, Mail, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../lib/useAuth';

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, sendMagicLink, verifyMagicLink, loginWithGoogle, loginAsDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);
  const googleButtonContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthModalOpen) return;
    const clientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      '31608768589-eiqse3nup8fffuhf17utrvjnt5085gg1.apps.googleusercontent.com';

    const renderGoogleBtn = () => {
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.id && googleButtonContainerRef.current) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response: { credential?: string }) => {
              if (response.credential) {
                setIsSubmitting(true);
                setErrorMessage(null);
                const res = await loginWithGoogle(response.credential);
                setIsSubmitting(false);
                if (res.success) {
                  closeAuthModal();
                } else {
                  setErrorMessage(res.message || 'Google sign-in failed');
                }
              }
            },
          });

          // Render official Google button into container
          (window as any).google.accounts.id.renderButton(googleButtonContainerRef.current, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            shape: 'rectangular',
            text: 'continue_with',
            logo_alignment: 'left',
            width: 360,
          });
        } catch (err) {
          console.warn('Google Identity initialization deferred:', err);
        }
      }
    };

    if ((window as any).google?.accounts?.id) {
      renderGoogleBtn();
    } else {
      const interval = setInterval(() => {
        if ((window as any).google?.accounts?.id) {
          clearInterval(interval);
          renderGoogleBtn();
        }
      }, 150);
      return () => clearInterval(interval);
    }
  }, [isAuthModalOpen, loginWithGoogle, closeAuthModal]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md overflow-hidden bg-white border border-slate-200 rounded-3xl shadow-2xl transition-all"
        role="dialog"
        aria-modal="true"
      >
        {/* Subtle decorative top ambient highlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-slate-950 text-white mb-3.5 border border-slate-800 shadow-xs">
              <Sparkles className="size-5 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Sign In to TableView
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed max-w-xs mx-auto">
              Get 30 free monthly credits for private in-browser video & image compression, plus unlimited data tools.
            </p>
          </div>

          {/* Social Sign-In (Google) */}
          <div className="mb-5 flex flex-col items-center">
            <div ref={googleButtonContainerRef} className="w-full flex justify-center min-h-[44px]">
              <button
                type="button"
                onClick={() => {
                  if ((window as any).google?.accounts?.id) {
                    (window as any).google.accounts.id.prompt();
                  } else {
                    loginAsDemo('free');
                  }
                }}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold rounded-xl transition-all shadow-xs active:scale-[0.99] cursor-pointer text-sm"
              >
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
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
          </div>

          {/* Divider: Rock-solid horizontal rule that will NEVER wrap into 5 lines */}
          <div className="relative flex items-center my-5 w-full">
            <div className="grow border-t border-slate-200" />
            <span className="shrink-0 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600 bg-white whitespace-nowrap">
              or continue with email
            </span>
            <div className="grow border-t border-slate-200" />
          </div>

          {/* Email Magic Link Form */}
          {!sentSuccess ? (
            <form onSubmit={handleSendMagicLink} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
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
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-medium"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl font-medium">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-xs cursor-pointer active:scale-[0.99]"
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
              <div className="inline-flex items-center justify-center size-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mb-1">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Check your email</h3>
              <p className="text-xs sm:text-sm text-slate-600">
                We sent a sign-in link to <span className="font-semibold text-slate-900">{email}</span>.
              </p>

              {devToken && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-left">
                  <div className="text-xs font-semibold text-blue-700 mb-1">
                    Local Dev Simulation:
                  </div>
                  <button
                    onClick={handleQuickVerify}
                    className="w-full py-2 px-3 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    Click to Verify Instantly ({devToken.slice(0, 8)}...)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Privacy Trust Guarantee Badge */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>100% Client-Side Privacy: Your files never leave your device</span>
          </div>

          {/* Dev-only preview roles (hidden in production) */}
          {import.meta.env.DEV && (
            <div className="mt-4 pt-3 border-t border-dashed border-slate-200">
              <div className="text-center text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                Dev Preview Roles
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => loginAsDemo('free')}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3 h-3 text-blue-500" />
                  <span>Free (30 Cr)</span>
                </button>
                <button
                  type="button"
                  onClick={() => loginAsDemo('pro')}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span>Pro Member</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
