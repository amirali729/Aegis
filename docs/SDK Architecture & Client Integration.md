# Aegis

> Version: 1.1
>
> Status: Reflects the current implementation (TypeScript SDK Core completed. Framework-specific SDKs are planned.)
>
> Document: 09 - SDK Architecture & Client Integration

---

# Table of Contents

1. SDK Overview
2. Design Goals
3. SDK Architecture
4. SDK Core
5. Authentication Flow
6. Session Management
7. HTTP Client
8. Event System
9. Framework Integrations
10. Smoke Testing
11. Current Status
12. Future Improvements

---

# 1. SDK Overview

The Aegis SDK allows applications to communicate with the Identity Platform without manually constructing HTTP requests.

Instead of interacting directly with REST endpoints, applications use a strongly typed TypeScript client.

Example

```
Application

↓

Aegis SDK

↓

REST API

↓

Identity Platform
```

The SDK is framework-agnostic and works in:

- Node.js
- React
- Next.js
- Vue
- Angular
- CLI Applications

The SDK never communicates directly with the database.

It only interacts with the public REST API.

---

# Responsibilities

The SDK currently provides:

- Authentication
- Session Management
- Automatic Token Refresh
- Token Storage
- HTTP Client
- Event System
- Retry After Refresh
- Typed API Methods

Future SDKs will build on top of the SDK Core.

---

# 2. Design Goals

The SDK was designed around several principles.

---

## Framework Agnostic

The SDK should work anywhere JavaScript or TypeScript runs.

```
Browser

↓

Node

↓

React

↓

Next.js

↓

CLI
```

The SDK Core contains no framework-specific code.

---

## Minimal Configuration

Getting started should require only a few lines.

```
Create Client

↓

Configure Base URL

↓

Login

↓

Use API
```

---

## Automatic Authentication

Applications should never manually refresh access tokens.

The SDK manages authentication automatically.

---

## Strong Typing

Every request and response should be fully typed.

This provides:

- Better IntelliSense
- Compile-time safety
- Easier development

---

# 3. SDK Architecture

Current architecture

```
Application

↓

SDK Core

↓

HTTP Client

↓

REST API

↓

Identity Platform
```

The SDK Core contains reusable infrastructure used by every future SDK.

---

## Planned Architecture

```
SDK

├── Core

├── React

├── Next.js

├── Node

├── NestJS

├── Vue

└── Angular
```

Every higher-level SDK depends on the Core package.

---

# 4. SDK Core

The SDK Core is fully implemented.

Responsibilities include:

```
Authentication

↓

Token Storage

↓

HTTP Client

↓

Session Management

↓

Automatic Refresh

↓

Events
```

The Core package is framework independent.

---

## Authentication Module

Provides methods such as:

- Login
- Signup
- Logout
- Logout All
- Refresh Session
- Password Recovery
- Email Verification

Authentication mirrors the backend API.

---

## Typed Modules

The SDK exposes typed clients for backend modules including:

- Authentication
- Sessions
- Roles
- Permissions
- Applications
- API Keys
- Audit
- Tenants

Each module corresponds to a backend module.

---

# 5. Authentication Flow

The SDK automatically manages authentication.

Flow

```
Login

↓

Receive Cookies / Tokens

↓

Store Authentication

↓

Authenticated Requests

↓

401 Received

↓

Refresh Session

↓

Retry Original Request

↓

Continue
```

Applications never need to manually retry failed requests after token expiration.

---

## Automatic Token Refresh

When an access token expires:

```
API Request

↓

401 Unauthorized

↓

Refresh Endpoint

↓

New Access Token

↓

Retry Original Request

↓

Return Response
```

The retry process is automatic.

---

## Concurrent Refresh Protection

If multiple requests receive:

```
401
```

simultaneously:

```
Request A

↓

Refresh

↓

New Token

↓

Waiting Requests Reuse Same Refresh

↓

Continue
```

Only one refresh request is sent.

Other requests wait for the result.

This prevents refresh storms.

---

# 6. Session Management

The SDK understands user sessions.

Capabilities include:

- List Sessions
- Current Session
- Logout Current Session
- Logout All Sessions

Session information is synchronized with the backend API.

