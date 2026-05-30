# PathPayX Deployment Prep

PathPayX is now prepared for a Vercel + Postgres deployment.

## Recommended Stack

- Vercel for the Next.js app
- Neon Postgres or Prisma Postgres for the production database
- Resend for transactional emails
- Your custom domain connected in Vercel

## Required Vercel Environment Variables

Add these in your Vercel project under **Settings > Environment Variables**:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
SESSION_SECRET="replace-with-a-long-random-secret"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

RESEND_API_KEY="re_your_resend_key"
EMAIL_FROM="PathPayX <noreply@yourdomain.com>"

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_REDIRECT_URI="https://yourdomain.com/api/auth/google/callback"

EXCHANGE_RATE_API_KEY=""
CRON_SECRET="replace-with-a-long-random-secret"

SMILE_PARTNER_ID=""
SMILE_WEB_TOKEN_URL=""
SMILE_PRODUCT=""
SMILE_WEBHOOK_SECRET=""
```

Use the same Postgres URL for `DATABASE_URL` and `DIRECT_URL` unless your database provider gives you separate pooled and direct URLs.

## Database Setup

After adding `DATABASE_URL` locally or in Vercel, run:

```bash
npm run db:push
```

For a stricter production migration workflow later, replace `db:push` with Prisma migrations and run:

```bash
npm run db:deploy
```

## Vercel Settings

Vercel should use:

```bash
npm install
npm run build
```

The build script already runs `prisma generate` before `next build`.

## Domain Setup

1. Add your domain in Vercel.
2. Set `NEXT_PUBLIC_APP_URL` to your domain, for example:

```bash
NEXT_PUBLIC_APP_URL="https://pathpayx.com"
```

3. Update Google OAuth redirect URI:

```txt
https://pathpayx.com/api/auth/google/callback
```

4. Update Resend sender after verifying your domain:

```bash
EMAIL_FROM="PathPayX <noreply@pathpayx.com>"
```

## Cron

The payment release cron is configured in `vercel.json`:

```txt
/api/cron/release-payments
```

Set `CRON_SECRET` in Vercel so the endpoint can protect automated payment release.

## Before Deploying

Run these after setting a Postgres `DATABASE_URL`:

```bash
npm run lint
npx tsc --noEmit --incremental false
npm run build
```
