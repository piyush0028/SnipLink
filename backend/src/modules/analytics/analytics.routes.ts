import { Router } from 'express';
import { analyticsController } from './analytics.controller';
import { authenticate } from '../../middlewares/authenticate.middleware';

const router = Router();

router.get('/:id', authenticate, analyticsController.getUrlAnalytics);

export default router;