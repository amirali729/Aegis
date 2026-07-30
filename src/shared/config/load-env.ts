import dotenv from 'dotenv';

import { loadSecretsFromFiles } from './load-secrets.js';
import { validateEnv } from './validate-env.js';

// In containerized deployments env vars are normally injected directly
// (Docker/K8s env, or the *_FILE secret indirection resolved below), so
// a missing .env file here is completely expected and dotenv silently
// no-ops - it does NOT throw. Local/dev workflows still get this file.
dotenv.config({
  path: './src/shared/config/.env',
});

// Resolve any ${NAME}_FILE secret-file indirection (Docker secrets /
// Kubernetes secret mounts) into plain env vars before anything else
// reads process.env.
loadSecretsFromFiles();

// Fail fast, with a single clear message, if required config is
// missing or still set to a placeholder value - instead of crashing
// later with a confusing error deep inside a request, or (worse)
// silently running with a guessable secret.
validateEnv();
