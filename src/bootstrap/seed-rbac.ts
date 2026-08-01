import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { Permission } from '../modules/permission/model/permission.model.js';
import dbConnection from '../shared/database/dbconnection.js';
import { DEFAULT_PERMISSIONS } from './rbac-defaults.js';

dotenv.config({ path: './src/shared/config/.env' });

/**
 * Seeds the global (tenantId: undefined) permission catalog. Roles are
 * NOT seeded here anymore - platform-level access is now a fixed
 * User.platformRole enum (see shared/security/authorization/
 * platform-roles.ts), and org-level roles are created per-organization
 * on demand (see organizations/service/organization.service.impl.ts,
 * provisionOwner, which auto-creates an org-scoped "Owner" role granted
 * every permission seeded here).
 */
async function seedRbac() {
  await dbConnection();

  for (const permission of DEFAULT_PERMISSIONS) {
    // Scoped to tenantId: undefined (the platform-global permission set)
    // - now that key uniqueness is per-tenant, matching on `key` alone
    // could otherwise land on some tenant's own same-named permission.
    await Permission.findOneAndUpdate(
      { key: permission.key, tenantId: { $exists: false } },
      { key: permission.key, description: permission.description },
      { upsert: true, new: true },
    );
    console.log(`  permission ready: ${permission.key}`);
  }

  console.log('RBAC seed complete.');
  await mongoose.disconnect();
  process.exit(0);
}

seedRbac().catch((error) => {
  console.error('RBAC seed failed:', error);
  process.exit(1);
});
