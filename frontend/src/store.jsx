import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, getToken, setToken, getStoredUser, setStoredUser } from './services/api.js'
import { initialTransactions, initialBudgets, initialBills, initialReceipts, initialNotifications } from './data/mock'

const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)

const emptyUserData = () => ({
  txs: [],
  budgets: [],
  bills: [],
  receipts: [],
  notifications: [],
})

export function StoreProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser())
  const [txs, setTxs] = useState([])
  const [budgets, setBudgets] = useState([])
  const [bills, setBills] = useState([])
  const [receipts, setReceipts] = useState([])
  const [notifications, setNotifications] = useState([])
  const [theme, setTheme] = useState('dark')
  const [lang, setLangState] = useState(() => {
    try { return localStorage.getItem('adji_lang') === 'SW' ? 'SW' : 'ENG' } catch { return 'ENG' }
  })
  const setLang = useCallback((l) => {
    setLangState(l)
    try { localStorage.setItem('adji_lang', l) } catch { /* ignore */ }
  }, [])
  useEffect(() => { document.documentElement.lang = lang === 'SW' ? 'sw' : 'en' }, [lang])

  const [toast, setToast] = useState(null)
  const [addOpen, setAddOpen] = useState(false)
  const [booting, setBooting] = useState(true)

  // Boot session: load THIS user's data only
  useEffect(() => {
    let cancelled = false
    async function boot() {
      const token = getToken()
      if (!token) {
        // Guest preview only
        if (!cancelled) {
          setUser(null)
          setTxs(initialTransactions)
          setBudgets(initialBudgets)
          setBills(initialBills)
          setReceipts(initialReceipts)
          setNotifications(initialNotifications)
          setBooting(false)
        }
        return
      }
      try {
        const me = await api('/auth/me')
        if (cancelled) return
        setUser(me.user)
        setStoredUser(me.user)
        const rows = await api('/transactions')
        if (cancelled) return
        setTxs(Array.isArray(rows) ? rows : [])
        // Local-only entities start empty for real users (no shared mock)
        setBudgets([])
        setBills([])
        setReceipts([])
        setNotifications([])
      } catch {
        if (!cancelled) {
          setToken(null)
          setStoredUser(null)
          setUser(null)
          const d = emptyUserData()
          setTxs(d.txs)
          setBudgets(d.budgets)
          setBills(d.bills)
          setReceipts(d.receipts)
          setNotifications(d.notifications)
        }
      } finally {
        if (!cancelled) setBooting(false)
      }
    }
    boot()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  const notify = useCallback((msg) => setToast(msg), [])

  const loginSession = useCallback(async (token, profile) => {
    setToken(token)
    setStoredUser(profile)
    setUser(profile)
    // Always clear previous user's memory first
    setTxs([])
    setBudgets([])
    setBills([])
    setReceipts([])
    setNotifications([])
    try {
      const rows = await api('/transactions')
      setTxs(Array.isArray(rows) ? rows : [])
    } catch {
      setTxs([])
    }
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setStoredUser(null)
    setUser(null)
    setTxs([])
    setBudgets([])
    setBills([])
    setReceipts([])
    setNotifications([])
  }, [])

  const addTx = useCallback((t) => {
    const local = { ...t, id: 't' + Date.now() }
    setTxs((p) => [local, ...p])
    setToast('Transaction added')
    if (getToken()) {
      api('/transactions', { method: 'POST', body: t })
        .then((row) => setTxs((p) => p.map((x) => (x.id === local.id ? row : x))))
        .catch(() => setToast('Saved on this device only'))
    }
  }, [])

  const updateTx = useCallback((id, patch) => {
    setTxs((p) => p.map((t) => (t.id === id ? { ...t, ...patch } : t)))
    if (getToken() && /^t_/.test(id)) {
      api('/transactions/' + id, { method: 'PUT', body: patch }).catch(() => {})
    }
  }, [])

  const deleteTx = useCallback((id) => {
    setTxs((p) => p.filter((t) => t.id !== id))
    setToast('Transaction deleted')
    if (getToken() && /^t_/.test(id)) {
      api('/transactions/' + id, { method: 'DELETE' }).catch(() => {})
    }
  }, [])

  const value = useMemo(() => ({
    user, loginSession, logout, booting,
    txs, addTx, updateTx, deleteTx,
    budgets, setBudgets,
    bills, setBills,
    receipts, setReceipts,
    notifications, setNotifications,
    theme, toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    lang, setLang,
    toast, notify,
    addOpen, setAddOpen,
  }), [
    user, loginSession, logout, booting,
    txs, addTx, updateTx, deleteTx,
    budgets, bills, receipts, notifications,
    theme, lang, setLang, toast, notify, addOpen,
  ])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}