import { useState, useEffect, type ReactNode } from 'react';
import { AuthContext, type User, type BrandingProfile } from './authTypes';

const TOKEN_STORAGE_KEY = 'tableview_auth_token';
const MOCK_USER_KEY = 'tableview_mock_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

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

  const logout = () => {
    setUser(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(MOCK_USER_KEY);
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  };

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
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
      }

      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (storedToken) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });
          if (res.ok) {
            const data = (await res.json()) as any;
            if (data.user) {
              setUser(data.user);
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
          setUser(JSON.parse(storedMockUser));
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
        openAuthModal,
        closeAuthModal,
        sendMagicLink,
        verifyMagicLink,
        loginWithGoogle,
        loginAsDemo,
        consumeCredit,
        updateBranding,
        purchaseSinglePass,
        upgradePlan,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
