# Aegis

> Version: 1.1
>
> Status: Reflects the current implementation (RBAC fully implemented using Roles, Permissions, Permission Evaluation Middleware, Applications, and API Keys)
>
> Document: 06 - Authorization Architecture

---

# Table of Contents

1. Authorization Overview
2. Authorization Goals
3. Authorization Flow
4. Authorization Components
5. Roles
6. Permissions
7. Permission Evaluation
8. Route Protection
9. API Key Authorization
10. Multi-Tenant Authorization
11. Security Considerations
12. Current Status
13. Future Improvements

---

# 1. Authorization Overview

Authorization determines **what an authenticated user is allowed to do**.

Authentication answers:

> **Who are you?**

Authorization answers:

> **What are you allowed to access?**

The two systems are completely independent.

Authentication must succeed before authorization begins.

---

# Responsibilities

The Authorization module currently manages:

- Roles
- Permissions
- Role Assignment
- Permission Assignment
- Permission Evaluation
- Route Protection
- API Key Authorization

Future responsibilities include:

- Attribute-Based Access Control (ABAC)
- Policy Engine
- Organization-level Permissions
- Resource Ownership Rules
- Conditional Access Policies

---

# 2. Authorization Goals

The authorization system was designed around several principles.

## Least Privilege

Every user should receive only the permissions they require.

Example

```
Support Agent

↓

Read Users

Reset Passwords

View Sessions

×

Delete Users

×

Manage Roles
```

---

## Role-Based Access Control

Permissions are assigned to roles.

Users receive permissions indirectly through their assigned roles.

```
Permission

↓

Role

↓

User
```

This simplifies permission management.

---

## Centralized Permission Evaluation

Permissions should never be checked manually inside controllers.

Instead, authorization should happen before business logic executes.

---

## Extensible Design

The system should allow future authorization models without rewriting the existing implementation.

Examples

- ABAC
- Policy Engine
- Resource Ownership
- Tenant Isolation

---

# 3. Authorization Flow

Every protected request follows the same flow.

```
Client

↓

JWT Verification

↓

Authenticated User

↓

Permission Middleware

↓

Permission Evaluator

↓

Controller

↓

Service

↓

Repository

↓

Response
```

If permission evaluation fails, the request never reaches the controller.

---

# 4. Authorization Components

```
Authorization

├── Roles

├── Permissions

├── Permission Assignment

├── Role Assignment

├── Permission Evaluation

├── Route Protection

└── API Key Authorization
```

Supporting modules:

- Authentication
- Session
- Tenant
- Audit
- Application

---

# 5. Roles

Roles are collections of permissions.

Users never receive application capabilities directly.

Instead:

```
Permission

↓

Role

↓

User
```

Example

```
Admin

↓

user:create

user:update

user:delete

role:create

role:update

role:delete
```

---

## Role Lifecycle

```
Create Role

↓

Assign Permissions

↓

Assign Users

↓

Permission Evaluation
```

---

## Example Roles

The platform supports custom roles.

Typical examples include:

```
Admin

Manager

Editor

Support

Viewer
```

No roles are hardcoded.

Everything is stored in the database.

---

# 6. Permissions

Permissions represent individual capabilities.

Examples

```
user:create

user:update

user:delete

role:create

role:update

permission:assign

application:create

apikey:create

audit:view

session:revoke
```

Each permission should describe a single action.

---

## Permission Naming

Permissions follow a consistent pattern.

```
resource:action
```

Examples

```
user:create

user:update

tenant:create

application:update

apikey:revoke
```

This keeps authorization predictable and easy to understand.

---

# Permission Assignment

Permissions are assigned only to roles.

```
Permission

↓

Role

↓

User
```

Users inherit every permission from every assigned role.

---

# 7. Permission Evaluation

Permission evaluation happens before controller execution.

Flow

```
Request

↓

verifyJwt

↓

Authenticated User

↓

Load Roles

↓

Collect Permissions

↓

Union Permissions

↓

Permission Check

↓

Allow / Deny
```

The platform evaluates the complete permission set across all assigned roles.

---

## Permission Evaluator

Current implementation uses a centralized permission evaluator.

Responsibilities include:

- Reading user roles
- Collecting permissions
- Removing duplicates
- Returning the final permission set

Controllers never perform permission calculations.

---

## Multiple Roles

A user may have multiple roles.

Example

```
User

↓

Editor

↓

Support

↓

Final Permission Set

↓

Union(Editor, Support)
```

Duplicate permissions are automatically ignored.

---

# 8. Route Protection

Protected routes declare required permissions.

Example

```
verifyJwt

↓

requirePermission("user:create")

↓

Controller
```

If the permission exists:

```
HTTP 200
```

Otherwise:

