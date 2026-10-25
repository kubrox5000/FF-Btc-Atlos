# DiamondBoost — Brief

Premium Free Fire diamond top-up storefront. Customers pick a diamond package, enter Player UID/server, pay via USDT (TRC20/BEP20), upload proof, and track orders. Admins manage orders, packages, and stats.

## Stack (inherited from template)
Next.js 16 App Router · React 19 · TypeScript · Tailwind 4 · Drizzle ORM + PostgreSQL · Web Crypto JWT/PBKDF2. Deploys to Cloudflare Workers.

## Core flows (delivered)
1. Home — hero, features, packages grid, why-us, reviews, FAQ, footer, floating support buttons, announcement banner.
2. Top-up — select package, enter UID/nickname/server, coupon, choose USDT network → creates order.
3. Payment — wallet address + QR + amount + countdown + TX id + proof upload → moves order to review.
4. Track — by order number or UID, shows status timeline.
5. Admin — login (admin/admin123), dashboard stats + charts, order management (approve/reject/status/notes/CSV), package CRUD.

## Data
packages, orders, payments(embedded in orders), reviews, coupons, admins, settings(single row).

## Out of scope (this pass)
Full customer accounts/invoices, referral/affiliate/loyalty, live Binance Pay API, real email sending, multi-language i18n (English shipped; RTL-ready structure).
