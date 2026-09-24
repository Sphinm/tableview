import { createContext } from 'react';

export interface BrandingProfile {
  enabled: boolean;
  agentName: string;
  companyName: string;
  nmlsNumber?: string;
  phone: string;
  email: string;
  website?: string;
  customDisclaimer?: string;
  avatarUrl?: string;
  logoUrl?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  plan: 'free' | 'basic' | 'pro';
  credits: number;
  branding?: BrandingProfile;
  purchasedDossiers?: string[];
}

export interface OpenAuthModalOptions {
  reason?: string;
  onSuccess?: () => void;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalReason?: string | null;
  openAuthModal: (options?: OpenAuthModalOptions | string) => void;
  closeAuthModal: () => void;
  requireAuth: (action: () => void, options?: { reason?: string }) => void;
  sendMagicLink: (email: string) => Promise<{ success: boolean; message?: string; devToken?: string }>;
  verifyMagicLink: (token: string) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: (credential: string) => Promise<{ success: boolean; message?: string }>;
  loginAsDemo: (plan?: 'free' | 'pro') => void;
  consumeCredit: (amount?: number) => boolean;
  updateBranding: (branding: Partial<BrandingProfile>) => void;
  purchaseSinglePass: (dealId: string) => Promise<boolean>;
  upgradePlan: (plan: 'free' | 'basic' | 'pro') => Promise<boolean>;
  startCheckout: (options: {
    productKey: 'deal_pass' | 'pro_membership';
    interval?: 'month' | 'year';
    dealId?: string;
  }) => Promise<void>;
  isPro: boolean;
  hasDealPass: (dealId: string) => boolean;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
