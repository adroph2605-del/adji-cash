import { Router } from 'express'
import { limiter } from '../middleware/limits.js'
import { answer } from '../lib/assistant.js'

const router = Router()

router.post('/assistant', limiter(40, 15), async (req, res) => {
  const lang = req.body.lang === 'SW' ? 'SW' : 'ENG'
  const msgs = (Array.isArray(req.body.messages) ? req.body.messages : [])
    .filter((m) => m && ['user', 'assistant'].includes(m.role) && typeof m.content === 'string' && m.content.trim())
    .slice(-10).map((m) => ({ role: m.role, content: m.content.trim().slice(0, 1000) }))
  while (msgs.length && msgs[0].role !== 'user') msgs.shift()
  if (!msgs.length || msgs.at(-1).role !== 'user') return res.status(400).json({ error: 'Send a message first.' })
  res.json({ reply: await answer(msgs, lang) })
})

export default router
