import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ArrowLeftRight, PieChart as PieIcon, BarChart3, Landmark, CalendarClock, FileText, Settings as Cog,
  Search, Bell, Plus, ChevronLeft, ChevronRight, Menu, LogOut, Sun, Moon, Zap, CornerDownLeft,
} from 'lucide-react'
import { useStore } from './store.jsx'
import { useT } from './i18n/index.js'
import { BRAND } from './data/brand.js'
import { ACCOUNT_NAMES, CATEGORIES } from './data/mock.js'
import { Modal, Field, inp, btnPrimary, btnGhost, cx, usd } from './components/ui.jsx'

// Labels are i18n keys (see src/i18n)
export const NAV = [
  ['/overview', 'nav.overview', LayoutDashboard], ['/transactions', 'nav.transactions', ArrowLeftRight],
  ['/budgets', 'nav.budgets', PieIcon], ['/analytics', 'nav.analytics', BarChart3],
  ['/accounts', 'nav.accounts', Landmark], ['/bills', 'nav.bills', CalendarClock],
  ['/reports', 'nav.reports', FileText], ['/settings', 'nav.settings', Cog],
]
const MONTHS = ['August 2026', 'September 2026', 'October 2026']

function Brand({ collapsed }) {
  return (
    <div className="flex items-center gap-2.5 px-1">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-spark text-black">
        <Zap size={20} strokeWidth={2.8} />
      </span>
      {!collapsed && <span className="text-lg font-extrabold tracking-tight">{BRAND}</span>}
    </div>
  )
}

