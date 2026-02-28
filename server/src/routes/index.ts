import { Router } from 'express';
import authRoutes from './auth';
import cleanerRoutes from './cleaner';

const router = Router();

router.use('/auth', authRoutes);
router.use('/cleaner', cleanerRoutes);

export default router;
