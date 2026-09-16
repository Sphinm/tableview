import { createContext } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  plan: 'free' | 'basic' | 'pro';
  credits: number;
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
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
