import { graphqlRequest } from '@/lib/api-client';
import { mapPayment, mapPlan, mapPromotion } from '@/lib/api-mappers';
import type { BillingCycle, PaymentMethod } from '@/types';

const PAYMENT_FIELDS = `
  id reference sellerId sellerName purpose method status amount currency provider
  providerOrderId providerStatus providerStatusDetail checkoutData planId billingCycle
  listingId promotionId createdAt paidAt failedAt refundedAt
`;

const PLAN_FIELDS = `
  id name monthlyPrice yearlyPrice listingLimit promotionCredits features
  visibilityWeight recommended active sortOrder
`;

export const paymentService = {
  async getPlans() {
    const data = await graphqlRequest<{ sellerPlans: any[] }>(`
      query SellerPlans { sellerPlans { ${PLAN_FIELDS} } }
    `);
    return (data.sellerPlans || []).map(mapPlan);
  },

  async getSubscription() {
    const data = await graphqlRequest<{ mySubscription: any | null; mySellerPlan: any | null }>(`
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
    const data = await graphqlRequest<{ createSubscriptionPayment: any }>(`
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
    const data = await graphqlRequest<{ createPromotionPayment: any }>(`
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
    const data = await graphqlRequest<{ refreshPayment: any }>(`
      mutation RefreshPayment($id: ID!) {
        refreshPayment(id: $id) { ${PAYMENT_FIELDS} }
      }
    `, { id });
    return mapPayment(data.refreshPayment);
  },

  async getPayments() {
    const data = await graphqlRequest<{ myPayments: any[] }>(`
      query MyPayments { myPayments(limit: 100) { ${PAYMENT_FIELDS} } }
    `);
    return (data.myPayments || []).map(mapPayment);
  },

  async getPromotions() {
    const data = await graphqlRequest<{ promotionOptions: any[] }>(`
      query PromotionOptions {
        promotionOptions { id name description durationDays price }
      }
    `);
    return (data.promotionOptions || []).map(mapPromotion);
  },
};
