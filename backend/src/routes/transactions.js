import { Router } from 'express'
import { db, save, uid } from '../db.js'
import { auth } from '../middleware/auth.js'
import { str } from '../lib/validate.js'
import { asyncHandler } from '../lib/async-handler.js'

const router = Router()

const clean = (b) => ({
  merchant: str(b.merchant, 80), description: str(b.description, 200), category: str(b.category, 40) || 'Other',
  account: str(b.account, 60), notes: str(b.notes, 500), tag: str(b.tag, 40),
  date: /^\d{4}-\d{2}-\d{2}$/.test(b.date) ? b.date : new Date().toISOString().slice(0, 10), amount: Number(b.amount) || 0,
})
const mine = (req) => db().transactions.filter((t) => t.userId === req.user.id)

router.get('/transactions', auth, (req, res) => res.json(mine(req).sort((a, b) => b.date.localeCompare(a.date))))

router.post('/transactions', auth, asyncHandler(async (req, res) => {
  const t = clean(req.body)
  if (!t.merchant || !t.amount) return res.status(400).json({ error: 'Merchant and a non-zero amount are required.' })
  const row = { id: uid('t_'), userId: req.user.id, ...t }
  db().transactions.push(row); await save(); res.status(201).json(row)
}))

router.put('/transactions/:id', auth, asyncHandler(async (req, res) => {
  const row = mine(req).find((t) => t.id === req.params.id)
  if (!row) return res.status(404).json({ error: 'Not found.' })
  Object.assign(row, clean({ ...row, ...req.body })); await save(); res.json(row)
}))

router.delete('/transactions/:id', auth, asyncHandler(async (req, res) => {
  const before = db().transactions.length
  db().transactions = db().transactions.filter((t) => !(t.id === req.params.id && t.userId === req.user.id))
  if (db().transactions.length === before) return res.status(404).json({ error: 'Not found.' })
  await save(); res.json({ ok: true })
}))

router.get('/summary', auth, (req, res) => {
  const rows = mine(req)
  const income = rows.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const spent = -rows.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0)
  const byCategory = {}
  rows.filter((t) => t.amount < 0).forEach((t) => { byCategory[t.category] = (byCategory[t.category] || 0) + -t.amount })
  res.json({ income, spent, saved: income - spent, count: rows.length, byCategory })
})

export default router
