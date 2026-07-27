# Aegis

> Version: 1.1
>
> Status: Reflects the current implementation (Authentication fully implemented using JWT access tokens, opaque rotating refresh tokens, sessions, email verification and password recovery)
>
> Document: 07 - Authentication Architecture

---

# Table of Contents

1. Authentication Overview
2. Authentication Goals
3. Authentication Flow
4. Authentication Components
5. Authentication Lifecycle
6. JWT Authentication
7. Session Management
8. Refresh Token Rotation
9. Cookie Authentication
10. Email Verification
11. Password Recovery
12. Authentication Security
13. Current Status
14. Future Improvements

---

# 1. Authentication Overview

Authentication is responsible for proving a user's identity before they are allowed to access protected resources.

The Authentication module answers one question:

> **Who is the user?**

It is intentionally separated from Authorization.

Authentication determines identity.

Authorization determines permissions.

---

# Authentication Responsibilities

The module currently owns:

- User Registration
- Login
- Logout
- Logout All Devices
- JWT Access Tokens
- Session Management
- Refresh Token Rotation
- Password Change
- Forgot Password
- Reset Password
- Email Verification
- Resend Verification Email

Future authentication features include:

- Multi-Factor Authentication (MFA)
- Magic Links
- Passwordless Login
- OAuth Providers
- Passkeys (WebAuthn)

---

# 2. Authentication Goals

The authentication system was designed around several goals.

## Stateless API Requests

Every authenticated API request should be verified using an access token.

The server should not maintain server-side login state for every request.

---

## Secure Session Management

Long-lived authentication should never rely on long-lived JWTs.

Instead:

```
Short-lived Access Token

+

Long-lived Refresh Session
```

This allows compromised access tokens to expire quickly.

---

## Device Awareness

Every login creates an independent session.

A user can be logged in from:

- Laptop
- Mobile Phone
- Tablet
- Desktop
- Multiple Browsers

Each device is managed independently.

---

## Session Revocation

A user should be able to revoke:

- Current session
- Specific device
- Every active device

without affecting unrelated sessions.

---

## Secure Password Recovery

Passwords are never recoverable.

Instead, users receive a one-time reset token via email.

---

# 3. Authentication Flow

The complete authentication flow is shown below.

```
User

↓

Signup

↓

Email Verification

↓

Login

↓

Access Token + Refresh Session

↓

Protected API Requests

↓

Access Token Expires

↓

Refresh Session

↓

New Access Token

↓

Continue Using API

↓

Logout

↓

Session Revoked
```

Every stage is independent.

---

# 4. Authentication Components

The authentication module consists of several components.

```
Authentication

├── User Registration

├── Login

├── JWT Access Tokens

├── Sessions

├── Refresh Tokens

├── Password Recovery

├── Email Verification

└── Logout
```

Supporting modules include:

- Session Module
- Email Module
- Audit Module
- Role Module
- Permission Module

---

# 5. Authentication Lifecycle

## User Registration

```
POST /auth/signup
```

Flow

```
Client

↓

Validation (Zod)

↓

Controller

↓

Auth Service

↓

Duplicate User Check

↓

Hash Password

↓

Create User

↓

Generate Email Verification Token

↓

Store Hashed Verification Token

↓

Send Verification Email

↓

Audit Log

↓

Response
```

Passwords are hashed before storage.

Verification tokens are hashed before storage.

Raw tokens are never persisted.

---

## Login

```
POST /auth/login
```

Flow

```
Client

↓

Validation

↓

Auth Controller

↓

Auth Service

↓

Find User

↓

Verify Password

↓

Create Session

↓

Generate JWT Access Token

↓

Generate Refresh Token

↓

Hash Refresh Token

↓

Store Session

↓

Set Cookies

↓

Audit Log

↓

Response
```

Every successful login creates a completely new session.

---

## Authenticated Requests

```
Browser

↓

Access Token Cookie

↓

verifyJwt Middleware

↓

Request.user

↓

Permission Middleware (optional)

↓

Controller

↓

Service

↓

Repository

↓

Database
```

Every protected request passes through JWT verification before reaching business logic.

---

# 6. JWT Authentication

The platform uses JWTs only for short-lived authentication.

Current implementation:

```
Access Token

↓

JWT

↓

Signed

↓

Short Expiration

↓

Stored in HTTP Only Cookie
```

JWTs contain only identity information.

Typical claims include:

- User ID
- Username
- Email
- Session ID
- Token Version (if required)
- Expiration

Access tokens are never stored in the database.

---

## Why Short-Lived JWTs?

If an attacker steals an access token:

```
Attack Window

↓

Very Small

↓

Token Expires

↓

Access Lost
```

Long-lived JWTs would significantly increase risk.

---

# 7. Session Management

Unlike access tokens, sessions are persistent.

Each login creates:

```
User

↓

Session

↓

Refresh Token

↓

Device Information

↓

IP Address

↓

User Agent

↓

Expiry
```

Each session is stored independently.

This allows:

- Multi-device login
- Device management
- Session revocation
- Logout All Devices

The old approach of storing a single refresh token on the User model has been replaced.

---

## Session Model

Every session stores:

