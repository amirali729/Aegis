# Aegis

> Version: 1.1
>
> Status: Core Platform Implemented (Auth, Sessions, RBAC, Multi-Tenancy foundation, Applications & API Keys, Audit Log, Email, SDK core, OpenAPI docs) - Dashboard and framework SDKs not yet started.
>
> Author: Amir Ali
>
> Document: 01 - Project Overview

---

# Table of Contents

1. Introduction
2. Vision
3. Goals
4. Project Philosophy
5. Problem Statement
6. Target Users
7. Deployment Models
8. Core Features
9. Non Goals
10. Technology Stack
11. High Level Architecture
12. Current Progress
13. Future Roadmap

---

# 1. Introduction

**Aegis** is a modern authentication and authorization system built using Express.js and TypeScript.

The goal is to provide developers with a complete identity solution so they no longer need to build authentication from scratch for every project.

Instead of rewriting:

- Signup
- Login
- JWT Authentication
- Refresh Tokens
- Password Reset
- Email Verification
- Roles
- Permissions

developers simply integrate this platform.

The platform should work for:

- Small Projects
- Startups
- Enterprise Applications
- Internal Company Tools
- SaaS Applications
- Mobile Applications
- APIs
- Microservices

---

# 2. Vision

<!-- The long-term vision is to build an open identity platform similar to: -->

The long-term vision is to make Aegis Identity Platfrom similar to:

- Clerk
- Auth0
- Keycloak
- Ory
- Firebase Authentication
- Supabase Auth

while remaining:

- Modular
- Easy to understand
- Open Source
- Self Hostable
- Production Ready

The same codebase should support both cloud-hosted and self-hosted deployments.

---

# 3. Goals

The project should provide:

## Authentication

- User Registration
- Login
- Logout
- Logout All Devices
- Refresh Tokens
- JWT Authentication
- Session Management
- Password Change
- Forgot Password
- Email Verification
- Magic Links (Future)
- Multi-Factor Authentication (Future)

---

## Authorization

- Roles
- Permissions
- Claims
- Policies
- Route Protection
- Permission Middleware
- Role Middleware

---

## Identity

The platform manages identity only.

It should NOT manage business data.

Example:

Identity Platform stores:

- Email
- Password
- Roles
- Permissions
- Sessions

The customer's application stores:

- Orders
- Products
- Payments
- Shopping Cart
- Blog Posts
- Inventory

This separation keeps the platform reusable.

---

# 4. Project Philosophy

The project follows several principles.

## Separation of Concerns

Every layer has exactly one responsibility.

Routes

↓

Controllers

↓

Repositories

↓

Database

---

## Strong Typing

Everything should use TypeScript.

Avoid:

```
any
```

Prefer:

- Interfaces
- Types
- DTOs
- Response Objects
- Result Types

---

## Clean Architecture

The project should remain independent of:

- MongoDB
- PostgreSQL
- MySQL

Business logic should never depend directly on the database implementation.

---

## Modularity

Every feature should exist inside its own module.

Example

```
Auth

Role

Permission

Application

Session

Email

Webhook

Audit
```

---

## Scalability

The project should support:

10 users

↓

100 users

↓

10,000 users

↓

1,000,000 users

without major architectural changes.

---

# 5. Problem Statement

Almost every project starts by implementing authentication.

Developers repeatedly write:

- Login
- Signup
- JWT
- Refresh Tokens
- Password Hashing
- Roles
- Permissions

This wastes development time.

Instead, authentication should become reusable.

---

# 6. Target Users

The platform targets:

## Individual Developers

Building side projects.

---

## Freelancers

Who repeatedly build authentication.

---

## Startups

Who want to focus on business features.

---

## Companies

Who need an internal identity server.

---

## Enterprise Teams

Who need a self-hosted identity platform.

---

# 7. Deployment Models

The project supports two deployment models.

---

## Hosted SaaS

```
Customer Application

↓

HTTPS

↓

Identity Platform

↓

Database
```

The customer only consumes APIs.

The platform owner manages:

- Infrastructure
- Database
- Monitoring
- Updates
- Security

---

## Self Hosted

```
Customer

↓

Docker Compose

↓

Identity Platform

↓

Own Database
```

The customer owns everything.

The platform provides:

- Docker Images
- Documentation
- Configuration
- Updates

---

Both deployment models use the same codebase.

---

# 8. Core Features

## Authentication

- Signup
- Login
- Logout
- Logout All
- Session Management (multi-device, list/revoke)
- Refresh Tokens (opaque, hashed, rotated)
- Change Password
- Forgot / Reset Password
- Email Verification

---

## Authorization

- Roles
- Permissions
- Role & Permission assignment
- Route protection middleware (`requirePermission`)

Future: Policies (ABAC)

---

## Multi-Tenancy & Applications

- Tenants (Hosted SaaS customer isolation, opt-in via `MULTI_TENANT`)
- Applications (client credentials)
- API Keys (server-to-server auth via `X-API-Key`)

---

## Security

- JWT
- Refresh Tokens
- Cookie Authentication
- Password Hashing
- Session Management
- Audit Log

---

## API

REST API

Future:

GraphQL (optional)

---

## SDK

`@identity-platform/core` - framework-agnostic TypeScript client, done.

Future SDKs

