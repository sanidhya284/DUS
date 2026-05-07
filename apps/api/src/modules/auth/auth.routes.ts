import { Router } from 'express';
import * as authController from './auth.controller';
import { rateLimit } from '../../middleware/rateLimit.middleware';

const router = Router();

// Stricter rate limit on auth routes to prevent brute-force
const authRateLimit = rateLimit({ maxTokens: 5, windowMs: 60000 });

router.post('/register', authRateLimit, authController.register);
router.post('/login', authRateLimit, authController.login);
router.post('/refresh', authController.refresh);
router.delete('/logout', authController.logout);

export default router;
