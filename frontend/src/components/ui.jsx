import { useEffect } from 'react'
import { X } from 'lucide-react'

export const usd = (n, d = 2) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: d, maximumFractionDigits: d }).format(n)
export const cx = (...a) => a.filter(Boolean).join(' ')
export const fmtDate = (s) => new Date(s + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export const inp =
  'w-full rounded-xl bg-onyx/60 border border-line px-3 py-2.5 text-sm text-ink placeholder:text-mute transition-colors focus:outline-none focus:border-spark/60 focus:ring-2 focus:ring-spark/30'
export const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-[#B6FF2E] text-black font-bold px-4 py-2.5 text-sm hover:-translate-y-0.5 hover:brightness-95 transition-all duration-200'
export const btnGhost =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-graphite px-4 py-2.5 text-sm font-semibold text-ink hover:-translate-y-0.5 hover:bg-hover transition-all duration-200'

export const Card = ({ className = '', hover = false, ...p }) => (
  <div className={cx('rounded-2xl bg-graphite border border-line', hover && 'transition-all duration-200 hover:-translate-y-0.5 hover:bg-hover', className)} {...p} />
)

export const Money = ({ value, sign = false, className = '' }) => (
  <span className={cx('num', sign && (value >= 0 ? 'text-emerald' : 'text-crimson'), className)}>
    {sign && value > 0 ? '+' : ''}{usd(value)}
  </span>
)

const tones = {
  mute: 'bg-ink/10 text-mute', lime: 'bg-spark/15 text-accent', red: 'bg-crimson/15 text-crimson',
  amber: 'bg-amber/15 text-amber', green: 'bg-emerald/15 text-emerald',
}
export const Badge = ({ tone = 'mute', children, className = '' }) => (
  <span className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap', tones[tone], className)}>{children}</span>
)

export const Toggle = ({ on, onChange, label }) => (
  <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}
    className={cx('relative h-6 w-11 shrink-0 rounded-full transition-colors', on ? 'bg-spark' : 'bg-ink/20')}>
    <span className={cx('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', on ? 'left-[22px] bg-black' : 'left-0.5')} />
  </button>
)

export const Tabs = ({ tabs, value, onChange, className = '' }) => (
  <div className={cx('inline-flex flex-wrap gap-1 rounded-xl bg-onyx/60 p-1 border border-line', className)} role="tablist">
    {tabs.map((t) => {
      const [k, label] = Array.isArray(t) ? t : [t, t]
      return (
        <button key={k} role="tab" aria-selected={value === k} onClick={() => onChange(k)}
          className={cx('rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-all', value === k ? 'bg-spark text-black' : 'text-mute hover:text-ink')}>
          {label}
        </button>
      )
    })}
  </div>
)

function useEsc(open, onClose) {
  useEffect(() => {
    if (!open) return
    const h = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])
}

export function Modal({ open, onClose, title, children, width = 'max-w-lg' }) {
  useEsc(open, onClose)
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label={title} className={cx('glass relative w-full animate-pop rounded-2xl p-6 max-h-[90vh] overflow-y-auto', width)}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-mute hover:bg-ink/10 hover:text-ink"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Drawer({ open, onClose, title, children }) {
  useEsc(open, onClose)
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <aside role="dialog" aria-modal="true" aria-label={title} className="absolute right-0 top-0 flex h-full w-full max-w-md animate-slideIn flex-col border-l border-line bg-graphite shadow-2xl">
        <div className="flex items-center justify-between border-b border-line p-5">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-mute hover:bg-ink/10 hover:text-ink"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </aside>
    </div>
  )
}

export const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-semibold text-mute">{label}</span>
    {children}
  </label>
)

export const PageHeader = ({ title, sub, children }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
      {sub && <p className="mt-1 text-sm text-mute">{sub}</p>}
    </div>
    <div className="flex flex-wrap items-center gap-2">{children}</div>
  </div>
)

export function downloadFile(name, content, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = Object.assign(document.createElement('a'), { href: url, download: name })
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
}

export const chartTooltip = {
  contentStyle: { background: 'rgb(var(--surface))', border: '1px solid rgb(var(--line) / .12)', borderRadius: 12, color: 'rgb(var(--ink))', fontSize: 12 },
  itemStyle: { color: 'rgb(var(--ink))' }, labelStyle: { color: 'rgb(var(--muted))' },
}
