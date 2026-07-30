import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { Permission } from '../modules/permission/model/permission.model.js';
import { Role } from '../modules/role/model/role.model.js';
import dbConnection from '../shared/database/dbconnection.js';
import { DEFAULT_PERMISSIONS, DEFAULT_ROLES } from './rbac-defaults.js';

dotenv.config({ path: './src/shared/config/.env' });

async function seedRbac() {
  await dbConnection();

  const permissionIdByKey = new Map<string, string>();

  for (const permission of DEFAULT_PERMISSIONS) {
    // Scoped to tenantId: undefined (the platform-global permission set)
    // - now that key uniqueness is per-tenant, matching on `key` alone
    // could otherwise land on some tenant's own same-named permission.
    const doc = await Permission.findOneAndUpdate(
      { key: permission.key, tenantId: { $exists: false } },
      { key: permission.key, description: permission.description },
      { upsert: true, new: true },
    );
    permissionIdByKey.set(permission.key, doc._id.toString());
    console.log(`  permission ready: ${permission.key}`);
  }

  const allPermissionIds = Array.from(permissionIdByKey.values());

  for (const role of DEFAULT_ROLES) {
    const permissionIds =
      role.permissionKeys === '*'
        ? allPermissionIds
        : role.permissionKeys.map((key) => {
            const id = permissionIdByKey.get(key);
            if (!id) {
              throw new Error(`Role "${role.name}" references unknown permission key "${key}"`);
            }
            return id;
          });

    await Role.findOneAndUpdate(
      { name: role.name, tenantId: { $exists: false } },
      {
        $setOnInsert: {
          name: role.name,
          isSystem: role.isSystem,
        },
        $set: {
          description: role.description,
        },
        $addToSet: {
          permissions: { $each: permissionIds },
        },
      },
      { upsert: true, new: true },
    );
    console.log(`  role ready: ${role.name}`);
  }

  console.log('RBAC seed complete.');
  await mongoose.disconnect();
  process.exit(0);
}

seedRbac().catch((error) => {
  console.error('RBAC seed failed:', error);
  process.exit(1);
});
