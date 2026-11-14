# Shiftly Admin

A React, TypeScript, and Vite dashboard for administering the Shiftly platform. It supports English and Arabic, including RTL layouts.

## Features

- Platform statistics, users, workspaces, and audit logs.
- Service status, maintenance notices, and announcements.
- API activity, application sessions, and error monitoring.
- Application update notices and alternate icon management.
- Delegated administrator roles, operational alerts, and private support reports.

## Requirements

- Node.js 24 and npm.
- A running Shiftly backend and the same Supabase project used by the app.
- An owner account listed in `PLATFORM_ADMIN_IDS`, or an existing Shiftly account granted dashboard access by an owner.

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
npm run typecheck
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

## Working in the dashboard

`src/app/ServicesProvider.tsx` supplies the repository used by feature hooks. Domain models define API contracts, application hooks manage requests and state, and presentation components render the result. Shared request cancellation and error handling live in `src/core/data/`.

| Location | Responsibility |
| --- | --- |
| `src/app/navigation.ts`, `src/app/pages.ts` | Dashboard sections and page loading |
| `src/core/domain/admin-repository.ts` | Backend interface consumed by hooks |
| `src/core/data/admin-api-repository.ts` | HTTP implementation |
| `src/core/i18n/messages/en.ts` | English messages and message key type |
| `src/core/i18n/messages/ar.ts` | Arabic messages checked against the English keys |
| `src/features/<feature>/` | Domain models, application hooks and presentation |
| `src/shared/` | Reusable UI, styles and resource hooks |

Start changes in the owning feature. Keep API calls in the repository, reuse the existing loading/error states, and add both language entries when introducing text. Run `npm test` and `npm run build` before publishing.

## Administrator workflows

Owners manage existing accounts from **Administrator access**. Start with a support, monitoring or settings preset, then adjust individual permissions. Permanent deletion and platform settings changes are granted separately. The sidebar and actions follow the account permissions, and the API enforces the same rules.

**Operational alerts** shows error spikes, slow server acknowledgements for message sends, and old pending push notifications. The bell is visible across dashboard pages. Browser notifications work with permission while the dashboard is open; background evaluation uses the backend processing worker. Open an alert to inspect affected requests or users.

**Support reports** receives reports submitted from the app. Authorized staff assign a responsible administrator, update the status and reply. Report images are private and loaded through authenticated API requests. Apply the companion backend migration before deploying these screens.
