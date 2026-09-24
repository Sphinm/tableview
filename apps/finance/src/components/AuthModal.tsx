import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, ShieldCheck } from 'lucide-react';
import { Dialog } from '@tableview/ui';
import { useAuth } from '../lib/useAuth';
import { trackUserAction, trackUserClick } from '../lib/sentry';

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, loginWithGoogle, loginAsDemo, authModalReason } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const googleButtonContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthModalOpen) return;
    const clientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      '31608768589-eiqse3nup8fffuhf17utrvjnt5085gg1.apps.googleusercontent.com';

    let isMounted = true;

    const renderGoogleBtn = () => {
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.id && googleButtonContainerRef.current) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response: { credential?: string }) => {
              if (response.credential) {
                trackUserAction('auth_google_credential_received');
                setIsSubmitting(true);
                setErrorMessage(null);
                try {
                  const res = await loginWithGoogle(response.credential);
                  if (res.success) {
                    trackUserAction('auth_google_login_success');
                    closeAuthModal();
                  } else {
                    trackUserAction('auth_google_login_failed', { error: res.message });
                    if (isMounted) {
                      setErrorMessage(res.message || 'Google sign-in failed');
                      setIsSubmitting(false);
                    }
                  }
                } catch {
                  trackUserAction('auth_google_login_error');
                  if (isMounted) {
                    setErrorMessage('Google sign-in encountered an error');
                    setIsSubmitting(false);
                  }
                }
              }
            },
          });

          if (googleButtonContainerRef.current) {
            // Render official Google button into container
            (window as any).google.accounts.id.renderButton(googleButtonContainerRef.current, {
              theme: 'outline',
              size: 'large',
              type: 'standard',
              shape: 'rectangular',
              text: 'continue_with',
              logo_alignment: 'left',
              width: 340,
              // Force English button copy ("Continue with Google"). Without this,
              // GIS falls back to the browser/account locale and renders a
              // localized label for non-English visitors.
              locale: 'en',
            });
            if (isMounted) {
              setIsGoogleLoaded(true);
            }
          }
        } catch (err) {
          console.warn('Google Identity initialization deferred:', err);
        }
      }
    };

    const container = googleButtonContainerRef.current;

    if ((window as any).google?.accounts?.id) {
      renderGoogleBtn();
    } else {
      const interval = setInterval(() => {
        if ((window as any).google?.accounts?.id) {
          clearInterval(interval);
          renderGoogleBtn();
        }
      }, 150);
      return () => {
        isMounted = false;
        clearInterval(interval);
        if (container) {
          try {
            container.innerHTML = '';
          } catch {}
        }
        if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
          try {
            (window as any).google.accounts.id.cancel();
          } catch {}
        }
      };
    }

    return () => {
      isMounted = false;
      if (container) {
        try {
          container.innerHTML = '';
        } catch {}
      }
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
        try {
          (window as any).google.accounts.id.cancel();
        } catch {}
      }
    };
  }, [isAuthModalOpen, loginWithGoogle, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleFallbackClick = () => {
    trackUserClick('auth_fallback_google_click');
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.prompt();
    } else {
      setErrorMessage('Google Sign-In is loading or blocked by your browser. Please ensure accounts.google.com is not blocked.');
    }
  };

  return (
    <Dialog
      onClose={() => {
        trackUserClick('auth_modal_close_click');
        closeAuthModal();
      }}
      labelledBy="auth-modal-title"
      overlayClassName="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
      panelClassName="relative w-full max-w-md overflow-hidden bg-white border border-slate-200 rounded-3xl shadow-2xl transition-all"
    >
        {/* Subtle decorative top ambient highlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

        {/* Close Button */}
        <button
          onClick={() => {
            trackUserClick('auth_modal_close_click');
            closeAuthModal();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-indigo-50 text-indigo-600 mb-3.5 border border-indigo-100 shadow-xs">
              <Sparkles className="size-5 text-indigo-600" />
            </div>
            <h2 id="auth-modal-title" className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Sign In to TableView
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed max-w-xs mx-auto">
              Sign in with your Google account to sync your saved scenarios, access history, and use private in-browser tools.
            </p>

            {authModalReason && (
              <div className="mt-3 px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-medium text-center">
                {authModalReason}
              </div>
            )}
          </div>

          {/* Social Sign-In (Google Only) */}
          <div className="my-6 flex flex-col items-center">
            {isSubmitting ? (
              <div className="py-6 flex flex-col items-center gap-3">
                <span className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold text-slate-600">Signing in with Google...</span>
              </div>
            ) : null}

            <div className={`w-full flex flex-col items-center ${isSubmitting ? 'hidden' : ''}`}>
              {!isGoogleLoaded && (
                <button
                  type="button"
                  onClick={handleFallbackClick}
                  className="w-full max-w-[340px] flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold rounded-xl transition-all shadow-xs active:scale-[0.99] cursor-pointer text-sm"
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
              )}

              {/* Empty mount container for Google Identity Services. React MUST NOT render children here. */}
              <div
                ref={googleButtonContainerRef}
                className={`notranslate w-full flex justify-center min-h-[44px] ${!isGoogleLoaded ? 'hidden' : ''}`}
              />
            </div>

            {errorMessage && (
              <div className="mt-4 w-full p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl font-medium text-center">
                {errorMessage}
              </div>
            )}
          </div>

          {/* Privacy Trust Guarantee Badge */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Privacy First: Your files never leave your device</span>
          </div>

          {import.meta.env.DEV && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center">
              <button
                type="button"
                onClick={() => {
                  trackUserClick('auth_dev_demo_login_click');
                  loginAsDemo('free');
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline cursor-pointer"
              >
                [Dev Mode] Quick Demo Sign-In
              </button>
            </div>
          )}
        </div>
    </Dialog>
  );
}
