# Aegis

> Version: 1.0
>
> Status: Design Phase
>
> Document: 08 - Multi-Tenant & SaaS Architecture

---

# Table of Contents

1. Introduction
2. Deployment Models
3. Core Concepts
4. Tenant Architecture
5. Application Architecture
6. User Architecture
7. Organization Architecture
8. API Key Architecture
9. OAuth Client Architecture
10. Hosted SaaS
11. Self Hosted
12. Tenant Isolation
13. Future Expansion
14. Complete System Diagram

---

# 1. Introduction

This document defines how multiple independent customers can use the Identity Platform without interfering with one another.

The same codebase supports two deployment modes:

- Hosted SaaS
- Self Hosted

Only the infrastructure changes.

---

# 2. Deployment Models

## Hosted SaaS

```
Customer

↓

Identity Platform

↓

Shared Infrastructure

↓

Tenant Isolation

↓

MongoDB
```

Every customer receives an isolated tenant.

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

No tenant isolation is required because the customer owns the entire deployment.

---

# 3. Core Concepts

The platform consists of five major concepts.

```
Tenant

↓

Application

↓

Organization

↓

Users

↓

Roles & Permissions
```

Everything belongs to a tenant.

---

# 4. Tenant

A Tenant represents a customer.

Examples

```
Microsoft

Google

Amazon

Acme Inc.

University A
```

Each tenant has completely isolated data.

---

Tenant model

```
Tenant

id

name

slug

status

plan

createdAt

updatedAt
```

Future fields

```
billingId

ownerId

settings

limits

branding
```

---

# 5. Application

Every tenant can create multiple applications.

Example

```
Acme

↓

Website

↓

Mobile App

↓

Admin Dashboard

↓

Public API
```

Each application has its own authentication configuration.

---

Application model

```
Application

id

tenantId

name

clientId

clientSecret

allowedOrigins

redirectUris

accessTokenTTL

refreshTokenTTL

createdAt

updatedAt
```

---

Applications own:

- OAuth configuration
- API Keys
- Redirect URLs
- Allowed Origins
- Login Settings

---

# 6. User

Users belong to a tenant.

Future structure

```
Tenant

↓

Application

↓

Organization

↓

User
```

User model

```
id

tenantId

organizationId

email

passwordHash

emailVerified

status

createdAt

updatedAt
```

Notice

No hardcoded roles.

No permissions.

Those belong elsewhere.

---

# 7. Organization

Organizations divide users inside a tenant.

Example

```
Acme

↓

Engineering

↓

Finance

↓

Marketing

↓

Support
```

Organization model

```
Organization

id

tenantId

name

description
```

Organizations make enterprise deployments much easier.

---

# 8. Roles

Roles belong to a tenant.

Example

```
Tenant

↓

Admin

Manager

Employee

Intern
```

Different tenants may define completely different roles.

---

# 9. Permissions

Permissions belong to roles.

```
Role

↓

Permission

↓

Action
```

Example

```
Admin

↓

user:create

↓

Allowed
```

---

# 10. API Keys

Applications communicate with the platform using API credentials.

```
Application

↓

Client ID

↓

Client Secret

↓

API Key
```

API Key model

```
id

applicationId

name

hashedKey

status

expiresAt
```

Never store API keys in plain text.

Store only hashes.

---

# 11. OAuth Clients

Future

Every application may enable

```
Google

GitHub

Discord

Microsoft

Apple
```

OAuth configuration belongs to the application.

Not globally.

---

# 12. Hosted SaaS

Hosted deployment

```
Internet

↓

Load Balancer

↓

Identity Platform

↓

Tenant Resolver

↓

Application Resolver

↓

Repository

↓

MongoDB
```

Every request identifies

- Tenant
- Application

before business logic executes.

---

# 13. Tenant Resolution

Possible methods

Header

```
X-Tenant-ID
```

Subdomain

```
acme.identity.com
```

Custom Domain

```
login.acme.com
```

JWT Claim

```
tenantId
```

Application Key

```
clientId
```

The resolver determines the active tenant.

---

# 14. Data Isolation

Every query automatically filters by tenant.

Example

Instead of

```
SELECT users
```

the platform performs

```
SELECT users

WHERE tenantId = currentTenant
```

Mongo equivalent

```ts
{
  tenantId: currentTenant;
}
```

No repository should ever forget tenant filtering.

---

# 15. Self Hosted

Self-hosted deployments usually contain one tenant.

```
Customer

↓

Own Identity Platform

↓

Own Database
```

No tenant resolution is necessary.

Configuration

```
MULTI_TENANT=false
```

---

# 16. Authentication Flow

Hosted SaaS

```
Request

↓

Resolve Tenant

↓

Resolve Application

↓

Authentication

↓

Authorization

↓

Controller

↓

Repository

↓

Database
```

Tenant resolution always occurs before authentication.

---

# 17. SDK Flow

Developer installs SDK.

```
npm install
```

Configuration

```ts
IdentitySDK.configure({
  clientId,

  baseUrl,

  apiKey,
});
```

SDK communicates with

```
Hosted Identity Platform
```

No database access.

No internal knowledge.

---

# 18. Future Dashboard

Tenant administrators can manage

Applications

↓

Users

↓

Organizations

↓

Roles

↓

Permissions

↓

Sessions

↓

Audit Logs

↓

API Keys

Everything from the web dashboard.

---

# 19. Billing (Future)

Tenant

↓

Subscription

↓

Plan

↓

Limits

Example

```
Free

↓

5 Applications

↓

1,000 Users
```

```
Pro

↓

Unlimited Applications

↓

50,000 Users
```

---

# 20. Monitoring

Every tenant has separate metrics.

Examples

```
Logins

↓

Failed Logins

↓

Active Sessions

↓

API Usage

↓

Refresh Requests

↓

Errors
```

---

# 21. Complete SaaS Architecture

```
                        Internet

                            │

                            ▼

                     Load Balancer

                            │

                            ▼

                     Identity Platform

                            │

        ┌───────────────────┼───────────────────┐

        ▼                   ▼                   ▼

 Tenant Resolver    Application Resolver   Rate Limiter

        │                   │

        └───────────────┬───┘

                        ▼

                 Authentication

                        ▼

                 Authorization

                        ▼

                  Repository Layer

                        ▼

                  Storage Provider

                        ▼

        MongoDB / PostgreSQL / MySQL
```

---

# 22. Self Hosted Architecture

```
Customer

↓

Docker Compose

↓

Identity Platform

↓

MongoDB
```

or

```
Customer

↓

Docker Compose

↓

Identity Platform

↓

PostgreSQL
```

or

```
Customer

↓

Docker Compose

↓

Identity Platform

↓

MySQL
```

Only configuration changes.

Business logic remains identical.

---

# Summary

The Identity Platform is built around a hierarchy:

```
Tenant

↓

Application

↓

Organization

↓

Users

↓

Roles

↓

Permissions
```

This hierarchy enables:

- Secure multi-tenancy
- Complete data isolation
- Hosted SaaS deployments
- Self-hosted deployments
- Unlimited applications
- Unlimited organizations
- Enterprise scalability

The same core architecture serves both deployment models by changing infrastructure and configuration rather than application logic.
