# Shiftly Admin

A React, TypeScript, and Vite dashboard for administering the Shiftly platform. It supports English and Arabic, including RTL layouts.

## Features

- Platform statistics, users, workspaces, and audit logs.
- Service status, maintenance notices, and announcements.
- API activity, application sessions, and error monitoring.
- Application update notices and alternate icon management.

## Requirements

- Node.js 24 and npm.
- A running Shiftly backend and the same Supabase project used by the app.
- A Supabase account authorized through the backend's `PLATFORM_ADMIN_IDS` setting.

## Setup

Copy `.env.example` to `.env.local` and configure:

- `VITE_API_BASE_URL`: the backend URL ending in `/api/v1`.
- `VITE_SUPABASE_URL`: your Supabase project URL.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: the public client key.

```sh
npm ci
npm run dev
```

Open `http://localhost:5173` and sign in with an authorized account. Add the dashboard origin to the backend's `CORS_ORIGINS`. There are no default login credentials.

## Build and check

```sh
npm test
npm run build
npm run preview
```

Production files are generated in `dist/`. Set the same public environment variables in your hosting provider before building. `VITE_` variables are visible in the browser; never use server credentials or service-role keys.

## Project structure

- `src/app/`: application composition and layout.
- `src/features/`: feature modules.
- `src/core/`: shared authentication, HTTP, localization, and UI.

The companion projects are **ShiftlyApp** (Flutter client) and **ShiftlyBackend** (NestJS API). New launcher icons uploaded here must be bundled into a mobile release before devices can switch to them.
