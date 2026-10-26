import jwt from 'jsonwebtoken'
import { config } from '../config.js'
import { db } from '../db.js'

export const signToken = (user) => jwt.sign({ sub: user.id }, config.secret, { expiresIn: '7d' })

export function auth(req, res, next) {
  const h = req.headers.authorization || ''
  try {
    const { sub } = jwt.verify(h.startsWith('Bearer ') ? h.slice(7) : '', config.secret)
    const user = db().users.find((u) => u.id === sub)
    if (!user) throw new Error('no user')
    req.user = user
    next()
  } catch { res.status(401).json({ error: 'Please sign in again.' }) }
}
export const adminOnly = (req, res, next) => (req.user.role === 'admin' ? next() : res.status(403).json({ error: 'Admins only.' }))
