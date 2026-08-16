import { Router } from 'express';
import { urlController } from './url.controller';
import { validate } from '../../middlewares/validate.middleware';
import { createUrlSchema, updateUrlSchema } from './url.validator';
import { authenticate } from '../../middlewares/authenticate.middleware';
import { createUrlRateLimit } from '../../middlewares/rateLimit.middleware';

const router = Router();

router.get('/', authenticate, urlController.listUrls);
router.post('/', authenticate, createUrlRateLimit, validate(createUrlSchema), urlController.createUrl);
router.patch('/:id', authenticate, validate(updateUrlSchema), urlController.updateUrl);
router.delete('/:id', authenticate, urlController.deleteUrl);

export default router;