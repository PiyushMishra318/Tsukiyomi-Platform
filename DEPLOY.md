# Vercel deployment — required environment variables

Add these in the Vercel project dashboard or via CLI:

```bash
npx vercel env add TURSO_DATABASE_URL production   # libsql://your-db.turso.io
npx vercel env add TURSO_AUTH_TOKEN production     # from Turso dashboard
npx vercel env add JWT_SECRET production           # long random string
npx vercel env add PUBLIC_API_URL production       # https://tsukiyomi-platform.vercel.app
```

Create a Turso database at https://turso.tech, then copy the database URL and auth token.

After env vars are set, redeploy:

```bash
npx vercel --prod
```
