import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { buildOpenApiSpec } from './openapi-spec.js';

const router = Router();
const spec = buildOpenApiSpec();

router.use('/', swaggerUi.serve);
router.get(
  '/',
  swaggerUi.setup(spec, {
    customSiteTitle: 'Identity Platform API Docs',
  }),
);

// Raw spec, useful for importing into Postman/Insomnia or codegen tools.
router.get('/openapi.json', (_req, res) => {
  res.json(spec);
});

export default router;
