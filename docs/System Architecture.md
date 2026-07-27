# Aegis

> Version: 1.1
>
> Status: Core Platform Implemented (see Project Overview for detailed status)
>
> Document: 02 - System Architecture

---

# Table of Contents

1. Architecture Philosophy
2. High-Level Architecture
3. Internal Layer Architecture
4. Request Lifecycle
5. Module Dependency Graph
6. Core Modules
7. Shared Infrastructure
8. Database Architecture
9. Security Layer
10. Deployment Architecture
11. Future Expansion
12. Design Principles

---

# 1. Architecture Philosophy

The Identity Platform follows a layered architecture inspired by Clean Architecture.

Each layer has a single responsibility.

```
Presentation

↓

Application

↓

Persistence

↓

Infrastructure
```

Every request flows downward.

No lower layer should know about an upper layer.

---

# 2. High-Level Architecture

```
                    Client Applications

      React       Next.js      Vue      Mobile App
           │          │          │            │
           └──────────┴──────────┴────────────┘
                              │
                              ▼
                      Reverse Proxy
                       (Future Nginx)
                              │
                              ▼
                    Identity Platform API
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
 Authentication         Authorization          Identity
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                      Repository Layer
                              │
                     Database Provider
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
     MongoDB            PostgreSQL             MySQL
```

---

# 3. Internal Layer Architecture

```
Route

↓

Middleware (rate limit, verifyjwt, requirePermission, validate)

↓

handle()

↓

Controller

↓

Service

↓

Repository

↓

Database Provider

↓

Database
```

The direction never changes.

Controllers never query the database.

Repositories never touch Express, and never contain business rules - they are pure data access, returning `Result<T, InfrastructureError>`.

Services own every business decision (duplicate checks, password verification, token orchestration) and translate repository/dependency failures into domain errors.

Routes never contain business logic.

---

# 4. Request Lifecycle

Example:

```
POST /api/v1/auth/login
```

Flow

```
HTTP Request

↓

Express Router

↓

authRateLimiter

↓

validate() (Zod schema)

↓

handle()

↓

AuthController.login()

↓

LoginDto + DeviceInfo (user agent, IP)

↓

AuthService.login()

↓

AuthRepository.findByUsername() (pure data access)

↓

MongoDB (User)

↓

SessionService.createSession() (issues opaque, hashed refresh token)

↓

SessionRepository -> MongoDB (Session)

↓

AuditService.record() (best-effort, never blocks the response)

↓

Service returns Result<LoginResponse, AuthError>

↓

Controller sets accessToken/refreshToken cookies on success

↓

handle()

↓

BaseResponse / BaseErrorResponse

↓

HTTP Response
```

---

# 5. Module Dependency Graph

```
Routes
   │
   ▼
Controllers
   │
   ▼
Services
   │
   ▼
Repositories
   │
   ▼
Storage Provider
   │
   ▼
Database
```

Shared utilities are available to every layer.

```
Shared

├── Result
├── Errors
├── Response
├── Logger
├── Config
├── Types
├── Security
└── Utils
```

---

# 6. Core Modules

The project is divided into modules.

Each module owns a single business capability.

```
Auth          - implemented
Session       - implemented
Role          - implemented
Permission    - implemented
Tenant        - implemented (Applications are tenant-scoped; Users/Roles/Permissions are not yet)
Application   - implemented
ApiKey        - implemented
Email         - implemented (Nodemailer + Console fallback)
Audit         - implemented (auth events only so far)
Webhook       - not started
OAuth         - not started
```

Modules communicate through interfaces, not direct implementation details.

---

# 7. Module Responsibilities

---

## Auth Module

Responsible for authentication.

Owns

```
Signup

Login

Logout

Logout All

Refresh Tokens

Password Change

Forgot Password

Reset Password

Email Verification
```

Does NOT own

```
Products

Orders

Payments

Inventory

Blog Posts
```

---

## Session Module

Owns

```
Refresh Tokens

Session List

Session Revocation

Device Tracking

Last Login

User Agent

IP Address
```

Authentication uses the Session module.

---

## Role Module

Owns

```
Roles

Role Assignment

Role Removal
```

Examples

```
Admin

Manager

Editor

Support
```

Never hardcode roles.

---

## Permission Module

Owns permissions.

Example

```
user:create

user:update

user:delete

billing:read

billing:update

inventory:view
```

Roles are simply collections of permissions.

---

## Tenant Module

Used only for Hosted SaaS.

```
Tenant

↓

Applications

↓

Users

↓

Roles
```

Every customer belongs to a tenant.

Tenants never share data.

---

## Application Module

Every customer can register applications.

Each application stores

