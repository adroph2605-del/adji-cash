import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import path from 'node:path'
import { config } from './config.js'
import authRoutes from './routes/auth.js'
import contactRoutes from './routes/contact.js'
import transactionRoutes from './routes/transactions.js'
import adminRoutes from './routes/admin.js'
import assistantRoutes from './routes/assistant.js'

const app = express()
app.set('trust proxy', 1)
app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({ origin: config.clientOrigins }))
app.use(express.json({ limit: '100kb' }))

app.get('/api/health', (_req, res) => res.json({ ok: true, name: 'Adji Cash API', time: new Date().toISOString() }))
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api', contactRoutes)
app.use('/api', assistantRoutes)
app.use('/api', transactionRoutes)
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }))

// Production: serve the built frontend from ../frontend/dist
app.use(express.static(config.distDir))
app.get(/^\/(?!api\/).*/, (_req, res, next) => res.sendFile(path.join(config.distDir, 'index.html'), (err) => err && next()))

app.use((err, _req, res, _next) => { console.error(err); res.status(500).json({ error: 'Something went wrong on our side.' }) })
export default app