function SidebarBody({ collapsed, onNavigate }) {
  const nav = useNavigate()
  const t = useT()
  const { user, logout } = useStore()

  const displayName = user?.name || 'Guest'
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'G'

  const subtitle = user
    ? `${user.type === 'business' ? 'Business' : 'Personal'}${user.role === 'admin' ? ' · Admin' : ''}`
    : 'Guest'

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <Brand collapsed={collapsed} />
      <nav className="flex flex-1 flex-col gap-1" aria-label="Main">
        {NAV.map(([to, label, Icon]) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            title={collapsed ? t(label) : undefined}
            className={({ isActive }) =>
              cx(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200',
                isActive ? 'bg-spark/12 text-accent' : 'text-mute hover:bg-ink/5 hover:text-ink',
                collapsed && 'justify-center',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-spark" />
                )}
                <Icon size={19} className="shrink-0" />
                {!collapsed && <span className="truncate">{t(label)}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Dynamic logged-in user */}
      <div className={cx('flex items-center gap-3 rounded-xl border border-line bg-onyx/50 p-3', collapsed && 'justify-center p-2')}>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-spark font-extrabold text-black">
          {initials}
        </span>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{displayName}</p>
              <p className="truncate text-xs text-mute">{subtitle}</p>
            </div>
            <button
              aria-label={t('app.signout')}
              onClick={() => {
                logout()
                nav('/auth')
              }}
              className="rounded-lg p-1.5 text-mute hover:bg-ink/10 hover:text-ink"
            >
              <LogOut size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function CommandPalette({ open, onClose }) {
  const nav = useNavigate()
  const t = useT()
  const { txs } = useStore()
  const [q, setQ] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    if (open) {
      setQ('')
      setTimeout(() => ref.current?.focus(), 30)
    }
  }, [open])

  const items = useMemo(() => {
    const s = q.trim().toLowerCase()
    const pages = NAV.filter(([, l]) => t(l).toLowerCase().includes(s)).map(([to, l, I]) => ({
      key: to,
      label: t('palette.go') + ' ' + t(l),
      to,
      I,
    }))
    const found = s
      ? txs
          .filter((tx) => (tx.merchant + tx.description).toLowerCase().includes(s))
          .slice(0, 5)
          .map((tx) => ({
            key: tx.id,
            label: `${tx.merchant} · ${usd(tx.amount)}`,
            to: '/transactions?q=' + encodeURIComponent(tx.merchant),
            I: Search,
          }))
      : []
    return [...pages, ...found]
  }, [q, txs, t])

  const go = (to) => {
    nav(to)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={t('palette.title', { brand: BRAND })} width="max-w-xl">
      <input
        ref={ref}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t('palette.placeholder')}
        className={inp}
        onKeyDown={(e) => e.key === 'Enter' && items[0] && go(items[0].to)}
      />
      <ul className="mt-3 space-y-1">
        {items.map(({ key, label, to, I }, i) => (
          <li key={key}>
            <button
              onClick={() => go(to)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-ink/10"
            >
              <I size={16} className="text-mute" />
              <span className="flex-1">{label}</span>
              {i === 0 && <CornerDownLeft size={14} className="text-mute" />}
            </button>
          </li>
        ))}
        {!items.length && (
          <li className="px-3 py-6 text-center text-sm text-mute">{t('palette.none')}</li>
        )}
      </ul>
    </Modal>
  )
}

export function AddTransactionModal() {
  const { addOpen, setAddOpen, addTx } = useStore()
  const t = useT()
  const blank = {
    merchant: '',
    amount: '',
    type: 'expense',
    category: 'Groceries',
    account: 'Checking',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  }
  const [f, setF] = useState(blank)
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }))
  const valid = f.merchant.trim() && Number(f.amount) > 0

  const submit = (e) => {
    e.preventDefault()
    if (!valid) return
    const amt = Number(f.amount) * (f.type === 'expense' ? -1 : 1)
    addTx({
      merchant: f.merchant.trim(),
      description: f.merchant.trim(),
      amount: amt,
      category: f.type === 'income' ? 'Income' : f.category,
      account: f.account,
      date: f.date,
      notes: f.notes,
      tag: 'Manual',
      receipt: false,
    })
    setF(blank)
    setAddOpen(false)
  }

  return (
    <Modal open={addOpen} onClose={() => setAddOpen(false)} title={t('tx.title')}>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 grid grid-cols-2 gap-2 rounded-xl border border-line bg-onyx/60 p-1">
          {['expense', 'income'].map((k) => (
            <button
              type="button"
              key={k}
              onClick={() => setF((p) => ({ ...p, type: k }))}
              className={cx('rounded-lg py-2 text-sm font-semibold', f.type === k ? 'bg-spark text-black' : 'text-mute')}
            >
              {t('tx.' + k)}
            </button>
          ))}
        </div>
        <div className="sm:col-span-2">
          <Field label={t('tx.merchant')}>
            <input
              className={inp}
              value={f.merchant}
              onChange={set('merchant')}
              placeholder={t('tx.merchantPh')}
              autoFocus
            />
          </Field>
        </div>
        <Field label={t('tx.amount')}>
          <input
            className={cx(inp, 'num')}
            type="number"
            min="0"
            step="0.01"
            value={f.amount}
            onChange={set('amount')}
            placeholder="0.00"
          />
        </Field>
        <Field label={t('tx.date')}>
          <input className={inp} type="date" value={f.date} onChange={set('date')} />
        </Field>
        <Field label={t('tx.category')}>
          <select className={inp} value={f.category} onChange={set('category')} disabled={f.type === 'income'}>
            {Object.keys(CATEGORIES)
              .filter((c) => c !== 'Income')
              .map((c) => (
                <option key={c}>{c}</option>
              ))}
          </select>
        </Field>
        <Field label={t('tx.account')}>
          <select className={inp} value={f.account} onChange={set('account')}>
            {ACCOUNT_NAMES.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field label={t('tx.notes')}>
            <textarea rows={2} className={inp} value={f.notes} onChange={set('notes')} />
          </Field>
        </div>
        <div className="sm:col-span-2 flex justify-end gap-2">
          <button type="button" className={btnGhost} onClick={() => setAddOpen(false)}>
            {t('tx.cancel')}
          </button>
          <button
            type="submit"
            disabled={!valid}
            className={cx(btnPrimary, !valid && 'pointer-events-none opacity-50')}
          >
            {t('tx.add')}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default function Layout() {
  const {
    setAddOpen,
    notifications,
    setNotifications,
    theme,
    toggleTheme,
    toast,
    lang,
    setLang,
  } = useStore()
  const t = useT()
  const [collapsed, setCollapsed] = useState(false)
  const [mobile, setMobile] = useState(false)
  const [palette, setPalette] = useState(false)
  const [bell, setBell] = useState(false)
  const [mi, setMi] = useState(2)
  const unread = notifications.some((n) => n.unread)

  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPalette(true)
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  return (
    <div className="min-h-screen bg-onyx">
      <aside
        className={cx(
          'fixed inset-y-0 left-0 z-40 hidden border-r border-line bg-graphite2 transition-all duration-300 lg:block',
          collapsed ? 'w-[76px]' : 'w-64',
        )}
      >
        <SidebarBody collapsed={collapsed} />
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute -right-3 top-8 grid h-6 w-6 place-items-center rounded-full border border-line bg-graphite text-mute hover:text-ink"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {mobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobile(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 animate-slideIn border-r border-line bg-graphite2">
            <SidebarBody onNavigate={() => setMobile(false)} />
          </aside>
        </div>
      )}

      <div className={cx('transition-all duration-300', collapsed ? 'lg:pl-[76px]' : 'lg:pl-64')}>
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-onyx/80 px-4 py-3 backdrop-blur-xl sm:px-6">
          <button
            className="rounded-lg p-2 text-mute hover:bg-ink/10 lg:hidden"
            aria-label="Open menu"
            onClick={() => setMobile(true)}
          >
            <Menu size={20} />
          </button>

          <button
            onClick={() => setPalette(true)}
            className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-line bg-graphite px-3 py-2.5 text-sm text-mute hover:bg-hover sm:max-w-md"
          >
            <Search size={16} />
            <span className="flex-1 truncate text-left">{t('app.search')}</span>
            <kbd className="num hidden rounded-md border border-line px-1.5 py-0.5 text-[11px] sm:block">⌘K</kbd>
          </button>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center rounded-xl border border-line bg-graphite md:flex">
              <button
                aria-label="Previous month"
                disabled={mi === 0}
                onClick={() => setMi((i) => i - 1)}
                className="p-2 text-mute hover:text-ink disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="w-32 text-center text-sm font-semibold">{MONTHS[mi]}</span>
              <button
                aria-label="Next month"
                disabled={mi === 2}
                onClick={() => setMi((i) => i + 1)}
                className="p-2 text-mute hover:text-ink disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="flex rounded-xl border border-line bg-graphite p-0.5 text-xs font-bold">
              {['SW', 'ENG'].map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  aria-pressed={lang === l}
                  className={cx('rounded-lg px-2 py-2', lang === l ? 'bg-spark text-black' : 'text-mute')}
                >
                  {l}
                </button>
              ))}
            </div>

            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="rounded-xl border border-line bg-graphite p-2.5 text-mute hover:text-ink"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <div className="relative">
              <button
                onClick={() => setBell((b) => !b)}
                aria-label="Notifications"
                className="relative rounded-xl border border-line bg-graphite p-2.5 text-mute hover:text-ink"
              >
                <Bell size={17} />
                {unread && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-crimson ring-2 ring-graphite" />
                )}
              </button>
              {bell && (
                <div className="glass absolute right-0 mt-2 w-80 animate-pop rounded-2xl p-2">
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm font-bold">{t('app.notifications')}</span>
                    <button
                      className="text-xs font-semibold text-accent"
                      onClick={() => setNotifications((p) => p.map((n) => ({ ...n, unread: false })))}
                    >
                      {t('app.markRead')}
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="px-3 py-4 text-center text-xs text-mute">No notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="flex gap-3 rounded-xl px-3 py-2.5 hover:bg-ink/5">
                        <span
                          className={cx('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.unread ? 'bg-spark' : 'bg-ink/20')}
                        />
                        <div>
                          <p className="text-sm font-semibold">{n.title}</p>
                          <p className="text-xs text-mute">{n.body}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#B6FF2E] px-3.5 py-2.5 text-sm font-bold text-black transition-all duration-200 hover:-translate-y-0.5 hover:brightness-95"
            >
              <Plus size={17} strokeWidth={3} />
              <span className="hidden sm:inline">{t('app.add')}</span>
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-[1400px] p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      <CommandPalette open={palette} onClose={() => setPalette(false)} />
      <AddTransactionModal />
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[90] -translate-x-1/2 animate-toast rounded-xl bg-spark px-4 py-2.5 text-sm font-bold text-black shadow-2xl">
          {toast}
        </div>
      )}
    </div>
  )
}