```
Application Name

Client ID

Client Secret

Allowed Origins

Redirect URLs

Token Expiration

Refresh Expiration
```

---

## API Key Module

Each application can have zero or more API keys, created on demand (not automatically issued at application creation).

Every key stores

```
Name

Key Prefix (visible, for identification in logs/UI)

Hashed Key (SHA-256; the raw key is never stored)

Status (active / revoked)

Expiry (optional)

Last Used At
```

The raw key is shown exactly once, at creation time.

The SDK and any server-to-server client authenticate using the `X-API-Key` header.

---

## OAuth Module

Future support

```
Google

GitHub

Discord

Microsoft

Facebook

Apple
```

---

## Email Module

Owns

```
Email Verification

Forgot Password / Reset Password

Templates
```

Backed by Nodemailer (real SMTP) when `SMTP_HOST` is configured, falling back to a Console mailer (logs instead of sending) for local development.

Magic Links are not implemented yet.

---

## Webhook Module

Owns

```
user.created

user.deleted

user.logged_in

password.changed

role.updated
```

---

## Audit Module

Append-only log. Currently records:

```
Login (success and failed attempts)

Signup

Password Changes

Password Resets

Logout All
```

Not yet recorded (planned): Role/Permission changes, API Key generation/revocation, Application/Tenant changes, individual session revocation.

Exposes `IAuditLogger`, a narrow port other modules depend on to record events without needing the full audit service.

---

# 8. Shared Infrastructure

Everything reusable belongs inside Shared.

```
shared/

errors/

response/

result/

logger/

config/

security/

middleware/

http/

types/

utils/

constants/
```

No business-specific code belongs here.

---

# 9. Database Architecture

Business logic should never know which database is being used.

```
Repository

↓

Storage Interface

↓

Mongo Implementation

↓

PostgreSQL Implementation

↓

MySQL Implementation
```

Future structure

```
database/

mongodb/

postgres/

mysql/
```

Only one implementation is active.

Selection happens through configuration.

```
DATABASE_PROVIDER=mongodb
```

or

```
DATABASE_PROVIDER=postgres
```

or

```
DATABASE_PROVIDER=mysql
```

---

# 10. Security Layer

```
JWT (access token)

↓

verifyJwt

↓

requirePermission (RBAC check, when the route needs one)

↓

Controller

↓

Service

↓

Repository
```

Additional security

```
Password Hashing (bcrypt)

Opaque, hashed, rotating Session refresh tokens (see Session module - replaces the old single refreshToken/tokenVersion field on User)

HTTP Only Cookies

Rate Limiting (implemented - tiered: global, auth-specific, sensitive-action; in-memory store, not yet shared across instances)

Helmet security headers

Centralized error handling (no stack traces leaked in production)

Zod request validation on every route

MFA (Future)
```

---

# 11. Deployment Architecture

Hosted SaaS

```
Internet

↓

Reverse Proxy

↓

Identity Platform

↓

MongoDB

↓

Redis (Future)

↓

Email Provider
```

Self Hosted

```
Docker Compose

↓

Identity Platform

↓

Selected Database

↓

Redis (Optional)

↓

SMTP
```

Same application.

Different deployment.

---

# 12. Future Expansion

Future modules can be added without changing existing ones.

Examples

```
Organizations

Teams

Billing

Subscriptions

Enterprise SSO

SCIM

LDAP

SAML

Analytics
```

The modular architecture ensures these become new modules rather than changes to existing ones.

---

# 13. Design Principles

Every feature should follow these rules.

## Single Responsibility

Each module owns one domain.

---

## Dependency Direction

```
Route

↓

Controller

↓

Repository

↓

Database
```

Never reverse the dependency.

---

## No Circular Dependencies

Modules communicate through interfaces.

Never directly depend on each other's implementation.

---

## Database Agnostic

Business logic must not depend on MongoDB APIs.

The storage layer isolates database-specific code.

---

## Framework Isolation

Repositories should not know about

```
Express

Request

Response
```

Controllers should not know about

```
Mongo Queries

SQL Queries

Database Driver APIs
```

---

## Testability

Every repository and controller should be mockable through interfaces.

This allows unit testing without databases or Express.

---

# Architecture Summary

```
                 Client

                   │

                   ▼

             Reverse Proxy

                   │

                   ▼

              Express Server

                   │

                   ▼

               Middleware

                   │

                   ▼

                 handle()

                   │

                   ▼

               Controllers

                   │

                   ▼

              Repositories

                   │

                   ▼

          Database Provider

                   │

      ┌────────────┼────────────┐

      ▼            ▼            ▼

 MongoDB     PostgreSQL      MySQL

```

This architecture separates responsibilities clearly, supports multiple deployment models, and allows new capabilities to be added without disrupting existing modules.
