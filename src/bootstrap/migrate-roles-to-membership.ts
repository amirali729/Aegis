import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { Membership } from '../modules/membership/model/membership.model.js';
import { Role } from '../modules/role/model/role.model.js';
import dbConnection from '../shared/database/dbconnection.js';

dotenv.config({ path: './src/shared/config/.env' });

/**
 * One-time migration for deployments that had data under the OLD
 * architecture (roles attached directly to User.roles) before this
 * refactor. Safe to run on a fresh install too - it's a no-op if no
 * documents carry a legacy `roles` field.
 *
 * For every user with a legacy `roles` array:
 *  - A reference to the old global "Admin" role (tenantId: undefined,
 *    name: "Admin") becomes User.platformRole = 'owner'. This is a
 *    best-effort mapping - "Admin" granted every permission via '*',
 *    the closest equivalent under the new fixed platform-role model is
 *    Platform Owner. Review who this affects before running against
 *    production data (see the dry-run flag below).
 *  - A reference to the old global "User" role is dropped with no
 *    replacement - every user already defaults to platformRole: 'user'
 *    on the new schema, so it carried no information.
 *  - A reference to any ORG-SCOPED role (tenantId set) is moved onto
 *    that user's Membership for that organization (creating the
 *    Membership if one doesn't already exist, since the old
 *    architecture allowed a role reference without a Membership).
 *
 * The legacy `roles` field is read directly off the raw `users`
 * collection rather than through the User model, because User's
 * Mongoose schema no longer declares that field at all.
 *
 * Usage:
 *   npx tsx src/bootstrap/migrate-roles-to-membership.ts --dry-run
 *   npx tsx src/bootstrap/migrate-roles-to-membership.ts
 */

interface LegacyUserDoc {
  _id: mongoose.Types.ObjectId;
  email?: string;
  roles?: mongoose.Types.ObjectId[];
}

async function migrate() {
  const dryRun = process.argv.includes('--dry-run');

  await dbConnection();

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('No active database connection.');
  }

  const usersCollection = db.collection<LegacyUserDoc>('users');

  const legacyUsers = await usersCollection
    .find({ roles: { $exists: true, $not: { $size: 0 } } })
    .toArray();

  if (legacyUsers.length === 0) {
    console.log('No users with a legacy `roles` field found - nothing to migrate.');
    await mongoose.disconnect();
    process.exit(0);
  }

  console.log(
    `Found ${legacyUsers.length} user(s) with legacy role data.${dryRun ? ' (dry run - no writes will be made)' : ''}`,
  );

  let promotedToOwner = 0;
  let membershipsUpdated = 0;
  let membershipsCreated = 0;

  for (const user of legacyUsers) {
    const roleIds = user.roles ?? [];
    const roles = await Role.find({ _id: { $in: roleIds } });

    for (const role of roles) {
      if (role.tenantId === undefined) {
        // Global role - only "Admin" carries meaning under the new model.
        if (role.name === 'Admin') {
          console.log(`  ${user.email ?? user._id}: global "Admin" role -> platformRole 'owner'`);
          promotedToOwner += 1;
          if (!dryRun) {
            await usersCollection.updateOne({ _id: user._id }, { $set: { platformRole: 'owner' } });
          }
        }
        continue;
      }

      // Org-scoped role - move onto (or create) the matching Membership.
      const organizationId = role.tenantId.toString();

      const existingMembership = await Membership.findOne({
        organizationId,
        userId: user._id,
      });

      console.log(
        `  ${user.email ?? user._id}: org-scoped role "${role.name}" (org ${organizationId}) -> Membership.roleIds`,
      );

      if (dryRun) continue;

      if (existingMembership) {
        await Membership.updateOne(
          { _id: existingMembership._id },
          { $addToSet: { roleIds: role._id } },
        );
        membershipsUpdated += 1;
      } else {
        await Membership.create({
          organizationId,
          userId: user._id,
          status: 'active',
          roleIds: [role._id],
        });
        membershipsCreated += 1;
      }
    }

    if (!dryRun) {
      await usersCollection.updateOne({ _id: user._id }, { $unset: { roles: '' } });
    }
  }

  console.log('\nMigration summary:');
  console.log(`  Users promoted to platformRole 'owner': ${promotedToOwner}`);
  console.log(`  Memberships updated with roleIds: ${membershipsUpdated}`);
  console.log(`  Memberships created: ${membershipsCreated}`);
  if (dryRun) {
    console.log('\nDry run only - no changes were written. Re-run without --dry-run to apply.');
  }

  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
