import { Router } from 'express';
import { createDeity, deleteDeity, getDeity, listDeities, updateDeity } from '../controllers/deity.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', listDeities);
router.get('/:id', getDeity);

router.use(authenticate);
router.post('/', createDeity);
router.put('/:id', updateDeity);
router.delete('/:id', deleteDeity);

export default router;
