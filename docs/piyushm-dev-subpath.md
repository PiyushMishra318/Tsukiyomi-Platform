# Hosting Tsukiyomi on piyushm.dev (`/products/tsukiyomi`)

Serve the Tsukiyomi Vercel deployment at **https://piyushm.dev/products/tsukiyomi/** while keeping the browser on `piyushm.dev` (no redirect to `*.vercel.app`).

This repo’s landing page uses **relative** asset URLs (`styles.css`, `theme.js`) so they resolve correctly on both:

- `https://tsukiyomi-platform.vercel.app/` (root deploy)
- `https://piyushm.dev/products/tsukiyomi/` (subpath via portfolio rewrites)

A trailing slash on the subpath is required so relative URLs resolve under `/products/tsukiyomi/` (not `/products/`).

## 1. Portfolio Vercel project (`piyushm.dev`)

Add or merge the following into the **portfolio** project’s `vercel.json` (not this repo’s `vercel.json`):

```json
{
  "rewrites": [
    {
      "source": "/products/tsukiyomi",
      "destination": "https://tsukiyomi-platform.vercel.app/"
    },
    {
      "source": "/products/tsukiyomi/",
      "destination": "https://tsukiyomi-platform.vercel.app/"
    },
    {
      "source": "/products/tsukiyomi/:path*",
      "destination": "https://tsukiyomi-platform.vercel.app/:path*"
    }
  ],
  "redirects": [
    {
      "source": "/products/tsukiyomi",
      "destination": "/products/tsukiyomi/",
      "permanent": true
    }
  ]
}
```

Deploy the portfolio project after saving.

The portfolio site lives in **`my-profile/portfolio`** (sibling of this repo under `Documents/GitHub/`). That repo’s `vercel.json` should include the `rewrites` and `redirects` above merged with any existing portfolio routes.

## 2. Tsukiyomi Vercel project (this repo)

No subpath-specific routes are required here; the app is deployed at the root of `tsukiyomi-platform.vercel.app`. The portfolio proxy forwards paths unchanged (e.g. `/api` → upstream `/api`).

## 3. API base URL (`PUBLIC_API_URL`)

When the site is accessed via the subpath, API calls from the **mobile app** (or any client using `PUBLIC_API_URL`) should use the public URL that matches where users reach the API:

| Deployment | `PUBLIC_API_URL` (production) |
|------------|-------------------------------|
| Direct Vercel | `https://tsukiyomi-platform.vercel.app` |
| Via piyushm.dev subpath | `https://piyushm.dev/products/tsukiyomi` |

With the portfolio rewrites above, routes on the Tsukiyomi deployment map as:

| Tsukiyomi (upstream) | Public URL on piyushm.dev |
|----------------------|---------------------------|
| `/api/*` | `https://piyushm.dev/products/tsukiyomi/api/*` |
| `/Images/*` | `https://piyushm.dev/products/tsukiyomi/Images/*` |
| `/`, static assets | `https://piyushm.dev/products/tsukiyomi/`, `.../styles.css`, etc. |

Update in the Vercel dashboard or CLI:

```bash
npx vercel env add PUBLIC_API_URL production
# Enter: https://piyushm.dev/products/tsukiyomi
```

Then redeploy this project (`npx vercel --prod`).

**Alternative:** Keep `PUBLIC_API_URL` pointed at `https://tsukiyomi-platform.vercel.app` if you only use the subpath for the marketing landing page and want the app to talk to the Vercel hostname directly.

## 4. Verify

1. `https://piyushm.dev/products/tsukiyomi` → 301/308 to `.../products/tsukiyomi/`
2. Landing page loads with styles and theme toggle.
3. `https://piyushm.dev/products/tsukiyomi/api/health` (or another known route) returns the API response.
4. `https://tsukiyomi-platform.vercel.app/` still works with the same relative assets.
