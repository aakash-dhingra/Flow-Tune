import { Router } from 'express';
import { analyzeLikedTracks } from '../controllers/cleaner';
import { requireAuth } from '../middlewares/auth';

const router = Router();

router.post('/analyze', requireAuth, analyzeLikedTracks);

export default router;
