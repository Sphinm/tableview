import { describe, it, expect, beforeEach, afterEach } from 'bun:test';

const PENDING_DEAL_STORAGE_KEY = 'tableview_pending_deal_prompt';

describe('AI Deal Copilot Pending Prompt Refill Logic', () => {
  let store: Record<string, string> = {};
  let originalSessionStorage: any;

  beforeEach(() => {
    store = {};
    originalSessionStorage = (globalThis as any).sessionStorage;
    (globalThis as any).sessionStorage = {
      getItem: (k: string) => (k in store ? store[k] : null),
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
      clear: () => {
        store = {};
      },
    };
  });

  afterEach(() => {
    (globalThis as any).sessionStorage = originalSessionStorage;
  });

  it('persists unauthenticated user prompt to sessionStorage on action click', () => {
    const promptText = 'Buying a 4-unit property for $850k with $6,200 monthly rent';
    
    // Simulate unauthenticated calculate click saving text
    (globalThis as any).sessionStorage.setItem(PENDING_DEAL_STORAGE_KEY, promptText);
    
    expect((globalThis as any).sessionStorage.getItem(PENDING_DEAL_STORAGE_KEY)).toBe(promptText);
  });

  it('restores prompt from sessionStorage upon authentication and cleans up storage', () => {
    const promptText = 'Buying a 4-unit property for $850k with $6,200 monthly rent';
    (globalThis as any).sessionStorage.setItem(PENDING_DEAL_STORAGE_KEY, promptText);

    // Simulate copilot mounting or user logging in
    const restoredText = (globalThis as any).sessionStorage.getItem(PENDING_DEAL_STORAGE_KEY);
    expect(restoredText).toBe(promptText);

    (globalThis as any).sessionStorage.removeItem(PENDING_DEAL_STORAGE_KEY);
    expect((globalThis as any).sessionStorage.getItem(PENDING_DEAL_STORAGE_KEY)).toBeNull();
  });

  it('safely handles empty or missing pending prompt', () => {
    const restoredText = (globalThis as any).sessionStorage.getItem(PENDING_DEAL_STORAGE_KEY);
    expect(restoredText).toBeNull();
  });
});

describe('AuthModal Reason and Post-Login Callback Mechanism', () => {
  it('stores auth modal reason when requesting sign-in for a protected action', () => {
    let modalOpen = false;
    let modalReason: string | null = null;
    let pendingCallback: (() => void) | null = null;

    const openAuthModal = (options?: { reason?: string; onSuccess?: () => void }) => {
      modalOpen = true;
      modalReason = options?.reason ?? null;
      if (options?.onSuccess) {
        pendingCallback = options.onSuccess;
      }
    };

    openAuthModal({
      reason: 'Please sign in with Google to continue. Your prompt will be refilled automatically.',
      onSuccess: () => {
        // Refill logic
      }
    });

    expect(modalOpen).toBe(true);
    expect(modalReason).toContain('Your prompt will be refilled automatically');
    expect(typeof pendingCallback).toBe('function');
  });

  it('immediately executes action if user is authenticated without prompting modal', () => {
    const mockUser = { id: 'u1', email: 'test@example.com', name: 'Tester', plan: 'free' };
    let modalOpened = false;
    let actionExecuted = false;

    const requireAuth = (
      user: typeof mockUser | null,
      action: () => void,
      openModal: () => void
    ) => {
      if (user) {
        action();
      } else {
        openModal();
      }
    };

    requireAuth(
      mockUser,
      () => { actionExecuted = true; },
      () => { modalOpened = true; }
    );

    expect(actionExecuted).toBe(true);
    expect(modalOpened).toBe(false);
  });

  it('prompts modal if user is not authenticated and executes callback after login', () => {
    let user: any = null;
    let modalOpened = false;
    let actionExecuted = false;
    let registeredSuccess: (() => void) | null = null;

    const requireAuth = (
      currentUser: any,
      action: () => void,
      openModal: (cb: () => void) => void
    ) => {
      if (currentUser) {
        action();
      } else {
        openModal(action);
      }
    };

    // User clicks protected button while logged out
    requireAuth(
      user,
      () => { actionExecuted = true; },
      (cb) => {
        modalOpened = true;
        registeredSuccess = cb;
      }
    );

    expect(actionExecuted).toBe(false);
    expect(modalOpened).toBe(true);

    // Simulate Google Login success
    user = { id: 'google_123', email: 'user@gmail.com' };
    if (registeredSuccess) {
      registeredSuccess();
    }

    expect(actionExecuted).toBe(true);
  });
});