```
User

Hashed Refresh Token

Device Name

User Agent

IP Address

Created At

Last Used At

Expires At

Revoked At
```

The raw refresh token is never stored.

---

# 8. Refresh Token Rotation

The platform implements rotating refresh tokens.

Flow

```
Access Token Expired

↓

Refresh Endpoint

↓

Locate Session

↓

Compare Hashed Refresh Token

↓

Generate New Refresh Token

↓

Hash New Token

↓

Replace Old Token

↓

Generate New JWT

↓

Return Updated Cookies
```

The previous refresh token immediately becomes invalid.

---

## Benefits

Rotation prevents replay attacks.

If a stolen refresh token is reused:

```
Already Replaced

↓

Verification Fails

↓

Session Invalid
```

This greatly reduces the usefulness of stolen refresh tokens.

---

# 9. Cookie Authentication

Authentication cookies are configured as:

```
HTTP Only

Secure (production)

SameSite

Signed by HTTPS
```

Benefits

- JavaScript cannot read cookies.
- Reduces XSS token theft.
- Works naturally with browsers.
- Automatic cookie transmission.

Current cookie configuration is centralized in:

```
src/shared/config/cookie.ts
```

---

# 10. Email Verification

New users must verify ownership of their email.

Flow

```
Signup

↓

Generate Verification Token

↓

Hash Token

↓

Store Hash

↓

Send Email

↓

User Clicks Link

↓

Verify Token

↓

Mark Email Verified

↓

Delete Verification Token
```

Verification tokens are:

- Random
- Single-use
- Expiring
- Stored only as hashes

---

## Resend Verification

Users may request another verification email.

The previous token becomes invalid once replaced.

---

# 11. Password Recovery

Forgot password flow:

```
Forgot Password

↓

Generate Reset Token

↓

Hash Token

↓

Store Hash

↓

Send Email

↓

User Opens Link

↓

Reset Password

↓

Hash New Password

↓

Delete Reset Token

↓

Invalidate Existing Sessions (recommended)
```

Current implementation supports:

- Forgot Password
- Reset Password

Future improvements may revoke every active session after a successful password reset.

---

# 12. Authentication Security

Current security measures include:

## Password Hashing

Passwords are hashed using:

```
bcrypt
```

Passwords are never stored in plaintext.

---

## Refresh Token Hashing

Refresh tokens are hashed using SHA-256 before persistence.

The raw refresh token is shown only once to the client.

---

## Request Validation

Every authentication endpoint uses Zod validation.

Invalid requests never reach business logic.

---

## Rate Limiting

Authentication routes use stricter limits than normal endpoints.

Current implementation:

- Global Rate Limiter
- Authentication Rate Limiter
- Sensitive Action Rate Limiter

The current implementation uses an in-memory store.

---

## Secure Cookies

Authentication cookies use:

- HTTP Only
- SameSite
- Secure (production)

---

## Centralized Error Handling

Authentication errors are returned through:

```
BaseErrorResponse
```

No internal stack traces are exposed in production.

---

## Audit Logging

Authentication events currently recorded include:

- Signup
- Successful Login
- Failed Login
- Password Change
- Password Reset
- Logout All

Audit logging is intentionally best-effort and never blocks authentication.

---

# 13. Current Status

## Implemented

✅ Signup

✅ Login

✅ Logout

✅ Logout All

✅ JWT Authentication

✅ Session Management

✅ Multi-device Sessions

✅ Refresh Token Rotation

✅ Password Change

✅ Forgot Password

✅ Reset Password

✅ Email Verification

✅ Resend Verification

✅ Cookie Authentication

✅ Zod Validation

✅ Audit Logging

✅ Rate Limiting

✅ SDK Authentication Support

---

## Partially Implemented

- Login events are audited, but authentication-related audit coverage can still expand.
- Account lockout after repeated failures is not implemented.
- Session anomaly detection is not implemented.

---

## Not Implemented

- OAuth Login
- Google Login
- GitHub Login
- Microsoft Login
- Magic Links
- Passwordless Login
- Multi-Factor Authentication (MFA)
- Passkeys (WebAuthn)

---

# 14. Future Improvements

Planned improvements include:

## Account-Level Brute Force Protection

Instead of relying only on IP-based rate limiting:

```
User Account

↓

Failed Attempts

↓

Temporary Lock

↓

Automatic Unlock
```

---

## Multi-Factor Authentication

Support:

- TOTP
- Authenticator Apps
- Backup Codes

---

## Magic Links

Passwordless authentication through secure email links.

---

## OAuth Providers

Support for:

- Google
- GitHub
- Microsoft
- Apple
- Discord

---

## Passkeys

Future WebAuthn support for passwordless authentication.

---

# Authentication Summary

The authentication architecture currently provides a production-oriented authentication system based on:

- JWT access tokens
- Opaque rotating refresh tokens
- Session-based device management
- HTTP-only cookie authentication
- Email verification
- Password recovery
- Request validation
- Rate limiting
- Audit logging

The remaining work is focused on authentication hardening and convenience features such as MFA, account lockout, OAuth providers, Magic Links, and Passkeys rather than changes to the core authentication design.
