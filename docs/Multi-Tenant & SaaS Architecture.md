# Aegis

> Version: 1.1
>
> Status: Reflects the current implementation (Foundational multi-tenant architecture implemented. Applications are tenant-scoped; complete tenant isolation is planned.)
>
> Document: 08 - Multi-Tenant & SaaS Architecture

---

# Table of Contents

1. Multi-Tenancy Overview
2. Design Goals
3. SaaS Architecture
4. Tenant Model
5. Current Tenant Architecture
6. Tenant Resolution
7. Data Isolation
8. Tenant-Aware Resources
9. Tenant Lifecycle
10. Security Considerations
11. Current Status
12. Future Improvements

---

# 1. Multi-Tenancy Overview

Aegis is designed to operate as either:

- A hosted SaaS identity platform
- A self-hosted identity platform

The same codebase supports both deployment models.

---

## What is a Tenant?

A tenant represents an independent customer using the platform.

Examples include:

```
Acme Inc.

↓

Tenant A

--------------------

Globex Corp.

↓

Tenant B

--------------------

Example University

↓

Tenant C
```

Each tenant owns its own applications and, in the future, its own identity data.

---

# 2. Design Goals

The tenant architecture follows several principles.

---

## Isolation

Every tenant should only be able to access its own resources.

```
Tenant A

×

Tenant B Data
```

Cross-tenant access should never occur.

---

## Single Platform

A single deployment should host many organizations.

```
Internet

↓

Aegis

↓

Tenant A

Tenant B

Tenant C
```

No dedicated server is required per customer.

---

## Scalability

The architecture should scale from:

```
1 Tenant

↓

100 Tenants

↓

10,000 Tenants
```

without architectural changes.

---

## Optional Multi-Tenancy

Organizations that self-host Aegis may disable multi-tenancy entirely.

```
MULTI_TENANT=false
```

In this mode, tenant resolution becomes unnecessary.

---

# 3. SaaS Architecture

Hosted deployment:

```
Internet

↓

Aegis Platform

↓

Tenant

↓

Applications

↓

Users
```

Each tenant manages its own applications.

Future versions will also isolate users, roles, permissions, sessions, and audit logs.

---

## Deployment Models

### Hosted SaaS

```
Platform

↓

Many Tenants

↓

Many Applications
```

---

### Self Hosted

```
Organization

↓

Single Tenant

↓

Applications
```

The same APIs remain available in both deployments.

---

# 4. Tenant Model

A tenant represents an organization.

Typical information includes:

```
Tenant Name

Slug

Status

Owner

Configuration

Branding

Created At

Updated At
```

Future versions may additionally include:

- Billing
- Subscription Plan
- Domains
- SSO Configuration
- Branding Assets

---

# 5. Current Tenant Architecture

Current relationship:

```
Tenant

↓

Applications

↓

API Keys
```

Applications belong to a tenant.

API Keys belong to an application.

This part of the architecture is implemented.

---

## Current Scope

Currently tenant ownership exists primarily for:

- Applications
- API Keys

Other modules currently operate globally.

---

## Current Limitation

The following resources are **not yet tenant-isolated**:

- Users
- Roles
- Permissions
- Sessions
- Audit Logs

These resources currently exist globally across the platform.

---

# 6. Tenant Resolution

Incoming requests may identify a tenant.

Current middleware:

```
resolveTenant
```

Responsibilities include:

- Identify tenant
- Attach tenant information to the request
- Allow downstream services to access the current tenant

---

## Future Resolution Strategies

Possible tenant identification methods include:

### Domain

```
acme.aegis.dev

↓

Tenant
```

---

### Custom Domain

```
login.company.com

↓

Tenant
```

---

### Header

```
X-Tenant-ID

↓

Tenant
```

---

### JWT Claims

```
JWT

↓

tenantId

↓

Tenant
```

Multiple strategies may be supported simultaneously.

---

# 7. Data Isolation

Current isolation:

```
Tenant

↓

Applications
```

Future isolation:

