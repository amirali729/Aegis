import dotenv from 'dotenv';
import { createApp } from './app.js';
import dbConnection from './shared/database/dbconnection.js';
dotenv.config({
  path: './.env',
});

const app = createApp();
const PORT = Number(process.env.PORT) || 3000;
dbConnection()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
    process.exit(1);
  });
