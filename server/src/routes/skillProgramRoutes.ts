import { Router } from 'express';
import {
  bulkUpsertAdminSkillPrograms,
  createAdminSkillProgram,
  deleteAdminSkillProgram,
  getAdminSkillProgramById,
  getAdminSkillPrograms,
  getSkillProgramBySlug,
  getSkillPrograms,
  getUserSkillProgramProgress,
  trackUserSkillSession,
  updateAdminSkillProgram,
} from '../controllers/skillProgramController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', getSkillPrograms);
router.get('/user/progress', authenticate, getUserSkillProgramProgress);
router.post('/user/session', authenticate, trackUserSkillSession);
router.get('/admin', authenticate, requireRole('admin'), getAdminSkillPrograms);
router.get('/admin/:id', authenticate, requireRole('admin'), getAdminSkillProgramById);
router.post('/admin', authenticate, requireRole('admin'), createAdminSkillProgram);
router.post('/admin/bulk', authenticate, requireRole('admin'), bulkUpsertAdminSkillPrograms);
router.patch('/admin/:id', authenticate, requireRole('admin'), updateAdminSkillProgram);
router.delete('/admin/:id', authenticate, requireRole('admin'), deleteAdminSkillProgram);
router.get('/:slug', getSkillProgramBySlug);

export default router;
