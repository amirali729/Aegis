export interface SuccessEnvelope<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface ErrorEnvelope {
  success: false;
  statusCode: number;
  message: string;
  timestamp: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface LoginResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Session {
  id: string;
  deviceName: string;
  userAgent?: string;
  ipAddress?: string;
  lastActiveAt: string;
  createdAt: string;
  isCurrent: boolean;
}

export interface Permission {
  id: string;
  key: string;
  description?: string;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  permissions: string[];
  createdAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended';
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: string;
}

export interface Application {
  id: string;
  tenantId?: string;
  name: string;
  clientId: string;
  allowedOrigins: string[];
  redirectUris: string[];
  accessTokenTTL: string;
  refreshTokenTTL: string;
  isActive: boolean;
  createdAt: string;
}

export interface ApplicationCreated extends Application {
  clientSecret: string;
  warning: string;
}

export interface RegenerateSecretResult {
  clientId: string;
  clientSecret: string;
  warning: string;
}

export interface ApiKey {
  id: string;
  applicationId: string;
  name: string;
  keyPrefix: string;
  status: 'active' | 'revoked';
  expiresAt?: string;
  lastUsedAt?: string;
  createdAt: string;
}

export interface ApiKeyCreated extends ApiKey {
  key: string;
  warning: string;
}
