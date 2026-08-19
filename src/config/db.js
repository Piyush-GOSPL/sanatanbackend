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

const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL or MYSQL_URL must be configured before Prisma is initialized.');
}

const { PrismaClient } = await import('@prisma/client');

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});
