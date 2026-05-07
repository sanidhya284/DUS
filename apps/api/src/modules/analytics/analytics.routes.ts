import { Router } from 'express';
import * as analyticsController from './analytics.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.get('/:shortCode', authenticate, analyticsController.getStats);
router.get('/:shortCode/geo', authenticate, analyticsController.getGeo);
router.get('/:shortCode/time', authenticate, analyticsController.getTimeSeries);

export default router;
