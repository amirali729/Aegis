/**
 * Shared OpenAPI 3.0 components. Every module's path spec ($ref)s into
 * these instead of redefining the response envelope / entity shapes.
 */
export const openapiComponents = {
  securitySchemes: {
    cookieAuth: {
      type: 'apiKey',
      in: 'cookie',
      name: 'accessToken',
      description: 'Set automatically by /auth/login and /auth/refresh as an HttpOnly cookie.',
    },
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description:
        'Alternative to cookieAuth - send the access token as `Authorization: Bearer <token>`.',
    },
    apiKeyAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'X-API-Key',
      description: 'Server-to-server auth for Applications. Presented instead of a user session.',
    },
  },

  schemas: {
    ErrorResponse: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        statusCode: { type: 'integer', example: 400 },
        message: { type: 'string', example: 'Validation failed.' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },

    MessageResult: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        statusCode: { type: 'integer', example: 200 },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: { message: { type: 'string' } },
        },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },

    User: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '665f1a2b3c4d5e6f7a8b9c0d' },
        username: { type: 'string', example: 'jane_doe' },
        email: { type: 'string', format: 'email' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },

    SignUpRequest: {
      type: 'object',
      required: ['username', 'email', 'password'],
      properties: {
        username: { type: 'string', example: 'jane_doe' },
        email: { type: 'string', format: 'email', example: 'jane@example.com' },
        password: {
          type: 'string',
          format: 'password',
          minLength: 8,
          example: 'correct-horse-battery',
        },
      },
    },

    LoginRequest: {
      type: 'object',
      required: ['username', 'password'],
      properties: {
        username: { type: 'string' },
        password: { type: 'string', format: 'password' },
      },
    },

    ChangePasswordRequest: {
      type: 'object',
      required: ['oldPassword', 'newPassword', 'confirmPassword'],
      properties: {
        oldPassword: { type: 'string', format: 'password' },
        newPassword: { type: 'string', format: 'password', minLength: 8 },
        confirmPassword: { type: 'string', format: 'password' },
      },
    },

    ForgotPasswordRequest: {
      type: 'object',
      required: ['email'],
      properties: { email: { type: 'string', format: 'email' } },
    },

    ResendVerificationRequest: {
      type: 'object',
      required: ['email'],
      properties: { email: { type: 'string', format: 'email' } },
    },

    ResetPasswordRequest: {
      type: 'object',
      required: ['token', 'newPassword', 'confirmPassword'],
      properties: {
        token: { type: 'string' },
        newPassword: { type: 'string', format: 'password', minLength: 8 },
        confirmPassword: { type: 'string', format: 'password' },
      },
    },

    VerifyEmailRequest: {
      type: 'object',
      required: ['token'],
      properties: { token: { type: 'string' } },
    },

    Permission: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        key: { type: 'string', example: 'role:create' },
        description: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },

    CreatePermissionRequest: {
      type: 'object',
      required: ['key'],
      properties: {
        key: {
          type: 'string',
          pattern: '^[a-z0-9_]+:[a-z0-9_]+$',
          example: 'invoice:view',
        },
        description: { type: 'string' },
      },
    },

    UpdatePermissionRequest: {
      type: 'object',
      properties: { description: { type: 'string' } },
    },

    Role: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string', example: 'Admin' },
        description: { type: 'string' },
        isSystem: { type: 'boolean' },
        permissions: {
          type: 'array',
          items: { type: 'string' },
          example: ['role:view', 'role:create'],
        },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },

    CreateRoleRequest: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', example: 'Billing Manager' },
        description: { type: 'string' },
        permissionIds: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },

    UpdateRoleRequest: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
      },
    },

    SetRolePermissionsRequest: {
      type: 'object',
      required: ['permissionIds'],
      properties: {
        permissionIds: { type: 'array', items: { type: 'string' } },
      },
    },

    AssignRoleRequest: {
      type: 'object',
      required: ['roleId'],
      properties: { roleId: { type: 'string' } },
    },

    AssignRoleResult: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        roles: { type: 'array', items: { type: 'string' } },
        message: { type: 'string' },
      },
    },

    Tenant: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string', example: 'Acme Inc.' },
        slug: { type: 'string', example: 'acme-inc' },
        status: { type: 'string', enum: ['active', 'suspended'] },
        plan: { type: 'string', enum: ['free', 'pro', 'enterprise'] },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },

    CreateTenantRequest: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', example: 'Acme Inc.' },
        slug: { type: 'string', example: 'acme-inc' },
        plan: { type: 'string', enum: ['free', 'pro', 'enterprise'] },
      },
    },

    UpdateTenantRequest: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        status: { type: 'string', enum: ['active', 'suspended'] },
        plan: { type: 'string', enum: ['free', 'pro', 'enterprise'] },
      },
    },

    Application: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        tenantId: { type: 'string', nullable: true },
        name: { type: 'string', example: 'Marketing Website' },
        clientId: { type: 'string', example: 'client_9f2a...' },
        allowedOrigins: { type: 'array', items: { type: 'string' } },
        redirectUris: { type: 'array', items: { type: 'string' } },
        accessTokenTTL: { type: 'string', example: '15m' },
        refreshTokenTTL: { type: 'string', example: '7d' },
        isActive: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },

    ApplicationCreated: {
      allOf: [
        { $ref: '#/components/schemas/Application' },
        {
          type: 'object',
          properties: {
            clientSecret: {
              type: 'string',
              example: 'secret_7c1f...',
              description: 'Shown only once - store it now.',
            },
            warning: { type: 'string' },
          },
        },
      ],
    },

    RegenerateSecretResult: {
      type: 'object',
      properties: {
        clientId: { type: 'string' },
        clientSecret: { type: 'string' },
        warning: { type: 'string' },
      },
    },

    CreateApplicationRequest: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', example: 'Marketing Website' },
        allowedOrigins: {
          type: 'array',
          items: { type: 'string' },
          example: ['https://example.com'],
        },
        redirectUris: {
          type: 'array',
          items: { type: 'string' },
          example: ['https://example.com/callback'],
        },
        accessTokenTTL: { type: 'string', example: '15m' },
        refreshTokenTTL: { type: 'string', example: '7d' },
      },
    },

    UpdateApplicationRequest: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        allowedOrigins: { type: 'array', items: { type: 'string' } },
        redirectUris: { type: 'array', items: { type: 'string' } },
        accessTokenTTL: { type: 'string' },
        refreshTokenTTL: { type: 'string' },
        isActive: { type: 'boolean' },
      },
    },

    ApiKey: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        applicationId: { type: 'string' },
        name: { type: 'string', example: 'Production server' },
        keyPrefix: { type: 'string', example: 'sk_9f2a1b2c' },
        status: { type: 'string', enum: ['active', 'revoked'] },
        expiresAt: { type: 'string', format: 'date-time', nullable: true },
        lastUsedAt: { type: 'string', format: 'date-time', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },

    ApiKeyCreated: {
      allOf: [
        { $ref: '#/components/schemas/ApiKey' },
        {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              example: 'sk_9f2a1b2c3d4e5f...',
              description: 'Shown only once - store it now.',
            },
            warning: { type: 'string' },
          },
        },
      ],
    },

    CreateApiKeyRequest: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', example: 'Production server' },
        expiresInDays: { type: 'integer', minimum: 1, maximum: 3650 },
      },
    },
  },
} as const;
