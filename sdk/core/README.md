# @identity-platform/core

Core TypeScript SDK for the Identity Platform. Automatic authentication, automatic token refresh, session management, and typed access to every module - so consuming apps never touch cookies, JWTs, or retry logic themselves (see `docs/SDK Architecture & Client Integration.md`).

## Scope of this package

Per the SDK architecture doc, the long-term plan is a family of packages (`core`, `react`, `next`, `node`, `nest`, `vue`, `angular`) that all wrap `core`. **This package is `core` only** - it's plain TypeScript with zero framework dependencies, usable directly from any Node/Express backend or bundled into a frontend app. The framework-specific wrappers (React hooks, Next.js middleware, etc.) are not yet built; `core` is written so they can wrap it cleanly later.

## Install

```bash
cd sdk/core
npm install
npm run build
```

(Not yet published to npm - use as a local workspace package or `npm link` for now.)

## Quick start

```ts
import { IdentityClient } from '@identity-platform/core';

const identity = new IdentityClient({
  baseUrl: 'https://auth.example.com/api/v1',
});

// Sign up + log in
await identity.auth.signup({
  username: 'jane',
  email: 'jane@example.com',
  password: 'correct-horse-battery',
});
const user = await identity.auth.login({ username: 'jane', password: 'correct-horse-battery' });

console.log(identity.auth.user()); // cached, no HTTP request
console.log(identity.auth.isAuthenticated()); // true

// Every subsequent call is authenticated automatically. If the access
// token has expired, the client refreshes it and retries the request
// once, transparently.
const sessions = await identity.sessions.list();

await identity.auth.logout();
```

## Persisting sessions across restarts

The client keeps tokens in memory only. To persist a session (e.g. in a CLI tool, server process, or your own encrypted store):

```ts
identity.onTokensChanged((tokens) => {
  // called on login, silent refresh, and logout (tokens = {} on logout)
  myStorage.save(tokens);
});

// On startup, restore a previous session instead of logging in again:
identity.setTokens(myStorage.load());
```

## Server-to-server (API key) mode

For backend-to-backend integrations using an Application's API key instead of a user session:

```ts
const identity = new IdentityClient({ baseUrl: 'https://auth.example.com/api/v1' });
identity.useApiKey('sk_...');

const applications = await identity.applications.list();
```

## Modules

- `identity.auth` — signup, login, logout, logoutAll, refresh, changePassword, forgotPassword, resetPassword, verifyEmail, resendVerification
- `identity.sessions` — list/revoke your own devices
- `identity.permissions` — RBAC permission CRUD (admin)
- `identity.roles` — role CRUD, permission assignment, user-role assignment (admin)
- `identity.tenants` — Hosted SaaS tenant CRUD (admin, only relevant with `MULTI_TENANT=true`)
- `identity.applications` — register/manage consuming applications and their client credentials
- `identity.apiKeys` — create/list/revoke API keys scoped to an application

## Error handling

Every failed request throws `IdentityApiError` (has `.statusCode`, `.message`, `.timestamp`) or, for network-level failures (timeout, DNS, connection refused), `IdentityNetworkError`.

```ts
import { IdentityApiError } from '@identity-platform/core';

try {
  await identity.auth.login({ username: 'jane', password: 'wrong' });
} catch (e) {
  if (e instanceof IdentityApiError && e.statusCode === 401) {
    // show "invalid credentials"
  }
}
```

## Notable design note: login uses `username`, not `email`

The architecture doc's examples show `auth.login({ email, password })`, but the actual backend's `/auth/login` endpoint takes `{ username, password }`. This SDK matches the real API (`username`) rather than the aspirational doc example - flagging this in case the doc gets updated later to match, or the backend adds email-based login.
