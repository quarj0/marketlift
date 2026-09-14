import { graphqlRequest } from "@/lib/api-client";

export type CommerceMode = "disabled" | "optional" | "enabled";
export type FulfillmentMethod = "shipping" | "local_delivery" | "pickup";
export type CommercePaymentMethod = "pix" | "card";

export type ListingCommerce = {
  mode: CommerceMode;
  checkoutEnabled: boolean;
  inspectionAllowed: boolean;
  stockQuantity: number;
  fulfillmentMethods: FulfillmentMethod[];
  reasons: string[];
  requiresVerifiedSeller: boolean;
  maxCheckoutValueCents?: number | null;
  packageWeightGrams?: number | null;
  packageLengthCm?: number | null;
  packageWidthCm?: number | null;
  packageHeightCm?: number | null;
};

export type CheckoutQuote = {
  listingId: string;
  fulfillmentMethod: FulfillmentMethod;
  quantity: number;
  subtotalCents: number;
  shippingAmountCents: number;
  totalCents: number;
  currency: string;
};

export type CategoryCommercePolicy = {
  categoryId: string;
  mode: CommerceMode;
  requiresVerifiedSeller: boolean;
  maxCheckoutValueCents?: number | null;
  shippingAllowed: boolean;
  localDeliveryAllowed: boolean;
  pickupAllowed: boolean;
};

export type SellerPaymentAccount = {
  provider: string;
  recipientId?: string | null;
  status: "not_started" | "pending" | "active" | "restricted" | "rejected";
  payoutMethod?: string | null;
  payoutDestinationMasked?: string | null;
  payoutsEnabled: boolean;
  kycUrl?: string | null;
};

export type SellerWallet = {
  pendingCents: number;
  availableCents: number;
  payoutRequestedCents: number;
  paidOutCents: number;
  currency: string;
};

export type CommerceOrder = {
  id: string;
  reference: string;
  buyerId: string;
  sellerId: string;
  listingId: string;
  status: string;
  fulfillmentMethod: FulfillmentMethod;
  quantity: number;
  unitPriceCents: number;
  subtotalCents: number;
  shippingAmountCents: number;
  marketplaceFeeCents: number;
  sellerProceedsCents: number;
  totalCents: number;
  currency: string;
  shippingAddress: Record<string, unknown>;
  listingSnapshot: Record<string, unknown>;
  payment?: {
    id: string;
    method: CommercePaymentMethod;
    status: string;
    amountCents: number;
    provider: string;
    providerStatus?: string | null;
    checkoutData: Record<string, string>;
    paidAt?: string | null;
  } | null;
  shipment?: {
    status: string;
    carrier?: string | null;
    trackingCode?: string | null;
    deliveredAt?: string | null;
  } | null;
  settlement?: {
    status: string;
    amountCents: number;
    releaseAfter?: string | null;
    payoutRequestedAt?: string | null;
    paidAt?: string | null;
  } | null;
  createdAt: string;
  paidAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  completedAt?: string | null;
};

const ORDER_FIELDS = `
  id reference buyerId sellerId listingId status fulfillmentMethod quantity
  unitPriceCents subtotalCents shippingAmountCents marketplaceFeeCents sellerProceedsCents totalCents currency
  shippingAddress listingSnapshot createdAt paidAt shippedAt deliveredAt completedAt
  payment { id method status amountCents provider providerStatus checkoutData paidAt }
  shipment { status carrier trackingCode deliveredAt }
  settlement { status amountCents releaseAfter payoutRequestedAt paidAt }
`;

