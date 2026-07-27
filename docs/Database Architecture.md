# Aegis

> Version: 1.1
>
> Status: Reflects the current implementation (MongoDB implemented with repository abstraction. Multi-database support is planned but not yet implemented.)
>
> Document: 05 - Database Architecture

---

# Table of Contents

1. Database Overview
2. Database Goals
3. Database Architecture
4. Repository Pattern
5. Current Database Implementation
6. Core Collections
7. Relationships
8. Database Transactions
9. Data Integrity
10. Performance Considerations
11. Current Status
12. Future Improvements

---

# 1. Database Overview

The database layer is responsible for persisting all identity-related data while remaining isolated from business logic.

The application currently uses **MongoDB** with **Mongoose**, but the architecture is intentionally designed so business logic is not tightly coupled to MongoDB.

The long-term goal is to support multiple database providers without changing controllers or services.

---

# Responsibilities

The database stores:

- Users
- Sessions
- Roles
- Permissions
- Applications
- API Keys
- Tenants
- Audit Logs
- Email Verification Tokens
- Password Reset Tokens

The database does **not** store business-domain data such as:

- Products
- Orders
- Payments
- Inventory
- Blog Posts

---

# 2. Database Goals

The database architecture follows several principles.

---

## Database Agnostic Design

Business logic should never depend on MongoDB APIs.

Instead:

```
Controller

↓

Service

↓

Repository Interface

↓

Repository Implementation

↓

MongoDB
```

Future implementations can replace MongoDB without affecting upper layers.

---

## Separation of Concerns

Repositories own persistence.

Services own business rules.

Controllers own request orchestration.

Each layer has a single responsibility.

---

## Scalability

The schema is designed to support:

```
10 Users

↓

1,000 Users

↓

100,000 Users

↓

Millions of Users
```

without major architectural changes.

---

## Security

Sensitive values are never stored in plaintext.

Examples include:

- Passwords
- Refresh Tokens
- API Keys
- Verification Tokens
- Password Reset Tokens

---

# 3. Database Architecture

Current architecture:

```
Controller

↓

Service

↓

Repository

↓

Mongoose Model

↓

MongoDB
```

Repositories hide all database-specific operations.

Controllers and services never interact with Mongoose directly.

---

## Planned Architecture

Future database providers:

```
Repository

↓

Database Provider

├── MongoDB

├── PostgreSQL

└── MySQL
```

Only one provider would be active at runtime.

---

# 4. Repository Pattern

Every module owns its own repository.

Example

```
Auth

↓

IAuthRepository

↓

AuthRepository

↓

User Model
```

---

## Repository Responsibilities

Repositories only perform:

- Create
- Read
- Update
- Delete
- Queries

Repositories never perform:

- Password validation
- JWT creation
- Permission evaluation
- Business decisions

Those responsibilities belong to services.

---

## Error Handling

Repositories return:

```
Result<T, InfrastructureError>
```

Database failures are translated into infrastructure errors rather than leaking database-specific exceptions.

---

# 5. Current Database Implementation

The current implementation uses:

```
MongoDB

↓

Mongoose

↓

Module Models
```

Each business module owns its own schema.

Example

```
modules/

auth/model/user.model.ts

role/model/role.model.ts

permission/model/permission.model.ts

session/model/session.model.ts

application/model/application.model.ts

apikey/model/apikey.model.ts

tenant/model/tenant.model.ts

audit/model/audit.model.ts
```

This keeps schemas close to the business capability they represent.

---

## Database Connection

The active connection lives in:

```
src/shared/database/dbconnection.ts
```

The connection is initialized during application startup before the server begins accepting requests.

---

# 6. Core Collections

---

## Users

Stores user identity.

Typical information includes:

```
Email

Username

Password Hash

Email Verified

Roles

Profile Information

Created At

Updated At
```

Passwords are always stored as bcrypt hashes.

---

## Sessions

Each login creates a session.

Stores:

```
User

Hashed Refresh Token

Device

User Agent

IP Address

Created At

Last Used

Expires At

Revoked At
```

The raw refresh token is never stored.

---

## Roles

Stores authorization roles.

Example

```
Admin

Manager

Support

Editor
```

Roles contain permission references.

---

## Permissions

Stores individual capabilities.

Examples

```
user:create

user:update

role:create

audit:view
```

Permissions remain independent of users.

---

## Applications

Represents client applications integrating with Aegis.

Stores:

```
Application Name

Client ID

Client Secret

Allowed Origins

Redirect URIs

Tenant

Token Settings
```

Currently, `allowedOrigins` and `redirectUris` are stored but not yet enforced by an OAuth flow.

---

## API Keys

Stores server-to-server credentials.