- React
- Next.js
- Node/Express helpers
- NestJS
- Vue
- Angular

---

## Dashboard

Future web dashboard

For:

- Applications
- Users
- Roles
- Sessions
- API Keys
- Audit Log

---

# 9. Non Goals

This platform will NOT become:

- CMS
- ERP
- CRM
- E-commerce Backend
- Blog Engine
- Payment Gateway

It focuses only on Identity and Access Management.

---

# 10. Technology Stack

## Backend

Express.js

TypeScript

Node.js

---

## Database

Phase 1

MongoDB

Future

- PostgreSQL
- MySQL

---

## Authentication

JWT (access tokens)

Opaque, hashed, rotating session tokens (refresh tokens - see Session module)

HTTP Only Cookies

bcrypt

---

## Containerization

Docker

Docker Compose

Future

Kubernetes

---

## Documentation

Markdown

Swagger / OpenAPI

---

## Monitoring

Future

Prometheus

Grafana

---

## Reverse Proxy

Future

Nginx

Traefik

---

# 11. High Level Architecture

```
                Client

                  │

                  ▼

          Identity Platform

                  │

      ┌───────────┼───────────┐

      │           │           │

Authentication Authorization Sessions

      │           │           │

      └───────────┼───────────┘

                  │

          Repository Layer

                  │

         Database Provider

                  │

             MongoDB
```

Later

```
Database Provider

↓

MongoDB

↓

PostgreSQL

↓

MySQL
```

---

# 12. Current Progress

Completed

✅ Project Structure (feature-based modules)

✅ Authentication Module (signup, login, logout, logout-all, change password, forgot/reset password, email verification, resend verification)

✅ Session Management (multi-device sessions replace the old single refresh-token field; refresh tokens are opaque, hashed, and rotated on every use)

✅ Authorization / RBAC (Permissions, Roles, permission assignment, user-role assignment, `requirePermission` middleware, permission evaluation)

✅ Multi-Tenancy foundation (Tenant model and CRUD, `resolveTenant` middleware, `MULTI_TENANT` toggle, Applications are genuinely tenant-scoped)

✅ Applications & API Keys (client credentials with hashed secrets, API keys with hashed storage and visible prefixes, `X-API-Key` auth middleware)

✅ Audit Log (append-only security event log, admin-facing listing endpoint; currently wired into auth events - login, logout-all, password change/reset, signup)

✅ Email (Nodemailer for real SMTP delivery, Console mailer fallback for local dev, verification and password-reset templates)

✅ DTO Pattern, Repository Pattern, Service Layer, Controller Pattern, Result Pattern, Response Pattern, Error Pattern

✅ Request validation (Zod) on every route

✅ Security hardening (helmet, rate limiting, centralized error handling, health check endpoint)

✅ OpenAPI / Swagger documentation (`/api/docs`), served with Try-it-out support

✅ Core SDK package (`@identity-platform/core`) - typed client with automatic token refresh, covering every module above

✅ Docker Compose for local/self-hosted development

---

In Progress / Partial

- Multi-tenant data isolation only fully applies to Applications today - Users, Roles, Permissions, and Audit Log are not yet tenant-scoped
- Audit logging only covers auth events - role/permission/application/API-key/tenant changes are not yet recorded
- `allowedOrigins` / `redirectUris` on Application are stored but not yet enforced by any flow (no OAuth authorize/redirect endpoint exists yet)

---

Not Started

- Admin Dashboard (web UI)
- Framework-specific SDKs (React, Next.js, Node/Express helpers, NestJS, Vue, Angular) - only the framework-agnostic core SDK exists
- OAuth / social login
- Magic Links
- Multi-Factor Authentication
- Multi-database support (PostgreSQL, MySQL) - MongoDB only for now
- Webhooks
- Enterprise features (SSO/SAML, org-level billing hooks)
- Redis caching layer for permission evaluation
- Kubernetes / production-grade infrastructure (Prometheus, Grafana, reverse proxy)

---

# 13. Future Roadmap

Phase 1 - Core Authentication ✅ Done

Phase 2 - Session Management ✅ Done

Phase 3 - Authorization (RBAC) ✅ Done

Phase 4 - Multi-Tenancy foundation ✅ Done (Applications only - full isolation still pending)

Phase 5 - Applications & API Keys ✅ Done

Phase 6 - Audit Log ✅ Done (auth events only)

Phase 7 - Email delivery ✅ Done

Phase 8 - OpenAPI docs & Core SDK ✅ Done

Phase 9 - Pre-deployment hardening (env validation, CORS/credentials config, production Docker profile, graceful shutdown) 🔲 Not started

Phase 10 - Full multi-tenant data isolation + expanded audit coverage 🔲 Not started

Phase 11 - Admin Dashboard 🔲 Not started

Phase 12 - Framework SDKs 🔲 Not started

Phase 13 - OAuth, Multi-Factor Authentication, Webhooks 🔲 Not started

Phase 14 - Multi-database support, Enterprise features, Kubernetes-grade infrastructure 🔲 Not started

---

# Conclusion

The Aegis aims to become a complete authentication and authorization solution that can be deployed as either:

- Hosted SaaS

or

- Self Hosted

while sharing a single codebase.

The Aegis focuses exclusively on Identity and Access Management, allowing customer applications to remain responsible for their own business logic and domain models.
