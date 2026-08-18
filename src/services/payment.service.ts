import type {
  BillingCycle,
  Payment,
  PaymentMethod,
  PromotionOption,
  SellerPlan,
} from '@/types';

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

export const sellerPlans: SellerPlan[] = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    listingLimit: 5,
    promotionCredits: 0,
    visibilityWeight: 1,
    features: ['5 active listings', 'Standard visibility', 'Basic seller profile'],
  },
  {
    id: 'basic',
    name: 'Basic',
    monthlyPrice: 39.9,
    yearlyPrice: 399,
    listingLimit: 25,
    promotionCredits: 0,
    visibilityWeight: 1.1,
    features: ['25 active listings', 'Up to 10 photos', 'Basic performance statistics'],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 89.9,
    yearlyPrice: 899,
    listingLimit: 100,
    promotionCredits: 4,
    visibilityWeight: 1.35,
    recommended: true,
    features: [
      '100 active listings',
      'Priority visibility',
      '4 featured credits / month',
      'Seller analytics',
      'Verified seller tools',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    monthlyPrice: 199.9,
    yearlyPrice: 1999,
    listingLimit: 300,
    promotionCredits: 12,
    visibilityWeight: 1.6,
    features: [
      '300+ active listings',
      'Business storefront',
      'Advanced analytics',
      'Priority support',
      '12 featured credits / month',
    ],
  },
];

export const promotionOptions: PromotionOption[] = [
  {
    id: 'featured',
    name: 'Featured',
    description: 'Stand out with a premium Featured badge and stronger placement.',
    durationDays: 7,
    price: 19.9,
  },
  {
    id: 'top_search',
    name: 'Top of Search',
    description: 'Move higher in relevant search results for more discovery.',
    durationDays: 3,
    price: 14.9,
  },
  {
    id: 'urgent',
    name: 'Urgent',
    description: 'Add an Urgent badge to attract buyers who are ready to act.',
    durationDays: 7,
    price: 9.9,
  },
  {
    id: 'homepage',
    name: 'Homepage Featured',
    description: 'Eligible for premium placement on the Marketlift homepage.',
    durationDays: 3,
    price: 29.9,
  },
];

const payments: Payment[] = [];
let activePlan = { planId: 'pro', cycle: 'monthly' as BillingCycle };

export const paymentService = {
  async getPlans() {
    await delay();
    return sellerPlans;
  },

  async getSubscription() {
    await delay(180);
    return activePlan;
  },

  async createPayment(input: {
    purpose: 'subscription' | 'promotion';
    amount: number;
    method: PaymentMethod;
  }) {
    await delay(500);
    const payment: Payment = {
      id: `pay-${Date.now()}`,
      purpose: input.purpose,
      amount: input.amount,
      method: input.method,
      status: 'pending',
      createdAt: new Date().toISOString(),
      reference: `ML-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
    };
    payments.unshift(payment);
    return payment;
  },

  async confirmPayment(id: string) {
    await delay(850);
    const payment = payments.find((item) => item.id === id);
    if (!payment) throw new Error('Payment not found');
    payment.status = 'paid';
    return payment;
  },

  async activatePlan(planId: string, cycle: BillingCycle) {
    await delay(220);
    activePlan = { planId, cycle };
    return activePlan;
  },

  async getPayments() {
    await delay();
    return [...payments];
  },

  async getPromotions() {
    await delay(180);
    return promotionOptions;
  },
};