Each key contains:

```
Application

Name

Key Prefix

Hashed Key

Expiry

Status

Last Used
```

Only the SHA-256 hash is persisted.

---

## Tenants

Represents SaaS customers.

Current implementation primarily scopes Applications.

Future versions will scope all tenant-owned resources.

---

## Audit Logs

Stores append-only security events.

Current events include:

- Signup
- Login
- Logout All
- Password Change
- Password Reset

Additional events will be added in future releases.

---

# 7. Relationships

Current relationship overview:

```
Tenant

│

├── Applications

│      │

│      └── API Keys

│

Users

│

├── Roles

│      │

│      └── Permissions

│

└── Sessions
```

Audit logs reference users and related actions.

---

## Authentication Relationships

```
User

↓

Sessions

↓

Refresh Tokens
```

One user can have many active sessions.

---

## Authorization Relationships

```
User

↓

Roles

↓

Permissions
```

A user may have multiple roles.

Each role may contain multiple permissions.

---

# 8. Database Transactions

Most operations currently consist of a single document update and therefore do not require database transactions.

Examples:

- Login
- Logout
- Session Creation
- Password Change

---

## Future Transaction Usage

Multi-document operations may use MongoDB transactions where appropriate.

Examples:

```
Create User

+

Create Audit Log

+

Create Default Resources
```

or

```
Create Application

+

Create Initial API Key
```

---

# 9. Data Integrity

The platform follows several integrity rules.

---

## Unique Constraints

Examples include:

- Email
- Username
- Client ID
- API Key Prefix (where applicable)

These prevent duplicate identities.

---

## Hashing

Sensitive values are hashed before persistence.

```
Passwords

↓

bcrypt

-----------------

Refresh Tokens

↓

SHA-256

-----------------

API Keys

↓

SHA-256

-----------------

Verification Tokens

↓

SHA-256

-----------------

Reset Tokens

↓

SHA-256
```

---

## Validation

Incoming requests are validated using Zod before reaching repositories.

This prevents invalid data from entering the database.

---

## Soft vs Hard Delete

Current implementation primarily uses direct deletion where appropriate.

Future enterprise deployments may adopt soft-delete strategies for selected resources.

---

# 10. Performance Considerations

Current design already supports:

- Independent collections
- Repository isolation
- Efficient session lookups
- Permission evaluation
- API Key lookup
- JWT verification without database access

---

## Future Optimizations

Future improvements include:

### Redis Cache

```
Permission Evaluation

↓

Redis

↓

Application
```

---

### Read Replicas

Large deployments may separate:

```
Writes

↓

Primary Database

Reads

↓

Read Replicas
```

---

### Multi-Database Support

Future providers:

```
MongoDB

PostgreSQL

MySQL
```

---

### Index Optimization

Additional indexes may be introduced for:

- Sessions
- Audit Logs
- API Keys
- Tenant Queries

---

# 11. Current Status

## Implemented

✅ MongoDB

✅ Mongoose Models

✅ Repository Pattern

✅ Module-Owned Schemas

✅ Session Storage

✅ Role Storage

✅ Permission Storage

✅ Application Storage

✅ API Key Storage

✅ Tenant Storage

✅ Audit Log Storage

✅ Password Hashing

✅ Refresh Token Hashing

---

## Partially Implemented

- Repository abstraction exists, but only MongoDB is implemented.
- Multi-tenant isolation currently applies primarily to Applications.

---

## Not Implemented

- PostgreSQL Provider
- MySQL Provider
- Database Provider Factory
- Cross-Database Abstraction Layer
- Redis Cache
- Read Replicas
- Database Sharding

---

# 12. Future Improvements

## Multi-Database Support

Implement providers for:

- PostgreSQL
- MySQL

without changing business logic.

---

## Complete Tenant Isolation

Every tenant-owned document should include:

```
tenantId
```

Every query should automatically filter by tenant.

---

## Distributed Caching

Introduce Redis for:

- Permission Caching
- Session Caching
- Rate Limiting

---

## Audit Expansion

Persist additional events including:

- Role Changes
- Permission Changes
- API Key Operations
- Tenant Operations
- Application Operations

---

## Production Scaling

Future infrastructure may include:

```
Application

↓

Redis

↓

MongoDB Replica Set

↓

Backups

↓

Monitoring
```

---

# Database Summary

The current database architecture is built around MongoDB, Mongoose, and the Repository Pattern, providing a clean separation between persistence and business logic.

Sensitive data is securely hashed before storage, repositories isolate database access, and each business capability owns its own schema. The architecture is intentionally designed to support future database providers such as PostgreSQL and MySQL while keeping services and controllers unchanged.
