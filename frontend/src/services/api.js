// Small fetch wrapper for the Express API. Token and language live in localStorage.
const KEY = 'adji_token'
const USER_KEY = 'adji_user'

export const getToken = () => { try { return localStorage.getItem(KEY) } catch { return null } }
export const setToken = (t) => { try { t ? localStorage.setItem(KEY, t) : localStorage.removeItem(KEY) } catch { /* private mode */ } }

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}
export const setStoredUser = (u) => {
  try {
    u ? localStorage.setItem(USER_KEY, JSON.stringify(u)) : localStorage.removeItem(USER_KEY)
  } catch { /* private mode */ }
}

const SW_ERRORS = {
  'Please sign in again.': 'Tafadhali ingia tena.',
  'Enter your name.': 'Weka jina lako.',
  'Enter a valid email.': 'Weka barua pepe sahihi.',
  'Password must be at least 8 characters.': 'Nywila lazima iwe na angalau herufi 8.',
  'An account with this email already exists.': 'Akaunti yenye barua pepe hii tayari ipo.',
  'Wrong email or password.': 'Barua pepe au nywila si sahihi.',
  'This reset link is invalid or has expired.': 'Kiungo hiki si sahihi au muda wake umeisha.',
  'Please fill in your name, a valid email and a message.': 'Tafadhali jaza jina, barua pepe sahihi na ujumbe.',
  'Too many requests, try again later.': 'Maombi ni mengi mno, jaribu tena baadaye.',
  'Cannot reach the server. Is the API running?': 'Seva haipatikani. Je, API inafanya kazi?',
  'Something went wrong on our side.': 'Kuna hitilafu upande wetu.',
  'Send a message first.': 'Tuma ujumbe kwanza.',
  'Request failed': 'Ombi limeshindikana',
}

function fail(msg) {
  let sw = false
  try { sw = localStorage.getItem('adji_lang') === 'SW' } catch { /* ignore */ }
  throw new Error(sw ? (SW_ERRORS[msg] || msg) : msg)
}

export async function api(path, { method = 'GET', body } = {}) {
  let res
  try {
    res = await fetch('/api' + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(getToken() ? { Authorization: 'Bearer ' + getToken() } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    fail('Cannot reach the server. Is the API running?')
  }
  const data = await res.json().catch(() => ({}))
  if (res.status === 401) {
    setToken(null)
    setStoredUser(null)
    fail('Please sign in again.')
  }
  if (!res.ok) fail(data.error || 'Request failed')
  return data
}