import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Pencil } from 'lucide-react'
import { useStore } from '../store.jsx'
import { CATEGORIES } from '../data/mock.js'
import { Badge, Card, Field, Modal, PageHeader, btnGhost, btnPrimary, cx, inp, usd } from '../components/ui.jsx'
import { barColor, budgetTone } from './Overview.jsx'

function Ring({ pct }) {
  const r = 78, c = 2 * Math.PI * r, p = Math.min(pct, 100)
  return (
    <svg viewBox="0 0 200 200" className="mx-auto h-56 w-56 -rotate-90" role="img" aria-label={`${Math.round(pct)}% of budget spent`}>
      <circle cx="100" cy="100" r={r} fill="none" stroke="rgb(var(--ink) / .1)" strokeWidth="16" />
      <circle cx="100" cy="100" r={r} fill="none" stroke="#B6FF2E" strokeWidth="16" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - p / 100)} style={{ transition: 'stroke-dashoffset .8s ease', filter: 'drop-shadow(0 0 8px rgba(182,255,46,.45))' }} />
      <g className="rotate-90 origin-center" textAnchor="middle"><text x="100" y="104" className="num" fontSize="36" fontWeight="700" fill="rgb(var(--ink))">{Math.round(pct)}%</text>
        <text x="100" y="126" fontSize="12" fill="rgb(var(--muted))">spent</text></g>
    </svg>
  )
}

export default function Budgets() {
  const { budgets, setBudgets, notify } = useStore()
  const [edit, setEdit] = useState(null)
  const [val, setVal] = useState('')
  const total = budgets.reduce((s, b) => s + b.target, 0), spent = budgets.reduce((s, b) => s + b.spent, 0)
  const over = budgets.filter((b) => b.spent > b.target), warn = budgets.filter((b) => b.spent / b.target >= 0.85 && b.spent <= b.target)
  const save = (e) => {
    e.preventDefault()
    if (Number(val) > 0) { setBudgets((p) => p.map((b) => (b.category === edit ? { ...b, target: Number(val) } : b))); notify(`${edit} target updated`) }
    setEdit(null)
  }
  return (
    <>
      <PageHeader title="Budgets" sub="Give every dollar a job. Targets reset on the 1st." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-1">
          <h2 className="font-bold">October consumption</h2>
          <div className="my-4"><Ring pct={(spent / total) * 100} /></div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-ink/5 p-3"><p className="text-xs text-mute">Spent</p><p className="num font-bold">{usd(spent)}</p></div>
            <div className="rounded-xl bg-ink/5 p-3"><p className="text-xs text-mute">Budget</p><p className="num font-bold">{usd(total, 0)}</p></div>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            {over.length > 0 && <p className="flex items-start gap-2 text-crimson"><AlertTriangle size={16} className="mt-0.5 shrink-0" />Over budget: {over.map((b) => b.category).join(', ')}</p>}
            {warn.length > 0 && <p className="flex items-start gap-2 text-amber"><AlertTriangle size={16} className="mt-0.5 shrink-0" />Close to the limit: {warn.map((b) => b.category).join(', ')}</p>}
            {!over.length && !warn.length && <p className="flex items-center gap-2 text-emerald"><CheckCircle2 size={16} />Every category is on track.</p>}
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-bold">Zero-based tracker</h2>
            <div className="flex gap-3 text-xs text-mute">{[['bg-spark', 'On track'], ['bg-amber', '85%+'], ['bg-crimson', 'Exceeded']].map(([c, l]) => <span key={l} className="flex items-center gap-1.5"><i className={cx('h-2 w-2 rounded-full', c)} />{l}</span>)}</div>
          </div>
          <ul className="space-y-5">
            {budgets.map((b) => {
              const p = (b.spent / b.target) * 100, tone = budgetTone(p), left = b.target - b.spent
              return (
                <li key={b.category}>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm font-semibold"><span className="h-2.5 w-2.5 rounded-full" style={{ background: CATEGORIES[b.category] }} />{b.category}
                      {p > 100 && <Badge tone="red">Over by {usd(-left)}</Badge>}{p >= 85 && p <= 100 && <Badge tone="amber">{Math.round(p)}% used</Badge>}</span>
                    <span className="flex items-center gap-2 text-xs text-mute"><span className="num">{usd(b.spent, 0)} of {usd(b.target, 0)}</span>
                      <button aria-label={`Edit ${b.category} target`} onClick={() => { setEdit(b.category); setVal(b.target) }} className="rounded-md p-1 hover:bg-ink/10 hover:text-ink"><Pencil size={13} /></button></span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-ink/10"><div className={cx('h-full rounded-full transition-all duration-700', barColor[tone])} style={{ width: Math.min(p, 100) + '%' }} /></div>
                  <p className="mt-1 text-xs text-mute">{left >= 0 ? `${usd(left)} left to assign` : 'Move money from another category to cover this.'}</p>
                </li>)
            })}
          </ul>
        </Card>
      </div>
      <Modal open={!!edit} onClose={() => setEdit(null)} title={`Edit ${edit} target`} width="max-w-sm">
        <form onSubmit={save} className="space-y-4"><Field label="Monthly target (USD)"><input autoFocus type="number" min="1" className={cx(inp, 'num')} value={val} onChange={(e) => setVal(e.target.value)} /></Field>
          <div className="flex justify-end gap-2"><button type="button" className={btnGhost} onClick={() => setEdit(null)}>Cancel</button><button className={btnPrimary}>Save target</button></div></form>
      </Modal>
    </>
  )
}
