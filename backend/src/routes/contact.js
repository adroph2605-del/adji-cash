import { Router } from 'express'
import { config } from '../config.js'
import { db, save, uid } from '../db.js'
import { limiter } from '../middleware/limits.js'
import { EMAIL_RE, str } from '../lib/validate.js'
import { sendMail } from '../lib/mailer.js'
import { asyncHandler } from '../lib/async-handler.js'

const router = Router()

router.post('/contact', limiter(8, 30), asyncHandler(async (req, res) => {
  const name = str(req.body.name, 80), email = str(req.body.email, 120), text = str(req.body.text, 3000)
  if (req.body.website) return res.json({ ok: true }) // honeypot for bots
  if (!name || !EMAIL_RE.test(email) || text.length < 5) return res.status(400).json({ error: 'Please fill in your name, a valid email and a message.' })
  db().messages.unshift({ id: uid('m_'), name, email, text, read: false, createdAt: new Date().toISOString() }); await save()
  sendMail({ to: config.ownerEmail, subject: `Adji Cash enquiry from ${name}`, text: `${text}\n\n— ${name} (${email})`, replyTo: email }).catch((e) => console.error('mail failed', e.message))
  res.status(201).json({ ok: true })
}))

router.post('/newsletter', limiter(10, 30), asyncHandler(async (req, res) => {
  const email = str(req.body.email, 120).toLowerCase()
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Enter a valid email.' })
  if (!db().subscribers.some((s) => s.email === email)) { db().subscribers.push({ email, createdAt: new Date().toISOString() }); await save() }
  res.status(201).json({ ok: true })
}))

export default router
