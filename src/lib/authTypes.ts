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

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  sendMagicLink: (email: string) => Promise<{ success: boolean; message?: string; devToken?: string }>;
  verifyMagicLink: (token: string) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: (credential: string) => Promise<{ success: boolean; message?: string }>;
  loginAsDemo: (plan?: 'free' | 'pro') => void;
  consumeCredit: (amount?: number) => boolean;
  updateBranding: (branding: Partial<BrandingProfile>) => void;
  purchaseSinglePass: (dealId: string) => Promise<boolean>;
  upgradePlan: (plan: 'free' | 'basic' | 'pro') => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
