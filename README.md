PathPayX is a Next.js freelancer finance dashboard with wallet tracking,
invoices, transactions, analytics, profile settings, password login, cookie
sessions, and Google OAuth wiring.

## Getting Started

First, run the development server:

```bash
npm install
npx prisma db push
npx prisma generate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Copy `.env.example` to `.env` and fill in your secrets before using Google
OAuth.

## Checks

```bash
npm run lint
npx tsc --noEmit --incremental false
npm run build
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md).
