import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { registerSchema, loginSchema } from './auth.validator';
import { authenticate } from '../../middlewares/authenticate.middleware';
import { loginRateLimit, registerRateLimit } from '../../middlewares/rateLimit.middleware';

const router = Router();

router.post('/register', registerRateLimit, validate(registerSchema), authController.register);
router.post('/login', loginRateLimit, validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

export default router;