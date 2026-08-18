import type { User } from '@/types';

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));
const SESSION_KEY = 'marketlift-demo-session';

function emitAuthChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('marketlift-auth-change'));
  }
}

function parseSessionSnapshot(snapshot: string): User | null {
  if (!snapshot) return null;
  try {
    return JSON.parse(snapshot) as User;
  } catch {
    return null;
  }
}

function demoUser(emailOrPhone?: string): User {
  const email = emailOrPhone?.includes('@')
    ? emailOrPhone
    : 'marketlift@demo.marketlift';
  const phone =
    emailOrPhone && !emailOrPhone.includes('@')
      ? emailOrPhone
      : '+55 11 99999-4321';
  const newUserDemo = email.toLowerCase().startsWith('new@');

  return {
    id: newUserDemo ? 'new-demo-user' : 'marketlift-demo-user',
    name: newUserDemo ? 'Ana Souza' : 'Lucas Martins',
    email,
    phone,
    ...(newUserDemo
      ? {}
      : {
          sellerProfile: {
            sellerId: 'seller-1',
            activatedAt: '2026-04-12T10:00:00.000Z',
            verified: false,
          },
        }),
  };
}

export const authService = {
  async login(input: { emailOrPhone: string; password: string }) {
    await delay();
    const user = demoUser(input.emailOrPhone);
    this.setSession(user);
    return user;
  },

  async register(input: { fullName: string; email: string; phone: string }) {
    await delay();
    return {
      id: `user-${Date.now()}`,
      name: input.fullName,
      email: input.email,
      phone: input.phone,
      requiresVerification: true,
    };
  },

  async verifyOtp(code: string, user?: Partial<User>) {
    await delay();
    const success = code === '123456' || (/^\d{6}$/.test(code) && code !== '000000');

    if (success) {
      this.setSession({
        id: user?.id || `user-${Date.now()}`,
        name: user?.name || 'New Marketlift User',
        email: user?.email || 'user@marketlift.demo',
        phone: user?.phone,
      });
    }

    return { success };
  },

  async activateSelling() {
    await delay(450);
    const current = this.getSession();
    if (!current) throw new Error('Authentication required');
    if (current.sellerProfile) return current;

    const next: User = {
      ...current,
      sellerProfile: {
        sellerId: `seller-${current.id}`,
        activatedAt: new Date().toISOString(),
        verified: false,
      },
    };

    this.setSession(next);
    return next;
  },

  async resendOtp() {
    await delay(250);
    return { success: true };
  },

  async requestPasswordReset(identifier: string) {
    await delay();
    return {
      success: true,
      maskedDestination: identifier.includes('@')
        ? identifier.replace(/(^.).*(@.*$)/, '$1***$2')
        : '***-***-4321',
    };
  },

  async resetPassword(input: { token: string; password: string }) {
    await delay();
    return { success: Boolean(input.token) && input.password.length >= 8 };
  },

  setSession(user: User) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      emitAuthChange();
    }
    return user;
  },

  getSessionSnapshot() {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(SESSION_KEY) ?? '';
  },

  parseSessionSnapshot,

  getSession(): User | null {
    return parseSessionSnapshot(this.getSessionSnapshot());
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_KEY);
      emitAuthChange();
    }
  },
};
