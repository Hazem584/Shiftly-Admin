# Shiftly Control architecture

The app uses feature modules and dependency boundaries. React components do not construct HTTP requests or depend on Supabase Admin credentials.

```text
src/
  App.tsx                         # Provider composition only
  app/
    Dashboard.tsx                 # Authenticated page composition
    ServicesProvider.tsx          # Injects the repository port
    layout/                       # Sidebar, Topbar and layout styles
  core/
    auth/                         # Browser Supabase authentication adapter
    domain/admin-repository.ts    # Typed application port
    data/                         # HTTP transport + API repository implementation
    i18n/                         # Typed Arabic/English messages and locale provider
  features/
    auth/
    overview/
    platform/
    users/
    workspaces/
    audit/
      domain/                     # Feature models, no React/HTTP dependencies
      application/                # Async actions, form state and query hooks
      presentation/               # Small components and feature styles
  shared/
    hooks/                        # Cancellable async resource state
    ui/                           # Modal, feedback, pagination, brand
    styles/                       # Base, shared components, responsive rules
  test/                           # Repository fixtures + provider harness
```

Not every feature needs every layer. Models are created only when they carry a domain concept. `AdminRepository` is the boundary consumed by application hooks; `admin-api-repository.ts` adapts it to the existing NestJS endpoints. Tests inject a replacement through `ServicesProvider`. `useResource` cancels stale reads, while mutations remain explicit user actions.

Each screen composes focused components. For example, the users page combines a toolbar, table, access dialog, permanent deletion dialog and cleanup queue. Settings compose a mode selector, service message form, announcement settings and a phone preview. Fetching and mutations live in `application`, not inside these components.

## Localization

All application chrome uses typed message keys. `LocaleProvider` persists the selected language, updates document `lang` and `dir`, and provides Cairo-aware date/number formatters. CSS uses logical properties for direction-sensitive layout. User-authored names, announcements and status messages remain their original content; switching the UI language does not translate saved business content.

## Permanent deletion

The UI loads an impact preview and requires the exact account email/ID. The backend recomputes the plan under database locks and rejects changed impact fingerprints. Accounts in the platform administrator allowlist and the acting account are protected on both sides.

The backend first deletes the relational graph and creates a durable cleanup job in one transaction. It then removes Supabase Storage objects and finally the Auth identity. Pending or failed cleanup remains visible and retryable. A completed result is shown only after every stage succeeds. Minimal UUID-based audit/tombstone records remain to track the operation and block old JWTs; personal profile and business content are removed.

The service-role key is required only on the backend. The frontend receives only whether deletion can be enabled. See the backend `docs/account-deletion.md` for migration, cleanup behavior and release requirements.
