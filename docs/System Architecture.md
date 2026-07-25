# Identity Platform

> Version: 1.0
>
> Status: Design Phase
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

Middleware

↓

handle()

↓

Controller

↓

Repository

↓

Database Provider

↓

Database
```

The direction never changes.

Controllers never query the database.

Repositories never touch Express.

Routes never contain business logic.

---

# 4. Request Lifecycle

Example:

```
POST /login
```

Flow

```
HTTP Request

↓

Express Router

↓

verifyJwt (if protected)

↓

handle()

↓

AuthController.login()

↓

LoginDto

↓

AuthRepository.login()

↓

Mongo Repository

↓

MongoDB

↓

Repository returns Result

↓

Controller

↓

handle()

↓

BaseResponse

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
Auth

Role

Permission

Session

Tenant

Application

ApiKey

Email

Webhook

Audit

OAuth
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

Every application receives

```
Client ID

Client Secret

API Key
```

Future SDKs authenticate using these credentials.

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

Forgot Password

Magic Links

Templates
```

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

Stores

```
Logins

Password Changes

Role Changes

Permission Changes

API Key Generation

Session Revocation
```

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
JWT

↓

verifyJwt

↓

Controller

↓

Repository
```

Additional security

```
Password Hashing

Refresh Tokens

Token Version

Session Validation

HTTP Only Cookies

Rate Limiting (Future)

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
