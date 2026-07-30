import './shared/config/load-env.js';

import mongoose from 'mongoose';

import { createApp } from './app.js';
import dbConnection from './shared/database/dbconnection.js';
import { Logger } from './shared/utils/logger.js';

const app = createApp();
const PORT = Number(process.env.PORT) || 3000;

/** Milliseconds to wait for in-flight requests / connections to close before forcing exit. */
const SHUTDOWN_TIMEOUT_MS = 10_000;

async function start() {
  await dbConnection();

  const server = app.listen(PORT, () => {
    Logger.info(`Server running on port ${PORT}`);
  });

  let shuttingDown = false;

  /**
   * Stops accepting new connections, lets in-flight requests finish,
   * then closes the MongoDB connection - so rolling restarts / pod
   * evictions (Kubernetes, Docker) don't cut off requests mid-flight or
   * leave a dangling DB connection behind. Forces a hard exit if
   * shutdown takes too long, since a stuck shutdown is worse than a
   * forced one when an orchestrator is waiting on us.
   */
  const shutdown = (signal: NodeJS.Signals) => {
    if (shuttingDown) return;
    shuttingDown = true;

    Logger.info(`${signal} received. Shutting down gracefully...`);

    const forceExitTimer = setTimeout(() => {
      Logger.error(`Shutdown did not complete within ${SHUTDOWN_TIMEOUT_MS}ms, forcing exit.`);
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    forceExitTimer.unref();

    server.close((closeError) => {
      if (closeError) {
        Logger.error('Error while closing HTTP server:', closeError);
      }

      mongoose.connection
        .close(false)
        .then(() => {
          Logger.info('MongoDB connection closed. Bye.');
          clearTimeout(forceExitTimer);
          process.exit(closeError ? 1 : 0);
        })
        .catch((dbCloseError) => {
          Logger.error('Error while closing MongoDB connection:', dbCloseError);
          clearTimeout(forceExitTimer);
          process.exit(1);
        });
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((error) => {
  Logger.error('Startup failed:', error);
  process.exit(1);
});