export const commerceService = {
  async getListingCommerce(listingId: string) {
    const data = await graphqlRequest<{ listingCommerce: ListingCommerce }>(`
      query ListingCommerce($listingId: String!) {
        listingCommerce(listingId: $listingId) {
          mode checkoutEnabled inspectionAllowed stockQuantity fulfillmentMethods reasons
          requiresVerifiedSeller maxCheckoutValueCents
          packageWeightGrams packageLengthCm packageWidthCm packageHeightCm
        }
      }
    `, { listingId });
    return data.listingCommerce;
  },

  async getCheckoutQuote(listingId: string, fulfillmentMethod: FulfillmentMethod, quantity = 1) {
    const data = await graphqlRequest<{ commerceCheckoutQuote: CheckoutQuote }>(`
      query CommerceCheckoutQuote($listingId:String!,$fulfillmentMethod:String!,$quantity:Int!){
        commerceCheckoutQuote(listingId:$listingId,fulfillmentMethod:$fulfillmentMethod,quantity:$quantity){
          listingId fulfillmentMethod quantity subtotalCents shippingAmountCents totalCents currency
        }
      }
    `, { listingId, fulfillmentMethod, quantity });
    return data.commerceCheckoutQuote;
  },

  async getCategoryPolicy(categoryId: string) {
    const data = await graphqlRequest<{ categoryCommercePolicy: CategoryCommercePolicy }>(`
      query CategoryCommercePolicy($categoryId: String!) {
        categoryCommercePolicy(categoryId: $categoryId) {
          categoryId mode requiresVerifiedSeller maxCheckoutValueCents
          shippingAllowed localDeliveryAllowed pickupAllowed
        }
      }
    `, { categoryId });
    return data.categoryCommercePolicy;
  },

  async createCheckout(input: {
    listingId: string;
    fulfillmentMethod: FulfillmentMethod;
    paymentMethod: CommercePaymentMethod;
    customerDocument: string;
    customerPhone: string;
    idempotencyKey: string;
    quantity?: number;
    shippingAddress?: Record<string, unknown>;
    cardId?: string;
  }) {
    const data = await graphqlRequest<{ createCommerceCheckout: { order: CommerceOrder } }>(`
      mutation CreateCommerceCheckout(
        $listingId: ID!
        $fulfillmentMethod: String!
        $paymentMethod: String!
        $customerDocument: String!
        $customerPhone: String!
        $idempotencyKey: String!
        $quantity: Int!
        $shippingAddress: JSON
        $cardId: String
      ) {
        createCommerceCheckout(
          listingId: $listingId
          fulfillmentMethod: $fulfillmentMethod
          paymentMethod: $paymentMethod
          customerDocument: $customerDocument
          customerPhone: $customerPhone
          idempotencyKey: $idempotencyKey
          quantity: $quantity
          shippingAddress: $shippingAddress
          cardId: $cardId
        ) { order { ${ORDER_FIELDS} } }
      }
    `, { ...input, quantity: input.quantity ?? 1 });
    return data.createCommerceCheckout.order;
  },

  async vaultCard(cardToken: string, customerDocument: string, customerPhone: string) {
    const data = await graphqlRequest<{ vaultCommerceCard: string }>(`
      mutation VaultCommerceCard($cardToken: String!, $customerDocument: String!, $customerPhone: String!) {
        vaultCommerceCard(cardToken: $cardToken, customerDocument: $customerDocument, customerPhone: $customerPhone)
      }
    `, { cardToken, customerDocument, customerPhone });
    return data.vaultCommerceCard;
  },

  async tokenizeCard(card: {
    number: string;
    holderName: string;
    expMonth: number;
    expYear: number;
    cvv: string;
  }) {
    const publicKey = process.env.NEXT_PUBLIC_PAGARME_PUBLIC_KEY?.trim();
    if (!publicKey) throw new Error("Pagar.me public key is not configured.");
    const response = await fetch(`https://api.pagar.me/core/v5/tokens?appId=${encodeURIComponent(publicKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "card",
        card: {
          number: card.number.replace(/\D/g, ""),
          holder_name: card.holderName,
          exp_month: card.expMonth,
          exp_year: card.expYear,
          cvv: card.cvv,
        },
      }),
    });
    const body = await response.json() as { id?: string; message?: string; errors?: unknown };
    if (!response.ok || !body.id) throw new Error(body.message || "Unable to tokenize this card.");
    return body.id;
  },

  async getMyOrders(offset = 0, limit = 100) {
    const data = await graphqlRequest<{ myOrders: CommerceOrder[] }>(`
      query MyOrders($offset:Int!,$limit:Int!) { myOrders(offset:$offset,limit:$limit) { ${ORDER_FIELDS} } }
    `, { offset, limit });
    return data.myOrders || [];
  },

  async confirmReceived(orderId: string) {
    const data = await graphqlRequest<{ confirmCommerceOrderReceived: CommerceOrder }>(`
      mutation ConfirmCommerceOrderReceived($orderId: ID!) {
        confirmCommerceOrderReceived(orderId: $orderId) { ${ORDER_FIELDS} }
      }
    `, { orderId });
    return data.confirmCommerceOrderReceived;
  },

  async openDispute(orderId: string, reason: string, description: string) {
    return graphqlRequest(`
      mutation OpenCommerceDispute($orderId: ID!, $reason: String!, $description: String!) {
        openCommerceDispute(orderId: $orderId, reason: $reason, description: $description) { id status }
      }
    `, { orderId, reason, description });
  },

  async getSellerPaymentAccount() {
    const data = await graphqlRequest<{ mySellerPaymentAccount: SellerPaymentAccount | null }>(`
      query SellerPaymentAccount {
        mySellerPaymentAccount { provider recipientId status payoutMethod payoutDestinationMasked payoutsEnabled kycUrl }
      }
    `);
    return data.mySellerPaymentAccount;
  },

  async getSellerWallet() {
    const data = await graphqlRequest<{ mySellerWallet: SellerWallet }>(`
      query SellerWallet { mySellerWallet { pendingCents availableCents payoutRequestedCents paidOutCents currency } }
    `);
    return data.mySellerWallet;
  },

  async getSellerOrders(offset = 0, limit = 50) {
    const data = await graphqlRequest<{ mySellerOrders: CommerceOrder[] }>(`
      query SellerOrders($offset:Int!,$limit:Int!) { mySellerOrders(offset:$offset,limit:$limit) { ${ORDER_FIELDS} } }
    `, { offset, limit });
    return data.mySellerOrders || [];
  },

  async activateSellerPayments(recipient: Record<string, unknown>) {
    const data = await graphqlRequest<{ activateSellerPayments: SellerPaymentAccount }>(`
      mutation ActivateSellerPayments($recipient: JSON!, $payoutMethod: String!) {
        activateSellerPayments(recipient: $recipient, payoutMethod: $payoutMethod) {
          provider recipientId status payoutMethod payoutDestinationMasked payoutsEnabled kycUrl
        }
      }
    `, { recipient, payoutMethod: "bank_account" });
    return data.activateSellerPayments;
  },

  async withdrawSellerBalance() {
    const data = await graphqlRequest<{ withdrawSellerBalance: { transferId: string; amountCents: number; status: string } }>(`
      mutation WithdrawSellerBalance { withdrawSellerBalance { transferId amountCents status } }
    `);
    return data.withdrawSellerBalance;
  },

  async configureListing(input: {
    listingId: string;
    checkoutEnabled: boolean;
    stockQuantity: number;
    shippingEnabled: boolean;
    localDeliveryEnabled: boolean;
    pickupEnabled: boolean;
    packageWeightGrams?: number;
    packageLengthCm?: number;
    packageWidthCm?: number;
    packageHeightCm?: number;
  }) {
    const data = await graphqlRequest<{ configureListingCommerce: boolean }>(`
      mutation ConfigureListingCommerce(
        $listingId: ID!, $checkoutEnabled: Boolean!, $stockQuantity: Int!,
        $shippingEnabled: Boolean!, $localDeliveryEnabled: Boolean!, $pickupEnabled: Boolean!,
        $packageWeightGrams: Int, $packageLengthCm: Int, $packageWidthCm: Int, $packageHeightCm: Int
      ) {
        configureListingCommerce(
          listingId: $listingId checkoutEnabled: $checkoutEnabled stockQuantity: $stockQuantity
          shippingEnabled: $shippingEnabled localDeliveryEnabled: $localDeliveryEnabled pickupEnabled: $pickupEnabled
          packageWeightGrams: $packageWeightGrams packageLengthCm: $packageLengthCm packageWidthCm: $packageWidthCm packageHeightCm: $packageHeightCm
        )
      }
    `, input);
    return data.configureListingCommerce;
  },

  async markOrderProcessing(orderId: string) {
    const data = await graphqlRequest<{ markCommerceOrderProcessing: CommerceOrder }>(`
      mutation MarkCommerceOrderProcessing($orderId: ID!) {
        markCommerceOrderProcessing(orderId: $orderId) { ${ORDER_FIELDS} }
      }
    `, { orderId });
    return data.markCommerceOrderProcessing;
  },

  async markOrderShipped(orderId: string, carrier: string, trackingCode: string) {
    const data = await graphqlRequest<{ markCommerceOrderShipped: CommerceOrder }>(`
      mutation MarkCommerceOrderShipped($orderId: ID!, $carrier: String!, $trackingCode: String!) {
        markCommerceOrderShipped(orderId: $orderId, carrier: $carrier, trackingCode: $trackingCode) { ${ORDER_FIELDS} }
      }
    `, { orderId, carrier, trackingCode });
    return data.markCommerceOrderShipped;
  },
};