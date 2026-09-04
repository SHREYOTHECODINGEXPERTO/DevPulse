import { Router } from 'express';
import { DocsController } from '../controllers/docs.controller.ts';

const router = Router();

router.get('/docs', DocsController.getSwaggerUi);
router.get('/openapi.json', DocsController.getOpenApiSpec);
router.get('/health', DocsController.getHealthCheck);

export default router;
