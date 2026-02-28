import { Router } from 'express';
import { login, callback, logout, me } from '../controllers/auth';
import { requireAuth } from '../middlewares/auth';

const router = Router();

router.get('/login', login);
router.get('/callback', callback);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

export default router;
