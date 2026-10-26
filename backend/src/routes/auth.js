import { Router } from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import { config } from '../config.js'
import { db, save, uid } from '../db.js'
import { auth, signToken } from '../middleware/auth.js'
import { limiter } from '../middleware/limits.js'
import { EMAIL_RE, str } from '../lib/validate.js'
import { sendMail } from '../lib/mailer.js'
import { asyncHandler } from '../lib/async-handler.js'

const router = Router()
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, type: u.type, createdAt: u.createdAt })

router.post('/register', limiter(20), asyncHandler(async (req, res) => {
  const name = str(req.body.name, 80), email = str(req.body.email, 120).toLowerCase(), password = String(req.body.password || ''), type = req.body.type === 'business' ? 'business' : 'personal'
  if (!name) return res.status(400).json({ error: 'Enter your name.' })
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Enter a valid email.' })
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' })
  if (db().users.some((u) => u.email === email)) return res.status(409).json({ error: 'An account with this email already exists.' })
  const user = { id: uid('u_'), name, email, type, role: email === config.ownerEmail ? 'admin' : 'user', hash: await bcrypt.hash(password, 11), createdAt: new Date().toISOString() }
  db().users.push(user); await save()
  sendMail({ to: email, subject: 'Welcome to Adji Cash', text: `Hi ${name},\n\nYour Adji Cash account is ready. Sign in any time and take control of your money.\n\n— Adji Cash` }).catch(() => {})
  res.status(201).json({ token: signToken(user), user: publicUser(user) })
}))

router.post('/login', limiter(30), asyncHandler(async (req, res) => {
  const email = str(req.body.email, 120).toLowerCase(), password = String(req.body.password || '')
  const user = db().users.find((u) => u.email === email)
  if (!user || !(await bcrypt.compare(password, user.hash))) return res.status(401).json({ error: 'Wrong email or password.' })
  res.json({ token: signToken(user), user: publicUser(user) })
}))

router.get('/me', auth, (req, res) => res.json({ user: publicUser(req.user) }))

router.post('/forgot', limiter(10, 60), asyncHandler(async (req, res) => {
  const email = str(req.body.email, 120).toLowerCase()
  const user = db().users.find((u) => u.email === email)
  if (user) {
    const token = crypto.randomBytes(24).toString('hex')
    db().resets = db().resets.filter((r) => r.userId !== user.id)
    db().resets.push({ token: crypto.createHash('sha256').update(token).digest('hex'), userId: user.id, exp: Date.now() + 30 * 60_000 }); await save()
    sendMail({ to: email, subject: 'Reset your Adji Cash password', text: `Use this link within 30 minutes to reset your password:\n${config.clientUrl}/#/auth?reset=${token}` }).catch(() => {})
  }
  res.json({ ok: true }) // same answer either way so emails cannot be probed
}))

router.post('/reset', limiter(10, 60), asyncHandler(async (req, res) => {
  const hash = crypto.createHash('sha256').update(String(req.body.token || '')).digest('hex'), password = String(req.body.password || '')
  const r = db().resets.find((x) => x.token === hash && x.exp > Date.now())
  if (!r) return res.status(400).json({ error: 'This reset link is invalid or has expired.' })
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' })
  db().users.find((u) => u.id === r.userId).hash = await bcrypt.hash(password, 11)
  db().resets = db().resets.filter((x) => x !== r); await save()
  res.json({ ok: true })
}))

export default router
