# TaxEdge Frontend

React + TypeScript (Vite) frontend for TaxEdge, built as an advanced modular monolith. This release covers the
shared **Secure Access** sign-in for all five roles, session management, role-based routing, and the Admin and
Staff dashboards.

## Run

```bash
npm install
npm run dev        # http://localhost:5173 (VITE_DEV_SERVER_PORT)
npm test           # unit tests (Vitest)
npm run build      # typecheck + 490-line check + production build
```

Node 22.6+ is required (the line-check script uses native TypeScript stripping).

## Configuration

All runtime values come from `VITE_*` variables. See `.env.example`.

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | API base path. Keep it relative (`/api/v1`) behind a proxy so session cookies stay same-origin. |
| `VITE_API_PROXY_TARGET` | Dev server only: backend origin that Vite proxies `VITE_API_BASE_URL` to. |
| `VITE_API_TIMEOUT_MS` | Request timeout. |
| `VITE_SESSION_IDLE_TIMEOUT_MINUTES` | Client-side idle sign-out (the server session timeout still applies). |
| `VITE_APP_NAME` | Brand name shown in the UI. |
| `VITE_ENABLE_DEMO_AUTH` | Development only: use in-browser demo accounts instead of the backend. |

## Development demo accounts

The backend is not built yet, so `.env.development` sets `VITE_ENABLE_DEMO_AUTH=true` and these accounts sign in:

| Email | Password | Role | Lands on |
| --- | --- | --- | --- |
| `admin@gmail.com` | `admin123` | ADMIN | `/admin/dashboard` |
| `camanager@gmail.com` | `camanager123` | CA_MANAGER | `/staff/dashboard` |
| `caagent@gmail.com` | `caagent123` | CA_AGENT | `/staff/dashboard` |
| `loanmanager@gmail.com` | `loanmanager123` | LOAN_MANAGER | `/staff/dashboard` |
| `loanagent@gmail.com` | `loanagent123` | LOAN_AGENT | `/staff/dashboard` |

The demo gateway stores only salted SHA-256 hashes and mirrors the backend contract: invalid credentials, inactive
account, and a lockout after 5 failures. It is loaded through a dynamic import guarded by `import.meta.env.DEV`, so
`vite build` never bundles it. Its emails and hashes are absent from `dist/`.

## Validation

Every field's rules and error messages are listed in [docs/validation-rules.md](docs/validation-rules.md).

## Backend contract (to implement)

Cookie-based session (HttpOnly session cookie) with Spring-style CSRF (`XSRF-TOKEN` cookie echoed as `X-XSRF-TOKEN`).
Responses use the envelope `{ success, message, data }`. Errors use `{ errorCode, message }`.

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/identity/csrf` | Issues the `XSRF-TOKEN` cookie. |
| POST | `/identity/login` | Body `{ username, password }` returns `SessionUser`. |
| GET | `/identity/session` | Returns `SessionUser`, or `data: null` when signed out. |
| POST | `/identity/logout` | Ends the session. |
| GET | `/admin/navigation/counters` | `{ applications, communication, notifications }` badge counts (ADMIN). |
| GET | `/admin/settings` | Saved settings, grouped by section (ADMIN). |
| PUT | `/admin/settings` | Saves all sections and returns what was stored (ADMIN). |
| GET | `/admin/notifications` | List (or `{ items }`) of `{ id, category, title, message, createdAt, read, link }` (ADMIN). |
| PATCH | `/admin/notifications/{id}` | Body `{ read }`: mark one read or unread. |
| POST | `/admin/notifications/read-all` | Mark every notification read. |
| DELETE | `/admin/notifications/{id}` | Dismiss one notification. |
| GET | `/admin/communication/contacts` | Staff the admin can message: `{ id, name, role, email, unreadCount, lastMessage }` (ADMIN). |
| GET | `/admin/communication/contacts/{id}/messages` | Conversation, as `{ id, body, sentAt, fromAdmin, read }` messages. |
| POST | `/admin/communication/contacts/{id}/messages` | Body `{ body }` (1–1000 characters); returns the stored message. |
| POST | `/admin/communication/contacts/{id}/read` | Mark that staff member's messages read. |

Settings are grouped as `{ organization, billing, regional, security, workflow, notifications }`. Each field is a string,
number or boolean, keyed as in `src/modules/admin/components/settings/config/`. The backend must re-validate every
field (PAN, GSTIN, IFSC and so on), and apply the security values (password rules, lockout, session timeout) when
signing users in.

`SessionUser`: `{ id, username, displayName, role, permissions[], lastLoginAt }`. `role` must be one of `ADMIN`,
`CA_MANAGER`, `CA_AGENT`, `LOAN_MANAGER`, `LOAN_AGENT`; unknown roles are rejected. Area access requires the
`ADMIN_DASHBOARD_VIEW` or `STAFF_DASHBOARD_VIEW` permission.

Error codes the UI handles: `INVALID_CREDENTIALS` (401), `ACCOUNT_INACTIVE` (403), `TOO_MANY_ATTEMPTS` (429), and
`UNAUTHENTICATED` (401, which ends the session on any API call).

Frontend guards only shape navigation. The backend must hash passwords (BCrypt/Argon2) and enforce RBAC on every
endpoint.

## Structure

```
src/
  app/        bootstrap, routing (public/admin/staff), guards, WorkspaceLayout, status pages
  core/       api client + errors, environment, route paths, logger, utils
  modules/
    authentication/   sign-in, session lifecycle, roles and permissions, demo gateway (dev/)
    admin/            dashboard (overview), one folder per menu section, sidebar and header
    ca-manager/       CA Manager dashboard
    ca-agent/         CA Agent dashboard
    loan-manager/     Loan Manager dashboard
    loan-agent/       Loan Agent dashboard
  shared/     reusable components (Button, TextField, InlineAlert, Topbar, …), hooks, validation
  store/      auth store (in-memory; the session lives in the cookie)
  styles/     tokens (TaxEdge palette), reset, globals, accessibility
public/assets/  brand logo, local SVG icons, geometric background
```

Every module uses the same layout:

```
<module>/
  api/          backend calls
  components/   UI pieces (admin: one folder per menu section, plus shared/)
  dashboard/    the module's landing page
  hooks/        React hooks
  pages/        other route-level pages
  shared/       module-wide config, constants and types
  validation/   input and response validation
  index.ts      the only file other modules may import
```

Folders that have nothing in them yet hold a `.gitkeep` so the structure is ready to build in.

Modules communicate through their `index.ts`. Every component has its own `.css` file, and every source file stays
under 490 lines (`npm run check:lines`).
