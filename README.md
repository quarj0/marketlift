# Marketlift Marketplace Frontend

Consumer marketplace frontend for Marketlift, built with Next.js, TypeScript, Tailwind CSS, TanStack Query, React Hook Form and Zod.

## Current product model

- One Marketlift customer account. There are no separate buyer and seller logins.
- Any registered user can enable selling on the same account.
- Public seller profiles remain available at `/seller/[sellerId]`.
- Private selling tools live under `/selling`.
- Ordinary listings publish immediately after automated validation.
- `under_review` is exceptional and reserved for risk signals, reports or future category rules.
- Seller identity verification is optional by default and never exposes CPF publicly.
- Buyers and sellers arrange product payment and delivery independently in V1.
- Mercado Pago-ready checkout is only for Marketlift subscriptions, boosts, promotions and service fees.
- The internal administration product is intentionally excluded from this repository and will be developed/deployed separately (for example `dash.marketlift.br`).

## Demo authentication

- `marketlift@demo.marketlift` — registered account with selling already enabled.
- `new@demo.marketlift` — registered account without selling enabled, useful for testing the Start Selling flow.
- Any password with at least 6 characters works in the mock frontend.
- OTP demo code: `123456`.

## Development

```bash
pnpm install
pnpm dev
```

Production check:

```bash
pnpm build
```
