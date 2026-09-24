import { useState, useEffect, useRef, type ReactNode } from 'react';
import { AuthContext, type User, type BrandingProfile, type OpenAuthModalOptions } from './authTypes';
import { setSentryUser, trackUserAction } from './sentry';

const TOKEN_STORAGE_KEY = 'tableview_auth_token';
const MOCK_USER_KEY = 'tableview_mock_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalReason, setAuthModalReason] = useState<string | null>(null);
  const onSuccessRef = useRef<(() => void) | null>(null);

  const openAuthModal = (options?: OpenAuthModalOptions | string) => {
    if (typeof options === 'string') {
      setAuthModalReason(options);
      onSuccessRef.current = null;
    } else if (options) {
      setAuthModalReason(options.reason || null);
      onSuccessRef.current = options.onSuccess || null;
    } else {
      setAuthModalReason(null);
      onSuccessRef.current = null;
    }
    setIsAuthModalOpen(true);
    trackUserAction('auth_modal_opened', {
      reason: typeof options === 'string' ? options : options?.reason,
    });
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalReason(null);
    onSuccessRef.current = null;
  };

  const triggerPostLoginSuccess = () => {
    if (onSuccessRef.current) {
      const cb = onSuccessRef.current;
      onSuccessRef.current = null;
      try {
        cb();
      } catch (err) {
        console.error('Post-login callback execution failed:', err);
      }
    }
  };

  const requireAuth = (action: () => void, options?: { reason?: string }) => {
    if (user) {
      action();
    } else {
      openAuthModal({
        reason: options?.reason,
        onSuccess: action,
      });
    }
  };

  const verifyMagicLink = async (token: string) => {
    try {
      const res = await fetch('/api/auth/verify-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (res.ok) {
        const data = (await res.json()) as any;
        if (data.token) localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
        if (data.user) {
          const formattedUser: User = {
            id: data.user.id || 'user_' + Math.random().toString(36).slice(2, 9),
            email: data.user.email,
            name: data.user.name || data.user.email?.split('@')[0] || 'User',
            avatarUrl: data.user.avatarUrl || data.user.avatar_url || null,
            plan: data.user.plan || 'free',
            credits: data.user.credits ?? 30,
          };
          setUser(formattedUser);
          setSentryUser(formattedUser);
          triggerPostLoginSuccess();
          localStorage.setItem(MOCK_USER_KEY, JSON.stringify(formattedUser));
        }
        return { success: true };
      }

      if (res.status === 404) {
        // Fallback for local development or static hosting
        const mockUser: User = {
          id: 'user_' + Math.random().toString(36).slice(2, 9),
          email: 'user@example.com',
          name: 'Demo User',
          plan: 'free',
          credits: 30,
        };
        setUser(mockUser);
        setSentryUser(mockUser);
        triggerPostLoginSuccess();
        localStorage.setItem(MOCK_USER_KEY, JSON.stringify(mockUser));
        return { success: true };
      }

      const err = (await res.json().catch(() => ({}))) as any;
      return { success: false, message: err.error || 'Verification failed' };
    } catch {
      // Local development fallback
      const mockUser: User = {
        id: 'user_' + Math.random().toString(36).slice(2, 9),
        email: 'user@example.com',
        name: 'Demo User',
        plan: 'free',
        credits: 30,
      };
      setUser(mockUser);
      setSentryUser(mockUser);
      triggerPostLoginSuccess();
      localStorage.setItem(MOCK_USER_KEY, JSON.stringify(mockUser));
      return { success: true };
    }
  };

  const sendMagicLink = async (email: string) => {
    try {
      const res = await fetch('/api/auth/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        const data = (await res.json()) as any;
        return { success: true, message: data.message, devToken: data.devToken };
      }

      if (res.status === 404) {
        const devToken = crypto.randomUUID();
        return {
          success: true,
          message: 'Dev mode: Magic link generated! Click verify below.',
          devToken,
        };
      }

      const err = (await res.json().catch(() => ({}))) as any;
      return { success: false, message: err.error || 'Failed to send magic link' };
    } catch {
      // Local development fallback
      const devToken = crypto.randomUUID();
      return {
        success: true,
        message: 'Dev mode: Magic link generated! Click verify below.',
        devToken,
      };
    }
  };

  const loginWithGoogle = async (credential: string) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });

      if (res.ok) {
        const data = (await res.json()) as any;
        if (data.token) localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
        if (data.user) {
          const formattedUser: User = {
            id: data.user.id || 'user_' + Math.random().toString(36).slice(2, 9),
            email: data.user.email,
            name: data.user.name || data.user.email?.split('@')[0] || 'User',
            avatarUrl: data.user.avatarUrl || data.user.avatar_url || null,
            plan: data.user.plan || 'free',
            credits: data.user.credits ?? 30,
          };
          setUser(formattedUser);
          setSentryUser(formattedUser);
          triggerPostLoginSuccess();
          localStorage.setItem(MOCK_USER_KEY, JSON.stringify(formattedUser));
        }
        return { success: true };
      }

      if (res.status !== 404) {
        const err = (await res.json().catch(() => ({}))) as any;
        return { success: false, message: err.error || 'Google sign-in failed' };
      }
    } catch {
      // Network failure, proceed to client-side token parsing below
    }

    // Client-side fallback: decode Google ID Token directly if /api/auth/google is 404 or unreachable
    try {
      const parts = credential.split('.');
      if (parts.length >= 2) {
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const payload = JSON.parse(jsonPayload);
        if (payload?.email) {
          const fallbackUser: User = {
            id: 'google_' + (payload.sub || Math.random().toString(36).slice(2, 9)),
            email: payload.email,
            name: payload.name || payload.email.split('@')[0],
            avatarUrl: payload.picture || null,
            plan: 'free',
            credits: 30,
          };
          setUser(fallbackUser);
          setSentryUser(fallbackUser);
          triggerPostLoginSuccess();
          localStorage.setItem(MOCK_USER_KEY, JSON.stringify(fallbackUser));
          return { success: true };
        }
      }
    } catch (decodeErr) {
      console.warn('Fallback Google token decoding failed:', decodeErr);
    }

    return { success: false, message: 'Google sign-in failed' };
  };

  const loginAsDemo = (plan: 'free' | 'pro' = 'free') => {
    const mockUser: User = {
      id: 'demo_' + Date.now(),
      email: plan === 'pro' ? 'pro@tableview.dev' : 'creator@tableview.dev',
      name: plan === 'pro' ? 'Pro Member' : 'Creator',
      plan,
      credits: plan === 'pro' ? 5000 : 30,
    };
    setUser(mockUser);
    setSentryUser(mockUser);
    triggerPostLoginSuccess();
    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(mockUser));
    closeAuthModal();
  };

  const consumeCredit = (amount: number = 1): boolean => {
    if (!user) return true; // Guests can proceed with initial quota
    if (user.credits < amount) return false;
    const updated = { ...user, credits: user.credits - amount };
    setUser(updated);
    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(updated));
    return true;
  };

  const updateBranding = (branding: Partial<BrandingProfile>) => {
    setUser((prev) => {
      const current: User = prev || {
        id: 'user_' + Date.now(),
        email: 'user@tableview.dev',
        name: branding.agentName || 'Pro User',
        plan: 'free',
        credits: 30,
      };
      const updatedBranding: BrandingProfile = {
        enabled: branding.enabled ?? current.branding?.enabled ?? true,
        agentName: branding.agentName ?? current.branding?.agentName ?? '',
        companyName: branding.companyName ?? current.branding?.companyName ?? '',
        nmlsNumber: branding.nmlsNumber ?? current.branding?.nmlsNumber ?? '',
        phone: branding.phone ?? current.branding?.phone ?? '',
        email: branding.email ?? current.branding?.email ?? '',
        website: branding.website ?? current.branding?.website ?? '',
        customDisclaimer: branding.customDisclaimer ?? current.branding?.customDisclaimer ?? '',
        avatarUrl: branding.avatarUrl ?? current.branding?.avatarUrl,
        logoUrl: branding.logoUrl ?? current.branding?.logoUrl,
      };
      const updatedUser: User = {
        ...current,
        branding: updatedBranding,
      };
      localStorage.setItem(MOCK_USER_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const purchaseSinglePass = async (dealId: string): Promise<boolean> => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      fetch('/api/billing/confirm-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productKey: 'deal_pass',
          dealId,
          status: 'succeeded',
        }),
      }).catch(() => {});
    }

    setUser((prev) => {
      const current: User = prev || {
        id: 'user_' + Date.now(),
        email: 'buyer@tableview.dev',
        name: 'Home Buyer',
        plan: 'free',
        credits: 30,
      };
      const existing = current.purchasedDossiers || [];
      if (existing.includes(dealId)) return current;
      const updatedUser: User = {
        ...current,
        purchasedDossiers: [...existing, dealId],
      };
      localStorage.setItem(MOCK_USER_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    });
    return true;
  };

  const upgradePlan = async (newPlan: 'free' | 'basic' | 'pro'): Promise<boolean> => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token && newPlan === 'pro') {
      fetch('/api/billing/confirm-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productKey: 'pro_membership',
          status: 'succeeded',
        }),
      }).catch(() => {});
    }

    setUser((prev) => {
      const current: User = prev || {
        id: 'user_' + Date.now(),
        email: 'pro@tableview.dev',
        name: 'Pro Member',
        plan: 'free',
        credits: 30,
      };
      const updatedUser: User = {
        ...current,
        plan: newPlan,
        credits: newPlan === 'pro' ? 5000 : newPlan === 'basic' ? 750 : 30,
      };
      localStorage.setItem(MOCK_USER_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    });
    return true;
  };

  const startCheckout = async (options: {
    productKey: 'deal_pass' | 'pro_membership';
    interval?: 'month' | 'year';
    dealId?: string;
  }): Promise<void> => {
    trackUserAction('checkout_initiated', {
      productKey: options.productKey,
      interval: options.interval,
      dealId: options.dealId,
    });

    try {
      sessionStorage.setItem(
        'tableview_pending_checkout',
        JSON.stringify({
          productKey: options.productKey,
          interval: options.interval,
          dealId: options.dealId,
        })
      );
    } catch {}

    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          productKey: options.productKey,
          interval: options.interval,
          dealId: options.dealId,
          successUrl: window.location.href,
          cancelUrl: window.location.href,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as { checkoutUrl?: string; isSimulated?: boolean };
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
          return;
        }
      }
    } catch (err) {
      console.warn('Checkout API request failed, applying local fallback:', err);
    }

    // Direct fallback if server endpoint is unreachable in client-only demo
    if (options.productKey === 'pro_membership') {
      await upgradePlan('pro');
    } else if (options.productKey === 'deal_pass' && options.dealId) {
      await purchaseSinglePass(options.dealId);
    }
  };

  const logout = () => {
    setUser(null);
    setSentryUser(null);
    trackUserAction('auth_logout');
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(MOCK_USER_KEY);
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  };

  const isPro = user?.plan === 'pro';
  const hasDealPass = (dealId: string): boolean => {
    if (isPro) return true;
    return Boolean(user?.purchasedDossiers?.includes(dealId));
  };

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      let isCheckoutReturn = false;

      // 1. Check if returning from a magic link callback (?auth_token=...)
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const authToken = urlParams.get('auth_token');
        if (authToken) {
          urlParams.delete('auth_token');
          const cleanSearch = urlParams.toString() ? `?${urlParams.toString()}` : '';
          window.history.replaceState({}, '', `${window.location.pathname}${cleanSearch}`);
          await verifyMagicLink(authToken);
          setIsLoading(false);
          return;
        }

        // 2. Check if returning from checkout (?checkout_success=true OR ?status=succeeded OR ?payment_id=...)
        const checkoutSuccess = urlParams.get('checkout_success');
        const paymentStatus = urlParams.get('status');
        const paymentId = urlParams.get('payment_id');

        let pendingCheckout: { productKey?: string; interval?: string; dealId?: string } = {};
        try {
          const raw = sessionStorage.getItem('tableview_pending_checkout');
          if (raw) pendingCheckout = JSON.parse(raw);
        } catch {}

        if (
          checkoutSuccess === 'true' ||
          paymentStatus === 'succeeded' ||
          paymentStatus === 'completed' ||
          Boolean(paymentId)
        ) {
          isCheckoutReturn = true;
          const productKey =
            urlParams.get('product_key') || pendingCheckout.productKey || 'pro_membership';
          const unlockedDealId =
            urlParams.get('unlocked_deal_id') || pendingCheckout.dealId;
          const interval =
            urlParams.get('interval') || pendingCheckout.interval || 'month';

          try {
            sessionStorage.removeItem('tableview_pending_checkout');
          } catch {}

          urlParams.delete('checkout_success');
          urlParams.delete('product_key');
          urlParams.delete('unlocked_deal_id');
          urlParams.delete('interval');
          urlParams.delete('session_id');
          urlParams.delete('status');
          urlParams.delete('payment_id');
          urlParams.delete('email');
          const cleanSearch = urlParams.toString() ? `?${urlParams.toString()}` : '';
          window.history.replaceState({}, '', `${window.location.pathname}${cleanSearch}`);

          const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
          try {
            await fetch('/api/billing/confirm-checkout', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
              },
              body: JSON.stringify({
                productKey,
                interval,
                dealId: unlockedDealId,
                paymentId,
                status: paymentStatus || 'succeeded',
              }),
            });
          } catch (e) {
            console.warn('[Auth] Error confirming checkout:', e);
          }

          if (productKey === 'pro_membership') {
            await upgradePlan('pro');
          } else if (unlockedDealId) {
            await purchaseSinglePass(unlockedDealId);
          }
          trackUserAction('checkout_completed', { productKey, unlockedDealId });
        }
      }

      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (storedToken) {
        try {
          // If returning from checkout or syncing status, probe sync
          if (isCheckoutReturn) {
            await fetch('/api/billing/sync-user-status', {
              method: 'POST',
              headers: { Authorization: `Bearer ${storedToken}` },
            }).catch(() => {});
          }

          const res = await fetch('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });
          if (res.ok) {
            const data = (await res.json()) as any;
            if (data.user) {
              setUser(data.user);
              setSentryUser(data.user);
              setIsLoading(false);
              return;
            }
          }
        } catch {
          // API endpoint unreachable (e.g. static preview or local dev)
        }
      }

      // Check mock user in local development
      const storedMockUser = localStorage.getItem(MOCK_USER_KEY);
      if (storedMockUser) {
        try {
          const parsed = JSON.parse(storedMockUser);
          setUser(parsed);
          setSentryUser(parsed);
        } catch {
          localStorage.removeItem(MOCK_USER_KEY);
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthModalOpen,
        authModalReason,
        openAuthModal,
        closeAuthModal,
        requireAuth,
        sendMagicLink,
        verifyMagicLink,
        loginWithGoogle,
        loginAsDemo,
        consumeCredit,
        updateBranding,
        purchaseSinglePass,
        upgradePlan,
        startCheckout,
        isPro,
        hasDealPass,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
