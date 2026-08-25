import { graphqlRequest } from '@/lib/api-client';
import {
  mapPayment,
  mapPlan,
  mapPromotion,
  type ApiPayment,
  type ApiPromotion,
  type ApiSellerPlan,
} from '@/lib/api-mappers';
import type { BillingCycle, PaymentMethod } from '@/types';

const PAYMENT_FIELDS = `
  id reference sellerId sellerName purpose method status amount currency provider
  providerOrderId providerStatus providerStatusDetail checkoutData planId billingCycle
  listingId promotionId createdAt paidAt failedAt refundedAt
`;

const PLAN_FIELDS = `
  id name countryCode currency monthlyPrice yearlyPrice listingLimit promotionCredits features
  visibilityWeight recommended active sortOrder
`;

export const paymentService = {
  async getPlans(countryCode?: string) {
    const data = await graphqlRequest<{ sellerPlans: ApiSellerPlan[] }>(`
      query SellerPlans($countryCode: String) { sellerPlans(countryCode: $countryCode) { ${PLAN_FIELDS} } }
    `, { countryCode: countryCode || null });
    return (data.sellerPlans || []).map(mapPlan);
  },

  async getSubscription() {
    const data = await graphqlRequest<{
      mySubscription: { billingCycle?: BillingCycle; plan?: ApiSellerPlan | null } | null;
      mySellerPlan: ApiSellerPlan | null;
    }>(`
      query MySubscription {
        mySubscription { id billingCycle status plan { ${PLAN_FIELDS} } }
        mySellerPlan { ${PLAN_FIELDS} }
      }
    `);
    const plan = data.mySubscription?.plan || data.mySellerPlan;
    if (!plan) return null;
    return {
      planId: plan.id as string,
      cycle: (data.mySubscription?.billingCycle || 'monthly') as BillingCycle,
    };
  },

  async createSubscriptionPayment(input: {
    planId: string;
    billingCycle: BillingCycle;
    method: PaymentMethod;
  }) {
    const data = await graphqlRequest<{ createSubscriptionPayment: ApiPayment }>(`
      mutation CreateSubscriptionPayment(
        $planId: String!
        $billingCycle: String!
        $method: String!
        $idempotencyKey: String!
      ) {
        createSubscriptionPayment(
          planId: $planId
          billingCycle: $billingCycle
          method: $method
          idempotencyKey: $idempotencyKey
        ) { ${PAYMENT_FIELDS} }
      }
    `, { ...input, idempotencyKey: crypto.randomUUID() });
    return mapPayment(data.createSubscriptionPayment);
  },

  async createPromotionPayment(input: {
    listingId: string;
    promotionId: string;
    method: PaymentMethod;
  }) {
    const data = await graphqlRequest<{ createPromotionPayment: ApiPayment }>(`
      mutation CreatePromotionPayment(
        $listingId: ID!
        $promotionId: String!
        $method: String!
        $idempotencyKey: String!
      ) {
        createPromotionPayment(
          listingId: $listingId
          promotionId: $promotionId
          method: $method
          idempotencyKey: $idempotencyKey
        ) { ${PAYMENT_FIELDS} }
      }
    `, { ...input, idempotencyKey: crypto.randomUUID() });
    return mapPayment(data.createPromotionPayment);
  },

  async refreshPayment(id: string) {
    const data = await graphqlRequest<{ refreshPayment: ApiPayment }>(`
      mutation RefreshPayment($id: ID!) {
        refreshPayment(id: $id) { ${PAYMENT_FIELDS} }
      }
    `, { id });
    return mapPayment(data.refreshPayment);
  },

  async getPayments() {
    const data = await graphqlRequest<{ myPayments: ApiPayment[] }>(`
      query MyPayments { myPayments(limit: 100) { ${PAYMENT_FIELDS} } }
    `);
    return (data.myPayments || []).map(mapPayment);
  },

  async getPromotions(countryCode?: string) {
    const data = await graphqlRequest<{ promotionOptions: ApiPromotion[] }>(`
      query PromotionOptions($countryCode: String) {
        promotionOptions(countryCode: $countryCode) { id name description durationDays price countryCode currency }
      }
    `, { countryCode: countryCode || null });
    return (data.promotionOptions || []).map(mapPromotion);
  },
};
