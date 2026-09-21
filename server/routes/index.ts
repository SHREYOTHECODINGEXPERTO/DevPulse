import { Router } from 'express';
import userRoutes from './user.routes.ts';
import projectRoutes from './project.routes.ts';
import taskRoutes from './task.routes.ts';
import aiRoutes from './ai.routes.ts';
import docsRoutes from './docs.routes.ts';

const router = Router();

// Mount resources
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/ai', aiRoutes);
router.use('/', docsRoutes);

export default router;
