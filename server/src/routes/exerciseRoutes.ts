import { Router } from 'express';
import {
  createAdminExercise,
  deleteAdminExercise,
  getExerciseById,
  getExercises,
  updateAdminExercise,
} from '../controllers/exerciseController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', getExercises);
router.post('/admin', authenticate, requireRole('admin'), createAdminExercise);
router.patch('/admin/:id', authenticate, requireRole('admin'), updateAdminExercise);
router.delete('/admin/:id', authenticate, requireRole('admin'), deleteAdminExercise);
router.get('/:id', getExerciseById);

export default router;
