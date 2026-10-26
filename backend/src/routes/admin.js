import { Router } from 'express'
import { db, save } from '../db.js'
import { adminOnly, auth } from '../middleware/auth.js'
import { asyncHandler } from '../lib/async-handler.js'

const router = Router()
router.use(auth, adminOnly)

router.get('/stats', (_req, res) => res.json({ users: db().users.length, messages: db().messages.length, unread: db().messages.filter((m) => !m.read).length, subscribers: db().subscribers.length }))
router.get('/messages', (_req, res) => res.json(db().messages))
router.patch('/messages/:id/read', asyncHandler(async (req, res) => {
  const m = db().messages.find((x) => x.id === req.params.id)
  if (!m) return res.status(404).json({ error: 'Not found.' })
  m.read = true; await save(); res.json(m)
}))

export default router