```
Tenant

↓

Users

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
```

Every tenant-owned resource will include:

```
tenantId
```

---

## Query Filtering

Future repositories should automatically filter by tenant.

Instead of:

```
find()
```

Repositories will execute:

```
find({
    tenantId: currentTenant
})
```

This prevents accidental data leakage.

---

# 8. Tenant-Aware Resources

Future architecture:

```
Tenant

├── Users

├── Roles

├── Permissions

├── Applications

├── API Keys

├── Sessions

└── Audit Logs
```

Each resource belongs to exactly one tenant.

---

## User Relationships

Future design:

```
Tenant

↓

Users

↓

Sessions

↓

Authentication
```

A user should never belong to multiple tenants unless explicitly supported by future requirements.

---

## Role Relationships

Future design:

```
Tenant

↓

Roles

↓

Permissions
```

Role definitions remain independent for each organization.

---

# 9. Tenant Lifecycle

Typical lifecycle:

```
Create Tenant

↓

Configure Settings

↓

Create Applications

↓

Invite Users

↓

Assign Roles

↓

Begin Authentication
```

Future onboarding may automate several of these steps.

---

## Tenant Deletion

Future implementations should support:

- Soft Delete
- Account Suspension
- Data Export
- Permanent Removal

These operations are not currently implemented.

---

# 10. Security Considerations

---

## Tenant Isolation

Every query should include tenant filtering.

This is the most important security requirement for multi-tenant systems.

---

## Authorization

Permission evaluation should always occur within the current tenant.

Future flow:

```
Authenticated User

↓

Current Tenant

↓

Permissions

↓

Authorization
```

---

## Audit Logging

Audit events should include:

```
Tenant ID

User

Action

Timestamp
```

This enables tenant-specific audit history.

---

## API Keys

API Keys already inherit tenant ownership through their associated application.

Future authorization should ensure keys cannot access resources outside their tenant.

---

## Cross-Tenant Protection

Future repository implementations should prevent queries that omit tenant filtering.

This reduces the risk of accidental cross-tenant access.

---

# 11. Current Status

## Implemented

✅ Tenant Module

✅ Tenant Entity

✅ Application Ownership

✅ API Key Ownership

✅ Tenant Resolution Middleware

✅ Foundation for SaaS Deployments

---

## Partially Implemented

- Tenant-aware middleware exists.
- Applications are tenant-scoped.
- Remaining modules are still global.

---

## Not Implemented

- Tenant-scoped Users
- Tenant-scoped Roles
- Tenant-scoped Permissions
- Tenant-scoped Sessions
- Tenant-scoped Audit Logs
- Tenant-scoped Authentication
- Tenant Billing
- Organization Invitations
- Custom Domains
- Enterprise SSO

---

# 12. Future Improvements

## Complete Tenant Isolation

Every tenant-owned model should include:

```
tenantId
```

Repositories should automatically enforce tenant filtering.

---

## Tenant Provisioning

Future onboarding:

```
Create Tenant

↓

Create Default Roles

↓

Create Default Permissions

↓

Create Default Application

↓

Ready
```

---

## Custom Domains

Support:

```
auth.company.com

↓

Tenant
```

---

## Enterprise Identity

Future enterprise capabilities include:

- SAML
- SCIM
- LDAP
- OpenID Connect
- Active Directory Integration

---

## Billing & Subscription

Future SaaS features:

- Subscription Plans
- Usage Limits
- Seat Management
- Payment Integration

---

## Organization Management

Future features include:

- Teams
- Departments
- Invitations
- Organization Ownership
- Tenant Administration

---

# Multi-Tenant Summary

Aegis already includes the foundational building blocks for a hosted SaaS identity platform through its Tenant, Application, and API Key architecture.

At present, Applications are tenant-scoped while identity resources such as Users, Roles, Permissions, Sessions, and Audit Logs remain global. The architecture is intentionally designed so these resources can be fully tenant-isolated in future releases without requiring major changes to the application's overall structure.
