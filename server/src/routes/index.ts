import { Router } from 'express';
import authRoutes from './auth';
import profileRoutes from './profile';
import skillRoutes from './skills';
import resumeRoutes from './resume';
import interviewRoutes from './interviews';
import jobRoutes from './jobs';
import progressRoutes from './progress';

const router = Router();

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/skills', skillRoutes);
router.use('/resume', resumeRoutes);
router.use('/interviews', interviewRoutes);
router.use('/jobs', jobRoutes);
router.use('/progress', progressRoutes);

export default router;
