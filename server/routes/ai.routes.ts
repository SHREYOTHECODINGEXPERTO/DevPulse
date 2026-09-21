import { Router } from 'express';
import { aiController } from '../controllers/ai.controller.ts';

const router = Router();

// POST /api/ai/generate-tasks
router.post('/generate-tasks', (req, res, next) => aiController.generateTasks(req, res, next));

// POST /api/ai/summarize
router.post('/summarize', (req, res, next) => aiController.summarizeTask(req, res, next));

// POST /api/ai/project-description
router.post('/project-description', (req, res, next) => aiController.generateProjectDescription(req, res, next));

// POST /api/ai/productivity-coach
router.post('/productivity-coach', (req, res, next) => aiController.getProductivitySuggestions(req, res, next));

// POST /api/ai/prioritize
router.post('/prioritize', (req, res, next) => aiController.prioritizeTasks(req, res, next));

// POST /api/ai/copilot
router.post('/copilot', (req, res, next) => aiController.chatWithCopilot(req, res, next));

export default router;
