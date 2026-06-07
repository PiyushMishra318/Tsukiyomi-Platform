# Author's Note

> This was a project we (me and [papermechanics](https://github.com/papermechanics)) made for college. 
> The name [Tsukiyomi](https://en.wikipedia.org/wiki/Tsukuyomi_(disambiguation)) is a dumb reference to a [Naruto](https://en.wikipedia.org/wiki/Naruto). I still think its kinda cool.
> Anyway I plan to make this fully local i.e the catalogue part would allow you to search the games sure but supplying the game files won't be done by the app. You will be able to get recommendations using the same recommendation engine we were using that was the core of the project the TOP-N ranker.
> Some UI changes to make it look more uptodate. At the point of creation we were heavily inspired by Spotify's UI.
> At the point of creation the legality of this thing was dubious at best. So here's a [Disclaimer](./DISCLAIMER.Md) (This is AI generted cz I ain't a lawyer)
> All contributions or suggestion for this project are welcomed and appreciated.
> CIAO.

# Tsukiyomi

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Monorepo for **Tsukiyomi** — a Flutter Android client and NestJS API for browsing GBA ROM metadata, favorites, and emulator launch.

MIT © 2026 [Piyush Mishra](https://github.com/PiyushMishra318)

## Repository structure

```text
Tsukiyomi-Platform/
├── apps/
│   ├── mobile/          # Flutter Android app
│   └── server/          # NestJS API (SQLite via libSQL)
├── .github/workflows/   # CI (server tests, Flutter analyze/test, APK build)
├── vercel.json          # Serverless API deployment
└── README.md
```

## Auth approach

Firebase Phone OTP has been replaced with **local JWT auth**:

| Endpoint | Body | Response |
|----------|------|----------|
| `POST /api/auth/register` | `{ phone, password }` | `{ accessToken, user }` |
| `POST /api/auth/login` | `{ phone, password }` | `{ accessToken, user }` |

- Passwords are hashed with **bcrypt** on the server.
- The mobile app stores the JWT in **flutter_secure_storage** (Android Keystore-backed).
- Legacy user routes (`/api/user/*`) remain for favorites, history, and recommendations.

## Database

- **Local dev:** SQLite file at `apps/server/data/tsukiyomi.db` via `@libsql/client` (`DATABASE_URL=file:./data/tsukiyomi.db`).
- **Vercel (production):** Use [Turso](https://turso.tech) (libSQL) — Vercel's ephemeral filesystem cannot persist SQLite files between invocations.

Set these env vars on Vercel:

```env
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token
JWT_SECRET=long-random-secret
PUBLIC_API_URL=https://your-project.vercel.app
```

Games and genres are auto-seeded from `GBA_Roms_Names.json` / `GBA_Roms_Genres.json` on first startup.

## Quick start (local)

### Server

```bash
cd apps/server
cp .env.example .env
npm install
npm run start:dev
```

API: `http://localhost:3000/api`

### Mobile

```bash
cd apps/mobile
flutter pub get
flutter run --dart-define=TSUKIYOMI_API_URL=http://10.0.2.2:3000
```

Use your machine's LAN IP instead of `10.0.2.2` for a physical device.

### Release APK

```bash
cd apps/mobile
flutter build apk --release \
  --dart-define=TSUKIYOMI_API_URL=https://YOUR_VERCEL_URL.vercel.app
```

Output: `apps/mobile/build/app/outputs/flutter-apk/app-release.apk`

## Vercel deployment

```bash
npm i -g vercel
vercel link
vercel env add TURSO_DATABASE_URL
vercel env add TURSO_AUTH_TOKEN
vercel env add JWT_SECRET
vercel env add PUBLIC_API_URL
vercel --prod
```

**Hybrid note:** Static ROM/image assets (`Images/`, `ROMs/`) are not ideal for Vercel serverless. Thumbnails in seed data use `PUBLIC_API_URL`; for full asset hosting, serve `Images/` from object storage or keep a small always-on host for binaries while the API runs on Vercel.

## CI

GitHub Actions workflow (`.github/workflows/ci.yml`):

- `npm test` + `npm run build` for the server
- `flutter analyze` + `flutter test` for mobile
- Optional release APK artifact on tagged releases

## Scripts

| Command | Description |
|---------|-------------|
| `npm run server:dev` | Start API in watch mode |
| `npm run server:seed` | Manually seed SQLite |
| `flutter analyze` | Lint mobile app |
| `flutter test` | Run mobile tests |
| `flutter build apk` | Build Android APK |

## License

MIT © 2026 Piyush Mishra
