export const authPaths = {
  '/api/v1/auth/signup': {
    post: {
      tags: ['Auth'],
      summary: 'Register a new account',
      description:
        "Creates a user, assigns the default 'User' role if RBAC has been seeded, and sends an email verification link.",
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/SignUpRequest' },
          },
        },
      },
      responses: {
        '201': {
          description: 'Account created',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/MessageResult' },
                  {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/User' },
                    },
                  },
                ],
              },
            },
          },
        },
        '409': {
          description: 'Email or username already exists',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        '429': { description: 'Rate limited' },
      },
    },
  },

  '/api/v1/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Log in',
      description:
        'On success, sets `accessToken`/`refreshToken` HttpOnly cookies and also returns both tokens in the response body for non-browser clients.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/LoginRequest' },
          },
        },
      },
      responses: {
        '200': { description: 'Logged in' },
        '401': {
          description: 'Invalid username or password',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        '429': { description: 'Rate limited' },
      },
    },
  },

  '/api/v1/auth/refresh': {
    post: {
      tags: ['Auth'],
      summary: 'Rotate an access/refresh token pair',
      description:
        'Reads the `refreshToken` cookie, verifies it, and issues a new token pair (refresh token rotation).',
      responses: {
        '200': { description: 'New tokens issued' },
        '401': { description: 'Missing, invalid, or expired refresh token' },
      },
    },
  },

  '/api/v1/auth/verifyEmail': {
    post: {
      tags: ['Auth'],
      summary: 'Verify an email address',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/VerifyEmailRequest' },
          },
        },
      },
      responses: {
        '200': { description: 'Email verified' },
        '400': {
          description: 'Invalid or expired token',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },

  '/api/v1/auth/resendVerification': {
    post: {
      tags: ['Auth'],
      summary: 'Resend the verification email',
      description:
        'Always returns the same generic message whether or not the email exists, to prevent account enumeration.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ResendVerificationRequest',
            },
          },
        },
      },
      responses: {
        '200': { description: 'Request accepted' },
        '429': { description: 'Rate limited (max 5/hour)' },
      },
    },
  },

  '/api/v1/auth/forgotPassword': {
    post: {
      tags: ['Auth'],
      summary: 'Request a password reset email',
      description:
        'Always returns the same generic message whether or not the email exists, to prevent account enumeration.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ForgotPasswordRequest' },
          },
        },
      },
      responses: {
        '200': { description: 'Request accepted' },
        '429': { description: 'Rate limited (max 5/hour)' },
      },
    },
  },

  '/api/v1/auth/resetPassword': {
    post: {
      tags: ['Auth'],
      summary: 'Reset password using an emailed token',
      description:
        'Also revokes all existing sessions - the user will need to log in again on every device.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ResetPasswordRequest' },
          },
        },
      },
      responses: {
        '200': { description: 'Password reset' },
        '400': {
          description: 'Invalid/expired token or password mismatch',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },

  '/api/v1/auth/logout': {
    post: {
      tags: ['Auth'],
      summary: 'Log out of the current session',
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
      responses: {
        '200': { description: 'Logged out' },
        '401': { description: 'Not authenticated' },
      },
    },
  },

  '/api/v1/auth/logoutAll': {
    post: {
      tags: ['Auth'],
      summary: 'Log out of every session/device',
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
      responses: {
        '200': { description: 'Logged out everywhere' },
        '401': { description: 'Not authenticated' },
      },
    },
  },

  '/api/v1/auth/changePassword': {
    post: {
      tags: ['Auth'],
      summary: 'Change password while logged in',
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ChangePasswordRequest',
            },
          },
        },
      },
      responses: {
        '200': { description: 'Password changed' },
        '401': { description: 'Current password incorrect / not authenticated' },
      },
    },
  },
};
