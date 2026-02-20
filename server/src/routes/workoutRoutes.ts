import { Router } from 'express';
import {
  createAdminWorkout,
  createWorkout,
  deleteAdminWorkout,
  getAdminWorkouts,
  getWorkoutById,
  getWorkouts,
  updateAdminWorkout,
} from '../controllers/workoutController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/admin/all', authenticate, requireRole('admin'), getAdminWorkouts);
router.post('/admin', authenticate, requireRole('admin'), createAdminWorkout);
router.patch('/admin/:id', authenticate, requireRole('admin'), updateAdminWorkout);
router.delete('/admin/:id', authenticate, requireRole('admin'), deleteAdminWorkout);
router.get('/', authenticate, getWorkouts);
router.get('/:id', authenticate, getWorkoutById);
router.post('/', authenticate, createWorkout);

export default router;
