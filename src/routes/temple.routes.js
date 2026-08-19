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

/* =========================
   UPLOAD DIRECTORY
   Vercel-compatible temporary storage
========================= */

const uploadDir = '/tmp/uploads';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

/* =========================
   MULTER STORAGE
========================= */

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },

  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);

    const safeName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${extension}`;

    cb(null, safeName);
  },
});

const upload = multer({
  storage,

  limits: {
    files: env.maxUploadFiles,
  },
});

/* =========================
   PUBLIC TEMPLE ROUTES
========================= */

router.get('/', listTemples);

router.get('/:id', getTemple);

/* =========================
   PROTECTED TEMPLE ROUTES
========================= */

router.use(authenticate);

/* CREATE TEMPLE */

router.post(
  '/',
  upload.array('uploaded_images', env.maxUploadFiles),
  validate(templeCreateSchema),
  createTemple
);

/* UPDATE TEMPLE */

router.put(
  '/:id',
  upload.array('uploaded_images', env.maxUploadFiles),
  validate(templeUpdateSchema),
  updateTemple
);

/* DELETE TEMPLE */

router.delete(
  '/:id',
  deleteTemple
);

/* UPDATE TEMPLE STATUS */

router.patch(
  '/:id/status',
  authorize('Admin', 'TempleManager'),
  validate(templeStatusSchema),
  updateTempleStatus
);

export default router;