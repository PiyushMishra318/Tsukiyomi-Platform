# Vercel deployment — required environment variables

Add these in the Vercel project dashboard or via CLI:

```bash
npx vercel env add TURSO_DATABASE_URL production   # libsql://your-db.turso.io
npx vercel env add TURSO_AUTH_TOKEN production     # from Turso dashboard
npx vercel env add JWT_SECRET production           # long random string
npx vercel env add PUBLIC_API_URL production       # https://tsukiyomi-platform.vercel.app
```

Create a Turso database at https://turso.tech, then copy the database URL and auth token.

**Demo mode:** If `TURSO_DATABASE_URL` is not set, the API uses an in-memory SQLite database on Vercel (data resets between cold starts). Set Turso env vars for persistent production data.

After env vars are set, redeploy:

```bash
npx vercel --prod
```

## piyushm.dev subpath (`/products/tsukiyomi`)

To serve this deployment at **https://piyushm.dev/products/tsukiyomi/** (proxy on the portfolio Vercel project, stay on `piyushm.dev`), see **[docs/piyushm-dev-subpath.md](docs/piyushm-dev-subpath.md)** for portfolio `vercel.json` rewrites/redirects and setting `PUBLIC_API_URL` to `https://piyushm.dev/products/tsukiyomi` when the API should be reached through that subpath.