```
HTTP 403 Forbidden
```

Business logic never executes when authorization fails.

---

## Authorization Middleware

Current middleware includes:

```
verifyJwt

↓

requirePermission()
```

The middleware runs before controllers.

---

## Example Flow

```
GET /users

↓

JWT Valid

↓

Permission Exists

↓

Controller

↓

Repository

↓

Response
```

Without permission:

```
GET /users

↓

JWT Valid

↓

Permission Missing

↓

403 Forbidden
```

---

# 9. API Key Authorization

The platform supports server-to-server authorization using API Keys.

Flow

```
Application

↓

Generate API Key

↓

Store SHA-256 Hash

↓

Return Raw Key Once

↓

Client Sends

X-API-Key

↓

Hash Incoming Key

↓

Compare Hash

↓

Authenticated Application
```

The raw API Key is never stored.

---

## API Key Information

Each API Key stores:

```
Name

Key Prefix

Hashed Key

Status

Expiry

Last Used

Application
```

The visible prefix helps identify keys in dashboards and audit logs.

---

## Authorization

API Keys authenticate applications rather than users.

This is intended for:

- Backend Services
- Microservices
- Automation
- CLI Tools
- Scheduled Jobs

---

# 10. Multi-Tenant Authorization

The platform includes the foundation for tenant-aware authorization.

Current state:

```
Tenant

↓

Applications

↓

API Keys
```

Applications belong to tenants.

---

## Current Limitation

Only Applications are fully tenant-scoped today.

The following resources are **not yet isolated**:

- Users
- Roles
- Permissions
- Audit Logs
- Sessions

These resources currently operate globally.

---

## Planned Flow

Future authorization will automatically include:

```
Current Tenant

↓

Permission Evaluation

↓

Database Query

↓

Tenant Filter

↓

Authorized Data
```

Every tenant-owned resource will include:

```
tenantId
```

This prevents cross-tenant access.

---

# 11. Security Considerations

The authorization layer follows several security principles.

---

## Default Deny

Missing permission

↓

Access Denied

Permissions are never assumed.

---

## No Hardcoded Roles

Role names never determine access.

Permissions determine access.

---

## Centralized Checks

Controllers never implement authorization logic.

Everything flows through middleware.

---

## Database Driven

Roles and permissions are stored in the database.

No code deployment is required when authorization changes.

---

## Audit Logging

Current audit coverage includes authentication events.

Future versions should also audit:

- Role Creation
- Role Updates
- Role Assignment
- Permission Assignment
- Permission Removal
- API Key Creation
- API Key Revocation
- Tenant Changes

---

## API Key Security

API Keys are:

- Randomly generated
- SHA-256 hashed
- Displayed once
- Individually revocable
- Independently expirable

---

# 12. Current Status

## Implemented

✅ Role Management

✅ Permission Management

✅ Role Assignment

✅ Permission Assignment

✅ Permission Evaluation

✅ JWT Route Protection

✅ Permission Middleware

✅ API Key Authentication

✅ Applications

✅ Permission Union Across Multiple Roles

---

## Partially Implemented

- Tenant-aware authorization exists only for Applications.
- Audit logging does not yet cover all authorization events.

---

## Not Implemented

- ABAC (Attribute-Based Access Control)
- Policy Engine
- Resource Ownership Rules
- Organization-level Authorization
- Conditional Access
- Time-based Permissions
- IP-based Authorization
- Dynamic Permission Expressions

---

# 13. Future Improvements

## Full Tenant Isolation

Every authorization query should include:

```
tenantId

↓

Permission Check

↓

Database Filter
```

---

## Expanded Audit Coverage

Every authorization-sensitive action should generate an audit event.

Examples

- Assign Role
- Remove Role
- Create Permission
- Delete Permission
- Revoke API Key

---

## Attribute-Based Access Control

Future permissions may depend on:

- Department
- Resource Owner
- Project
- Organization
- Environment
- Time

instead of only roles.

---

## Policy Engine

Example

```
Managers

↓

Can Edit

↓

Only Their Department
```

This is more expressive than RBAC alone.

---

## Permission Caching

Future versions may cache evaluated permissions using Redis.

```
User

↓

Permission Evaluation

↓

Redis Cache

↓

Application
```

This reduces repeated database lookups for high-traffic systems.

---

# Authorization Summary

The current authorization architecture provides a complete Role-Based Access Control (RBAC) system built around roles, permissions, centralized permission evaluation, route protection, and API Key authentication.

Authorization decisions are made before business logic executes, ensuring consistent enforcement across the platform.

The remaining work focuses on enterprise authorization capabilities such as full tenant isolation, expanded audit coverage, Attribute-Based Access Control (ABAC), policy evaluation, and distributed permission caching.
