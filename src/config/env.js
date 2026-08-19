import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendEnvPath = path.resolve(__dirname, '../../.env');
dotenv.config({
  path: backendEnvPath,
  override: false,
});

const resolvedDatabaseUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;

if (!resolvedDatabaseUrl) {
  throw new Error('DATABASE_URL or MYSQL_URL must be configured before starting the backend.');
}

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: resolvedDatabaseUrl,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  uploadDir: process.env.VERCEL
    ? '/tmp/uploads'
    : process.env.UPLOAD_DIR || (process.env.NODE_ENV === 'production' ? '/tmp/uploads' : './uploads'),
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:4200,http://localhost:5173')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean),
  maxUploadFiles: Number(process.env.MAX_UPLOAD_FILES || 5),
};
