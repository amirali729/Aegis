import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { User } from '../modules/auth/model/user.model.js';
import dbConnection from '../shared/database/dbconnection.js';

dotenv.config({ path: './src/shared/config/.env' });

/**
 * Grants a user the 'owner' platform role - see shared/security/
 * authorization/platform-roles.ts. Platform Owner is "usually seeded
 * during installation. Never created through signup" (architecture
 * doc, section 6), which is exactly what this script is for.
 *
 * Previously this assigned a global "Admin" Role document to
 * User.roles. That mechanism is gone - platform-level access is now a
 * fixed enum field directly on User, so this is now a direct update.
 */
async function assignAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error('Usage: npm run seed:admin -- <email>');
    process.exit(1);
  }

  await dbConnection();

  const user = await User.findOneAndUpdate({ email }, { platformRole: 'owner' }, { new: true });

  if (!user) {
    console.error(`No user found with email "${email}".`);
    process.exit(1);
  }

  console.log(`Granted the platform Owner role to ${user.email} (${user._id}).`);

  await mongoose.disconnect();
  process.exit(0);
}

assignAdmin().catch((error) => {
  console.error('Failed to assign the platform Owner role:', error);
  process.exit(1);
});
