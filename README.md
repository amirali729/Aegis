# Aegis

> A modern, modular, self-hostable and cloud-hosted Authentication & Authorization Platform for developers.

> **Status:** 🚧 Under Active Development

---

# Overview

Aegis is an open-source authentication and authorization service designed to eliminate the need for every project to implement authentication from scratch.

The project is being built with a clean architecture and is designed to support both:

- 🌐 Hosted Authentication as a Service (SaaS)
- 🏠 Self-Hosted Deployments

Developers can either:

- Use our hosted APIs
- Self-host the platform using Docker
- Integrate through official SDKs

The long-term goal is to build an identity platform similar to:

- Auth0
- Clerk
- Firebase Authentication
- Keycloak
- Supabase Auth

while remaining completely open-source and extensible.

---

# Goals

- Authentication as a Service
- Authorization Engine
- Multi-Tenant Architecture
- Self-Hosted Deployment
- Official SDKs
- Framework Integrations
- Enterprise Security
- Database Agnostic Storage
- Production Ready Infrastructure

---

# Features

## Authentication

- User Registration
- Login
- Logout
- Logout All Devices
- JWT Authentication
- Refresh Tokens
- Cookie Authentication
- Password Hashing
- Password Change
- Email Verification _(Planned)_
- Forgot Password _(Planned)_
- Password Reset _(Planned)_

---

## Authorization

- Roles
- Permissions
- RBAC
- Custom Roles
- Organization Roles
- Permission Middleware

---

## Session Management

- Multi Device Login
- Session Tracking
- Session Revocation
- Refresh Token Rotation
- Device Management

---

## Multi Tenancy

- Organizations
- Tenants
- Tenant Isolation
- Tenant Middleware

---

## SDKs (Planned)

Official SDKs will be available for

- JavaScript
- TypeScript
- React
- Next.js
- Node.js
- NestJS

---

## Enterprise Features (Planned)

- OAuth Providers
- Google Login
- GitHub Login
- Microsoft Login
- Discord Login
- Passkeys
- WebAuthn
- MFA
- SAML
- LDAP
- SCIM
- Audit Logs
- Webhooks

---

# Architecture

```
                Client

                   │

                   ▼

            HTTP / HTTPS API

                   │

                   ▼

             Express Server

                   │

            Authentication

                   │

           Authorization

                   │

              Controllers

                   │

               Services

                   │

            Repository Layer

                   │

         Storage Provider Layer

                   │

   MongoDB / PostgreSQL / MySQL
```

---

# Project Structure

```
src/

├── modules/
│
│   ├── auth/
│   ├── user/
│   ├── role/
│   ├── permission/
│   ├── organization/
│   ├── tenant/
│   ├── session/
│   ├── oauth/
│   ├── application/
│   └── api-key/
│
├── shared/
│
├── config/
│
├── infrastructure/
│
└── server.ts
```

---

# Tech Stack

## Backend

- TypeScript
- Node.js
- Express

## Database

Current

- MongoDB

Planned

- PostgreSQL
- MySQL

## Authentication

- JWT
- bcrypt
- Cookies

## Infrastructure

- Docker
- Docker Compose

Future

- Kubernetes
- Redis
- Nginx
- Prometheus
- Grafana

---

# Database Providers

The platform is designed to support multiple databases through repository abstractions.

Supported providers:

- MongoDB
- PostgreSQL _(Planned)_
- MySQL _(Planned)_

Only one provider is active at runtime.

---

# Deployment Modes

## Hosted SaaS

```
Developer

↓

Identity Platform API

↓

Authentication

↓

Authorization

↓

Database
```

No infrastructure required.

---

## Self Hosted

```
Docker Compose

↓

Identity Platform

↓

MongoDB / PostgreSQL / MySQL

↓

Redis
```

Customers own the infrastructure and data.

---

# Security

Security is one of the primary goals of this platform.

Current and planned protections include:

- JWT Authentication
- Refresh Token Rotation
- HTTP Only Cookies
- Secure Cookies
- Password Hashing
- Role Based Access Control
- CSRF Protection
- Rate Limiting
- Audit Logging
- Security Headers
- Secret Management

---

# Getting Started

## Clone

```bash
git clone https://github.com/<username>/Aegis.git

cd Aegis
```

---

## Install

```bash
npm install
```

---

## Environment

Create

```
.env
```

Example

```env
PORT=5000

MONGODB_URI=

ACCESS_TOKEN_SECRET=

REFRESH_TOKEN_SECRET=

ACCESS_TOKEN_EXPIRY=15m

REFRESH_TOKEN_EXPIRY=7d
```

---

## Development

```bash
npm run dev
```

---

## Build

```bash
npm run build
```

---

# Documentation

Project documentation is located in the `/docs` directory.

It covers:

- System Architecture
- Folder Structure
- Authentication
- Authorization
- SDK Design
- Multi-Tenant Architecture
- Infrastructure
- Security
- Deployment
- Development Roadmap

---

# Philosophy

The project follows a layered architecture.

```
HTTP

↓

Controller

↓

Service

↓

Repository

↓

Storage Provider

↓

Database
```

Business logic remains independent of the database implementation.

---

# Contributing

Contributions are welcome.

Future contribution guidelines will include:

- Coding Standards
- Architecture Guidelines
- Pull Request Workflow
- Commit Convention

---

# License

This project will be released under the MIT License.

---

# Inspiration

This project is inspired by modern identity platforms including:

- Auth0
- Clerk
- Firebase Authentication
- Keycloak
- Supabase Auth

The goal is not to clone these platforms but to build an extensible, open-source identity platform that supports both hosted and self-hosted deployments.

---

# Vision

Build an identity platform that developers can integrate into any application with minimal effort while maintaining complete control over deployment, scalability, and security.

The long-term vision is to provide a single platform that handles authentication, authorization, sessions, organizations, API keys, OAuth, and developer SDKs through a clean, modular, and production-ready architecture.
