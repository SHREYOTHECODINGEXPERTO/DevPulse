import { Router } from 'express';
import { UserController } from '../controllers/user.controller.ts';
import { validate } from '../middleware/validate.ts';

const router = Router();

// Validation rules for user creation
const createUserValidation = validate([
  { field: 'name', required: true, type: 'string', minLength: 2, maxLength: 80 },
  { field: 'handle', required: true, type: 'string', minLength: 2, maxLength: 40 },
  {
    field: 'email',
    required: true,
    type: 'string',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Valid email address format required (e.g. name@domain.com)',
  },
  { field: 'role', required: true, type: 'string', minLength: 2 },
  { field: 'team', required: true, type: 'string', minLength: 2 },
  {
    field: 'status',
    required: false,
    enum: [
      'In the Zone',
      'Reviewing Code',
      'Pairing',
      'In Sprint Planning',
      'AFK',
      'Vibecoding',
      'Debugging at 3AM',
    ],
  },
]);

// Validation rules for user update
const updateUserValidation = validate([
  { field: 'name', required: false, type: 'string', minLength: 2 },
  { field: 'handle', required: false, type: 'string', minLength: 2 },
  {
    field: 'email',
    required: false,
    type: 'string',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Valid email address format required',
  },
  {
    field: 'status',
    required: false,
    enum: [
      'In the Zone',
      'Reviewing Code',
      'Pairing',
      'In Sprint Planning',
      'AFK',
      'Vibecoding',
      'Debugging at 3AM',
    ],
  },
]);

// Endpoints
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.post('/', createUserValidation, UserController.createUser);
router.put('/:id', createUserValidation, UserController.updateUser);
router.patch('/:id', updateUserValidation, UserController.updateUser);
router.delete('/:id', UserController.deleteUser);
router.get('/:id/stats', UserController.getUserStats);
router.get('/:id/tasks', UserController.getUserTasks);

export default router;
