import { Router } from 'express';
import { TaskController } from '../controllers/task.controller.ts';
import { validate } from '../middleware/validate.ts';

const router = Router();

// Validation for task creation
const createTaskValidation = validate([
  { field: 'title', required: true, type: 'string', minLength: 3, maxLength: 200 },
  { field: 'projectId', required: true, type: 'string' },
  {
    field: 'type',
    required: false,
    enum: ['Story', 'Bug', 'Task', 'Epic', 'Refactor'],
  },
  {
    field: 'status',
    required: false,
    enum: ['backlog', 'todo', 'in-progress', 'in-review', 'done'],
  },
  {
    field: 'priority',
    required: false,
    enum: ['Low', 'Medium', 'High', 'Critical'],
  },
  { field: 'storyPoints', required: false, type: 'number', min: 0, max: 100 },
  { field: 'estimatedHours', required: false, type: 'number', min: 0 },
]);

// Validation for task update
const updateTaskValidation = validate([
  { field: 'title', required: false, type: 'string', minLength: 3 },
  {
    field: 'type',
    required: false,
    enum: ['Story', 'Bug', 'Task', 'Epic', 'Refactor'],
  },
  {
    field: 'status',
    required: false,
    enum: ['backlog', 'todo', 'in-progress', 'in-review', 'done'],
  },
  {
    field: 'priority',
    required: false,
    enum: ['Low', 'Medium', 'High', 'Critical'],
  },
]);

// Validation for dedicated status transition
const updateStatusValidation = validate([
  {
    field: 'status',
    required: true,
    enum: ['backlog', 'todo', 'in-progress', 'in-review', 'done'],
    message: "status must be one of: 'backlog', 'todo', 'in-progress', 'in-review', 'done'",
  },
]);

// Validation for bulk status update
const bulkStatusValidation = validate([
  { field: 'taskIds', required: true, type: 'array', minLength: 1 },
  {
    field: 'status',
    required: true,
    enum: ['backlog', 'todo', 'in-progress', 'in-review', 'done'],
    message: "status must be one of: 'backlog', 'todo', 'in-progress', 'in-review', 'done'",
  },
]);

// Endpoints
router.get('/', TaskController.getAllTasks);
router.post('/bulk-status', bulkStatusValidation, TaskController.bulkUpdateTaskStatus);
router.get('/:id', TaskController.getTaskById);
router.post('/', createTaskValidation, TaskController.createTask);
router.put('/:id', createTaskValidation, TaskController.updateTask);
router.patch('/:id', updateTaskValidation, TaskController.updateTask);
router.patch('/:id/status', updateStatusValidation, TaskController.updateTaskStatus);
router.delete('/:id', TaskController.deleteTask);

export default router;
