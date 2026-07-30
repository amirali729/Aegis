import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { User } from '../modules/auth/model/user.model.js';
import { Role } from '../modules/role/model/role.model.js';
import dbConnection from '../shared/database/dbconnection.js';

dotenv.config({ path: './src/shared/config/.env' });

async function assignAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error('Usage: npm run seed:admin -- <email>');
    process.exit(1);
  }

  await dbConnection();

  const adminRole = await Role.findOne({ name: 'Admin', tenantId: { $exists: false } });

  if (!adminRole) {
    console.error('No "Admin" role found. Run `npm run seed:rbac` first.');
    process.exit(1);
  }

  const user = await User.findOneAndUpdate(
    { email },
    { $addToSet: { roles: adminRole._id } },
    { new: true },
  );

  if (!user) {
    console.error(`No user found with email "${email}".`);
    process.exit(1);
  }

  console.log(`Granted Admin role to ${user.email} (${user._id}).`);

  await mongoose.disconnect();
  process.exit(0);
}

assignAdmin().catch((error) => {
  console.error('Failed to assign admin role:', error);
  process.exit(1);
});