---

## Token Storage

The SDK stores authentication state through a dedicated storage layer.

Responsibilities include:

- Read Tokens
- Save Tokens
- Remove Tokens
- Update Tokens

The storage implementation is abstracted, allowing different environments to provide their own persistence mechanism.

---

# 7. HTTP Client

Every SDK request passes through the built-in HTTP client.

```
Application

↓

SDK Method

↓

HTTP Client

↓

REST API

↓

Response
```

Responsibilities include:

- Base URL handling
- Headers
- Authentication
- Error handling
- Retry after refresh

Applications do not need to manually configure every request.

---

## Request Pipeline

```
SDK Method

↓

Build Request

↓

Attach Authentication

↓

HTTP Request

↓

Response

↓

Typed Object
```

---

## Error Handling

The SDK converts HTTP responses into consistent error objects.

Examples include:

- Validation Errors
- Authentication Errors
- Authorization Errors
- Network Errors

This provides a predictable developer experience.

---

# 8. Event System

The SDK exposes an event system for authentication-related changes.

Typical events include:

```
Login

↓

Logout

↓

Token Refreshed

↓

Authentication Failure

↓

Session Expired
```

Applications can subscribe to these events to update their UI.

Example use cases:

- Redirect to Login
- Update User State
- Display Notifications
- Clear Cached Data

---

# 9. Framework Integrations

Current implementation:

```
SDK Core

↓

Complete
```

Planned integrations:

```
React SDK

↓

React Hooks

------------------

Next.js SDK

↓

Server Components

↓

Middleware Helpers

------------------

Node SDK

↓

Backend Services

------------------

NestJS SDK

↓

Dependency Injection

------------------

Vue SDK

↓

Composables

------------------

Angular SDK

↓

Services
```

These packages will wrap the SDK Core rather than duplicate its functionality.

---

# 10. Smoke Testing

The SDK Core has been validated using smoke tests.

Current coverage includes:

✅ Basic Login

✅ Refresh Failure

✅ Automatic Refresh

✅ Token Persistence

✅ Concurrent Refresh

✅ Session Endpoints

✅ Logout

✅ Logout All

---

## Example Output

```text
Logged in as: jane

Sessions: [...]

Refresh Count: 1

Protected Calls: 2

SMOKE TEST PASSED
```

These tests verify the complete authentication lifecycle.

---

# 11. Current Status

## Implemented

✅ SDK Core

✅ Authentication

✅ HTTP Client

✅ Automatic Token Refresh

✅ Token Storage

✅ Session Management

✅ Retry After Refresh

✅ Event System

✅ Typed API Modules

✅ Smoke Tests

---

## Partially Implemented

- Framework-specific wrappers are planned but not yet available.
- Package publishing workflow exists conceptually but public package distribution has not yet begun.

---

## Not Implemented

- React SDK

- Next.js SDK

- Vue SDK

- Angular SDK

- NestJS SDK

- React Native SDK

- Flutter SDK

- Offline Synchronization

- Automatic Request Caching

---

# 12. Future Improvements

## Framework Packages

Future packages include:

```
@aegis/core

↓

@aegis/react

↓

@aegis/next

↓

@aegis/node

↓

@aegis/nest
```

All packages will build on the SDK Core.

---

## Request Caching

Future versions may cache selected responses.

```
Request

↓

Cache

↓

Network

↓

Response
```

This can improve performance for frequently accessed data.

---

## Offline Support

Potential future capabilities:

- Request Queueing
- Offline Authentication State
- Background Synchronization

---

## Additional Integrations

Future integrations may include:

- React Query
- TanStack Query
- SWR
- Axios Adapter
- Fetch Adapter

---

## Package Distribution

The SDK will eventually be distributed through npm with automated releases generated from the project's release workflow.

---

# SDK Summary

The Aegis SDK is centered around a completed, framework-agnostic TypeScript Core package that provides authentication, session management, automatic token refresh, typed API clients, an event system, and a reusable HTTP client.

Framework-specific SDKs such as React, Next.js, Vue, Angular, and NestJS are planned to build on this Core package, ensuring consistent behavior across every integration while avoiding duplicated implementation.
