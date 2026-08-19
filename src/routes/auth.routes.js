import { Router } from 'express';
import { login, logout } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, logoutSchema } from '../validators/auth.validator.js';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.post('/logout', validate(logoutSchema), logout);

export default router;
