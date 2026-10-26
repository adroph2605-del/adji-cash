export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export const str = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
