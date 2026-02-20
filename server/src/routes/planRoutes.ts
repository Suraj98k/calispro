import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { createPlan, deletePlan, getPlanById, getPlans } from '../controllers/planController.js';

const router = Router();

router.get('/', authenticate, getPlans);
router.get('/:id', authenticate, getPlanById);
router.post('/', authenticate, createPlan);
router.delete('/:id', authenticate, deletePlan);

export default router;
