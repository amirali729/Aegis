# Aegis

> Version: 1.0
>
> Status: Design Phase
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
- Refresh Tokens
- Change Password

---

## Authorization

- Roles
- Permissions
- Policies

---

## Security

- JWT
- Refresh Tokens
- Cookie Authentication
- Password Hashing
- Session Management

---

## API

REST API

Future:

GraphQL (optional)

---

## SDK

Future SDKs

- TypeScript
- JavaScript
- Python
- Go

---

## Dashboard

Future web dashboard

For:

- Applications
- Users
- Roles
- Sessions
- API Keys

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

JWT

Refresh Tokens

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

✅ Project Structure

✅ Authentication Module

✅ DTO Pattern

✅ Repository Pattern

✅ Controller Pattern

✅ Result Pattern

✅ Response Pattern

✅ Error Pattern

✅ JWT

✅ Refresh Tokens

✅ Login

✅ Signup

✅ Logout

✅ Logout All

✅ Refresh Token

✅ Change Password

---

In Progress

- User Mapper
- Token Improvements
- Better Repository Abstraction

---

Not Started

- Email Verification
- Forgot Password
- Roles
- Permissions
- Dashboard
- SDK
- Multi Database
- Multi Tenant
- OAuth
- Webhooks

---

# 13. Future Roadmap

The project will evolve in stages.

Phase 1

Core Authentication

↓

Phase 2

Authorization

↓

Phase 3

Sessions

↓

Phase 4

Email

↓

Phase 5

Applications

↓

Phase 6

API Keys

↓

Phase 7

Dashboard

↓

Phase 8

SDK

↓

Phase 9

Self Hosted Support

↓

Phase 10

Hosted SaaS Platform

---

# Conclusion

The Aegis aims to become a complete authentication and authorization solution that can be deployed as either:

- Hosted SaaS

or

- Self Hosted

while sharing a single codebase.

The Aegis focuses exclusively on Identity and Access Management, allowing customer applications to remain responsible for their own business logic and domain models.
