# Marketlift Marketplace Frontend

Consumer marketplace frontend for Marketlift, built with Next.js, TypeScript, Tailwind CSS, TanStack Query, React Hook Form and Zod.

## Current product model

- One Marketlift customer account. There are no separate buyer and seller logins.
- Any registered user can enable selling on the same account.
- Public seller profiles remain available at `/seller/[sellerId]`.
- Private selling tools live under `/selling`.
- Ordinary listings publish immediately after automated validation.
- `under_review` is exceptional and reserved for risk signals, reports or future category rules.
- CPF/provider-backed seller identity verification is marked **Upcoming** and disabled for the initial release.
- Buyers and sellers arrange product payment and delivery independently in V1.
- Marketlift subscriptions, checkout, boosts, promotions and all other service payments are marked **Upcoming** until the payment provider is integrated and certified.
- The internal administration product is deployed separately at `admin.marketlift.com.br`.

## Development

```bash
pnpm install
pnpm dev
```

Production check:

```bash
pnpm build
```

## Production configuration

Copy `.env.production.example` into the deployment provider and keep both
release flags set to `false`. The production defaults target
`https://marketlift.com.br` and `https://api.marketlift.com.br`; explicitly set
the values in the deployment environment so configuration remains auditable.
