import { useEffect, useRef } from 'react';
import { useAuth } from '../lib/useAuth';

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '31608768589-eiqse3nup8fffuhf17utrvjnt5085gg1.apps.googleusercontent.com';

/**
 * Google One Tap automatic sign-in prompt.
 *
 * Renders the native top-right Google floating card when the visitor
 * has an active Google session and is not yet signed into TableView.
 */
export function GoogleOneTap() {
  const { user, isLoading, isAuthModalOpen, loginWithGoogle } = useAuth();
  const promptAttemptedRef = useRef(false);

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    // Do not show if still resolving session or already logged in
    if (isLoading || user) {
      if ((window as any).google?.accounts?.id) {
        try {
          (window as any).google.accounts.id.cancel();
        } catch {}
      }
      return;
    }

    // Do not overlap if AuthModal is currently open
    if (isAuthModalOpen) {
      if ((window as any).google?.accounts?.id) {
        try {
          (window as any).google.accounts.id.cancel();
        } catch {}
      }
      return;
    }

    let isMounted = true;

    const triggerPrompt = () => {
      if (!isMounted || user || isAuthModalOpen) return;
      if (!(window as any).google?.accounts?.id) return;

      try {
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response: { credential?: string }) => {
            if (response.credential && isMounted) {
              try {
                await loginWithGoogle(response.credential);
              } catch (err) {
                console.warn('Google One Tap authentication error:', err);
              }
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
          itp_support: true,
        });

        if (!promptAttemptedRef.current) {
          promptAttemptedRef.current = true;
          (window as any).google.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed?.()) {
              console.debug('[OneTap] Not displayed:', notification.getNotDisplayedReason?.());
            } else if (notification.isSkippedMoment?.()) {
              console.debug('[OneTap] Skipped:', notification.getSkippedReason?.());
            } else if (notification.isDismissedMoment?.()) {
              console.debug('[OneTap] Dismissed by user:', notification.getDismissedReason?.());
            }
          });
        }
      } catch (err) {
        console.warn('[OneTap] Initialization deferred or failed:', err);
      }
    };

    if ((window as any).google?.accounts?.id) {
      triggerPrompt();
    } else {
      const interval = setInterval(() => {
        if ((window as any).google?.accounts?.id) {
          clearInterval(interval);
          triggerPrompt();
        }
      }, 150);

      const timeout = setTimeout(() => {
        clearInterval(interval);
      }, 8000);

      return () => {
        isMounted = false;
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }

    return () => {
      isMounted = false;
    };
  }, [user, isLoading, isAuthModalOpen, loginWithGoogle]);

  return null;
}

export default GoogleOneTap;
