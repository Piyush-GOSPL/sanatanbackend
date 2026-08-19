import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';

import { env } from '../config/env.js';

import {
  createTemple,
  deleteTemple,
  getTemple,
  listTemples,
  updateTemple,
  updateTempleStatus,
} from '../controllers/temple.controller.js';

import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

import {
  templeCreateSchema,
  templeStatusSchema,
  templeUpdateSchema,
} from '../validators/temple.validator.js';

const router = Router();

const uploadDir = path.resolve(env.uploadDir);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },

  filename: (_req, file, cb) => {
    const safeName =
      `${Date.now()}-${Math.round(Math.random() * 1e9)}` +
      path.extname(file.originalname);

    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: {
    files: env.maxUploadFiles,
  },
});

router.get('/', listTemples);
router.get('/:id', getTemple);

router.use(authenticate);

router.post(
  '/',
  upload.array('uploaded_images', env.maxUploadFiles),
  validate(templeCreateSchema),
  createTemple
);

router.put(
  '/:id',
  upload.array('uploaded_images', env.maxUploadFiles),
  validate(templeUpdateSchema),
  updateTemple
);

router.delete('/:id', deleteTemple);

router.patch(
  '/:id/status',
  authorize('Admin', 'TempleManager'),
  validate(templeStatusSchema),
  updateTempleStatus
);

export default router;