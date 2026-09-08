# Marketlift Marketplace Frontend

Consumer marketplace frontend for Marketlift, built with Next.js, TypeScript, Tailwind CSS, TanStack Query, React Hook Form and Zod.

## Product model

- One customer account; the same user can enable selling.
- Public seller profiles plus private `/selling` tools.
- Listings/search/location are market-aware and support administrator-enabled countries.
- Seller plans, promotions, identity labels and payment methods come from backend market configuration.
- Buyers and sellers arrange the item transaction independently; Marketlift only processes seller plan/promotion charges.
- Provider capability is discovered at runtime from `/api/v1/market/`; there are no frontend payment/verification release flags.

## Development

```bash
pnpm install
pnpm dev
pnpm lint
pnpm build
```

## Deployment configuration

Copy `.env.example` into your deployment settings and replace the local URLs. `NEXT_PUBLIC_MARKETLIFT_MEDIA_ORIGIN` is only needed when public listing images are served from a separate CDN/storage origin.

Country enable/disable/default changes do not require rebuilding this frontend. They are controlled from the admin/backend.
