# Identity Platform

> Version: 1.0
>
> Status: Design Phase
>
> Document: 09 - SDK Architecture & Client Integration

---

# Table of Contents

1. Introduction
2. SDK Goals
3. Supported Platforms
4. SDK Packages
5. SDK Architecture
6. Configuration
7. Authentication Flow
8. Session Management
9. Route Protection
10. Backend Integration
11. React Integration
12. Next.js Integration
13. Express Integration
14. Error Handling
15. Future SDK Features

---

# 1. Introduction

The SDK is the primary interface between developers and the Identity Platform.

Developers should **never** need to manually:

- Build login URLs
- Handle cookies
- Refresh access tokens
- Parse JWTs
- Retry authentication requests
- Store tokens

The SDK performs all of these automatically.

---

# 2. SDK Goals

The SDK should provide:

✓ Easy installation

✓ Simple configuration

✓ Automatic authentication

✓ Automatic token refresh

✓ Session management

✓ Route protection

✓ User information

✓ Logout

✓ Error handling

✓ TypeScript support

✓ Tree-shakable packages

---

# 3. Supported Platforms

The platform will eventually provide separate SDKs.

```
@identity/core
```

Shared logic.

```
@identity/react
```

React Hooks

```
@identity/next
```

Next.js

```
@identity/node
```

Express

```
@identity/nest
```

NestJS

```
@identity/vue
```

Vue

```
@identity/angular
```

Angular

Future

```
Flutter

React Native

Swift

Kotlin

Go

Python
```

---

# 4. SDK Package Structure

```
packages/

    core/

    react/

    next/

    node/

    nest/

    vue/

    angular/
```

Each package depends on

```
core
```

Business logic lives only inside Core.

---

# 5. SDK Architecture

```
Developer

↓

React App

↓

React SDK

↓

Core SDK

↓

HTTP Client

↓

Identity Platform
```

The frontend never communicates directly with authentication endpoints.

Everything passes through the SDK.

---

# 6. SDK Configuration

Example

```ts
Identity.configure({

baseUrl:

"https://auth.example.com",

clientId:

"abc123"

});
```

Future options

```ts
Identity.configure({

baseUrl,

clientId,

clientSecret,

tenant,

timeout,

retry,

cookie,

storage

});
```

---

# 7. Login Flow

Developer

```ts
await auth.login({

email,

password

});
```

SDK

↓

POST /login

↓

Stores Session

↓

Loads Current User

↓

Returns User

Developer never touches cookies.

---

# 8. Signup Flow

Developer

```ts
await auth.signup({

email,

password,

username

});
```

SDK

↓

POST /signup

↓

Success

↓

Return User

---

# 9. Logout Flow

Developer

```ts
await auth.logout();
```

SDK

↓

POST /logout

↓

Clear Cache

↓

Clear User

↓

Redirect Login

---

# 10. Automatic Refresh

SDK watches every request.

```
401

↓

Refresh Token

↓

Retry Original Request

↓

Success
```

Developer never manually refreshes tokens.

---

# 11. User Cache

SDK stores

```
Current User
```

Memory

↓

React Context

↓

Components

Example

```ts
const user = auth.user();
```

No HTTP request required.

---

# 12. React Integration

Provider

```tsx
<AuthProvider>

<App/>

</AuthProvider>
```

Hooks

```ts
const auth = useAuth();
```

Methods

```ts
auth.login()

auth.logout()

auth.signup()

auth.user()

auth.refresh()

auth.isAuthenticated()
```

---

# 13. Route Protection

Example

```tsx
<ProtectedRoute>

Dashboard

</ProtectedRoute>
```

SDK

↓

Check Session

↓

Allowed

or

Redirect Login

---

# 14. Permission Hooks

Future

```ts
const canEdit =
auth.can(

"user:update"

);
```

Another

```ts
auth.hasRole(

"Admin"

);
```

Another

```ts
auth.hasPermission(

"user:delete"

);
```

---

# 15. Next.js

Server Components

Middleware

Route Handlers

API Routes

Supported.

Example

```ts
const session =
await auth.getServerSession();
```

---

# 16. Express SDK

Example

```ts
app.use(

identityMiddleware()

);
```

Request becomes

```ts
req.user
```

Protected Route

```ts
app.get(

"/profile",

requirePermission(

"user:view"

),

controller
);
```

---

# 17. Error Handling

Instead of

```
Axios Error
```

Developer receives

```ts
AuthenticationError

AuthorizationError

ValidationError

NetworkError

ServerError
```

Typed errors.

---

# 18. Retry Strategy

Temporary network failure

↓

Retry

↓

Exponential Backoff

↓

Success

Developer doesn't write retry logic.

---

# 19. SDK Storage

Web

↓

Cookies

Mobile

↓

Secure Storage

Node

↓

Memory

Custom storage adapters can be added later.

---

# 20. Event System

Future

Developers can subscribe to events.

```ts
auth.on(

"login",

callback
);
```

Other events

```
logout

refresh

expired

sessionChanged

userUpdated
```

---

# 21. Plugins

Future

SDK plugins

```
Analytics

Logging

Monitoring

OpenTelemetry

Sentry

Custom Cache
```

---

# 22. Developer Experience

A developer should be able to authenticate a project with only three steps.

Install

```bash
npm install @identity/react
```

Configure

```ts
Identity.configure({

baseUrl,

clientId

});
```

Wrap App

```tsx
<AuthProvider>

<App/>

</AuthProvider>
```

Everything else is automatic.

---

# 23. Complete SDK Architecture

```
Application

↓

Identity SDK

↓

Authentication Client

↓

HTTP Client

↓

Cookie Manager

↓

Session Manager

↓

Cache Manager

↓

Retry Manager

↓

Identity Platform

↓

Database
```

Every layer has one responsibility.

---

# 24. Internal SDK Modules

```
core/

    auth/

    http/

    cache/

    cookies/

    refresh/

    storage/

    events/

    errors/

    utils/

    types/
```

---

# 25. Future SDK Features

✓ OAuth Login

✓ MFA

✓ Passkeys

✓ Device Trust

✓ Organizations

✓ Role Management

✓ Permission Management

✓ Session Dashboard

✓ Webhooks

✓ Offline Cache

✓ Push Notifications

---

# Summary

The SDK is responsible for providing a simple, consistent developer experience across every supported platform.

Its responsibilities include:

- Authentication requests
- Session management
- Automatic token refresh
- Route protection
- User caching
- Error normalization
- Framework integration

The SDK hides implementation details so developers interact with a clean, stable API instead of low-level authentication endpoints.