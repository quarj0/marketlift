import { apiRequest, graphqlRequest } from '@/lib/api-client';
import { mapUser, type ApiSeller, type ApiUser } from '@/lib/api-mappers';
import type { User } from '@/types';

export type PendingRegistration = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  requiresVerification: boolean;
};

type SessionResponse = { authenticated: boolean; user: ApiUser | null };

export const authService = {
  async getSession(): Promise<User | null> {
    const response = await apiRequest<SessionResponse>('/api/v1/auth/session/');
    return response.authenticated && response.user ? mapUser(response.user) : null;
  },

  async login(input: { emailOrPhone: string; password: string }) {
    const response = await apiRequest<{ authenticated: boolean; user: ApiUser }>('/api/v1/auth/login/', {
      method: 'POST',
      json: input,
      csrf: true,
    });
    return mapUser(response.user);
  },

  async register(input: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    terms: boolean;
  }): Promise<PendingRegistration> {
    return apiRequest<PendingRegistration>('/api/v1/auth/register/', {
      method: 'POST',
      json: {
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        password: input.password,
        terms: input.terms,
      },
      csrf: true,
    });
  },

  async verifyOtp(code: string, pending?: Partial<PendingRegistration>) {
    if (!pending?.id) return { success: false };
    const response = await apiRequest<{ success: boolean; user: ApiUser | null }>('/api/v1/auth/verify-email/', {
      method: 'POST',
      json: { userId: pending.id, code },
      csrf: true,
    });
    return { success: response.success, user: response.user ? mapUser(response.user) : null };
  },

  async activateSelling() {
    await graphqlRequest<{ activateSelling: ApiSeller }>(
      `mutation ActivateSelling { activateSelling { id name avatarUrl verified sellerType isSuspended rating reviews positiveReviewPercent responseRate activeListings followerCount isFollowed memberSince location { state stateCode city district } } }`,
    );
    const session = await this.getSession();
    if (!session) throw new Error('Authentication required');
    return session;
  },

  async resendOtp(userId?: string) {
    return apiRequest<{ success: boolean }>('/api/v1/auth/resend-verification/', {
      method: 'POST',
      json: { userId },
      csrf: true,
    });
  },

  async requestPasswordReset(identifier: string) {
    return apiRequest<{ success: boolean; maskedDestination?: string }>('/api/v1/auth/password-reset/request/', {
      method: 'POST',
      json: { identifier },
      csrf: true,
    });
  },

  async resetPassword(input: { token: string; password: string }) {
    return apiRequest<{ success: boolean }>('/api/v1/auth/password-reset/confirm/', {
      method: 'POST',
      json: input,
      csrf: true,
    });
  },

  async logout() {
    await apiRequest<void>('/api/v1/auth/logout/', { method: 'POST', csrf: true });
  },
};
