import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller.ts';
import { validate } from '../middleware/validate.ts';

const router = Router();

// Validation rules for project creation
const createProjectValidation = validate([
  { field: 'name', required: true, type: 'string', minLength: 2, maxLength: 100 },
  {
    field: 'key',
    required: true,
    type: 'string',
    minLength: 2,
    maxLength: 10,
    pattern: /^[A-Za-z0-9_-]+$/,
    message: 'Project key must be 2-10 alphanumeric characters (e.g. PULSE, DEV)',
  },
  { field: 'description', required: true, type: 'string', minLength: 5 },
  { field: 'ownerId', required: true, type: 'string' },
  {
    field: 'status',
    required: false,
    enum: ['Active Sprint', 'In Progress', 'Completed', 'Maintained', 'Planning'],
  },
]);

// Validation rules for project update
const updateProjectValidation = validate([
  { field: 'name', required: false, type: 'string', minLength: 2 },
  {
    field: 'key',
    required: false,
    type: 'string',
    minLength: 2,
    maxLength: 10,
    pattern: /^[A-Za-z0-9_-]+$/,
  },
  {
    field: 'status',
    required: false,
    enum: ['Active Sprint', 'In Progress', 'Completed', 'Maintained', 'Planning'],
  },
]);

// Endpoints
router.get('/', ProjectController.getAllProjects);
router.get('/:id', ProjectController.getProjectById);
router.post('/', createProjectValidation, ProjectController.createProject);
router.put('/:id', createProjectValidation, ProjectController.updateProject);
router.patch('/:id', updateProjectValidation, ProjectController.updateProject);
router.delete('/:id', ProjectController.deleteProject);
router.get('/:id/tasks', ProjectController.getProjectTasks);
router.get('/:id/members', ProjectController.getProjectMembers);

export default router;
