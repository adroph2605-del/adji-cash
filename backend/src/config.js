import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const prod = process.env.NODE_ENV === 'production'

if (prod && !process.env.JWT_SECRET) throw new Error('JWT_SECRET must be set in production (see backend/.env.example).')
if (!process.env.JWT_SECRET) console.warn('⚠  JWT_SECRET not set: using an insecure development secret.')

export const config = {
  prod,
  port: Number(process.env.PORT || 5000),
  secret: process.env.JWT_SECRET || 'dev-secret-change-me',
  ownerEmail: (process.env.OWNER_EMAIL || 'adroph2605@gmail.com').toLowerCase(),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  clientOrigins: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',') : true,
  mongodbUri: process.env.MONGODB_URI || '',
  databaseName: process.env.DB_NAME || 'adji_cash',
  dataDir: path.join(backendRoot, 'data'),
  distDir: path.resolve(backendRoot, '..', 'frontend', 'dist'),
  ai: { key: process.env.ANTHROPIC_API_KEY || '', model: process.env.ASSISTANT_MODEL || 'claude-haiku-5-5' },
}
