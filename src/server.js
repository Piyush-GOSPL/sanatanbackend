import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { env } from './config/env.js';
import { prisma } from './config/db.js';

import authRoutes from './routes/auth.routes.js';
import cityRoutes from './routes/city.routes.js';
import deityRoutes from './routes/deity.routes.js';
import templeRoutes from './routes/temple.routes.js';
import businessRoutes from './routes/business.routes.js';

import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Vercel proxy ke peeche hai — X-Forwarded-For header trust karo
app.set('trust proxy', 1);

/* =========================
   CORS
========================= */

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = env.corsOrigin || [
      'http://localhost:4200',
      'http://localhost:5173',
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },

  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

  allowedHeaders: ['Content-Type', 'Authorization'],

  credentials: false,
};

app.use(cors(corsOptions));

/* =========================
   SECURITY
========================= */

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

/* =========================
   BODY PARSER
========================= */

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* =========================
   RATE LIMIT
========================= */

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
  })
);

/* =========================
   HEALTH CHECK
========================= */

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    message: 'Sanatan backend is running',
  });
});

/* =========================
   API ROUTES
========================= */

app.use('/api', authRoutes);
app.use('/api/city', cityRoutes);
app.use('/api/deity', deityRoutes);
app.use('/api/temple', templeRoutes);
app.use('/api/business', businessRoutes);

/* =========================
   PUBLIC API ROUTES
========================= */

app.use('/api/public/users', authRoutes);
app.use('/api/public/city', cityRoutes);
app.use('/api/public/deity', deityRoutes);
app.use('/api/public/temple', templeRoutes);
app.use('/api/public/business', businessRoutes);

/* =========================
   ERROR HANDLER
========================= */

app.use(errorHandler);

/* =========================
   START SERVER
   Vercel imports this module and calls the exported app directly as a
   request handler — it never runs app.listen(), and a module-level
   process.exit(1) would crash the whole function on any DB hiccup.
   Only listen on a port when running locally / on a traditional host.
========================= */

if (!process.env.VERCEL) {
  prisma
    .$connect()
    .then(() => {
      console.log('Database connected successfully');
      app.listen(env.port, '0.0.0.0', () => {
        console.log(`Server running on port ${env.port}`);
        console.log(
          `Business API: http://localhost:${env.port}/api/public/business`
        );
      });
    })
    .catch((error) => {
      console.error('Failed to connect to database', error);
      process.exit(1);
    });
}

export default app;