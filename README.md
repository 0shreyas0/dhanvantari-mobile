# Dhanvantari Mobile

Minimal Expo Router client for the existing `web` backend.

## Routes

- `/dashboard`
- `/products`
- `/billing`
- `/finance`
- `/settings`

## Setup

1. Install dependencies:

```bash
cd mobile
npm install
```

2. Create `.env` from `.env.example`.

3. Set:

- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` to the same Clerk project used by `web`
- `EXPO_PUBLIC_API_BASE_URL` to your running Next app

Notes:

- iOS simulator can usually use `http://localhost:3000`
- Android emulator usually needs `http://10.0.2.2:3000`
- Physical devices need your machine's LAN IP, for example `http://192.168.1.20:3000`

4. In Clerk, make sure the Native API is enabled for this app.

5. Start the web app and the mobile app in separate terminals:

```bash
cd web
npm run dev
```

```bash
cd mobile
npm start
```

## Current status

- Clerk auth is wired with `@clerk/clerk-expo`
- authenticated API requests send the Clerk session token as a Bearer token
- `Products` is fully wired to `/api/products`
- the remaining screens mirror the web routes and shell, but are intentionally minimal
