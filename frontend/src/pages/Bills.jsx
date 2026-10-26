import { useMemo, useState } from 'react'
import { CalendarClock, Check, Plus, Repeat } from 'lucide-react'
import { useStore } from '../store.jsx'
import { CATEGORIES } from '../data/mock.js'
import { Badge, Card, Field, Modal, PageHeader, Tabs, btnGhost, btnPrimary, cx, fmtDate, inp, usd } from '../components/ui.jsx'

const tone = { Paid: 'green', Upcoming: 'amber', Overdue: 'red' }

export default function Bills() {
  const { bills, setBills, notify } = useStore()
  const [tab, setTab] = useState('All')
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ name: '', amount: '', due: '2026-11-05', category: 'Subscriptions', cycle: 'Monthly' })
  const list = useMemo(() => bills.filter((b) => tab === 'All' || b.status === tab).sort((a, b) => a.due.localeCompare(b.due)), [bills, tab])
  const sum = (s) => bills.filter((b) => b.status === s).reduce((t, b) => t + b.amount, 0)
  const pay = (id) => { setBills((p) => p.map((b) => (b.id === id ? { ...b, status: 'Paid' } : b))); notify('Marked as paid') }
  const add = (e) => {
    e.preventDefault()
    if (!f.name.trim() || !(Number(f.amount) > 0)) return
    setBills((p) => [...p, { id: 'b' + Date.now(), ...f, name: f.name.trim(), amount: Number(f.amount), status: f.due < '2026-10-24' ? 'Overdue' : 'Upcoming' }])
    setOpen(false); setF({ ...f, name: '', amount: '' }); notify('Bill added')
  }
  return (
    <>
      <PageHeader title="Bills & Subscriptions" sub="Never pay a late fee again.">
        <button className={btnPrimary} onClick={() => setOpen(true)}><Plus size={16} strokeWidth={3} />Add bill</button></PageHeader>
      <div className="grid gap-4 sm:grid-cols-3">
        {[['Overdue', 'text-crimson'], ['Upcoming', 'text-amber'], ['Paid', 'text-emerald']].map(([s, c]) => (
          <Card key={s} className="p-5"><p className="text-sm font-semibold text-mute">{s}</p><p className={cx('num mt-2 text-2xl font-bold', c)}>{usd(sum(s))}</p>
            <p className="text-xs text-mute">{bills.filter((b) => b.status === s).length} bills</p></Card>))}
      </div>
      <div className="mt-6"><Tabs tabs={['All', 'Upcoming', 'Overdue', 'Paid']} value={tab} onChange={setTab} /></div>
      <ul className="mt-4 space-y-3">
        {list.map((b) => (
          <Card key={b.id} hover className="flex flex-wrap items-center gap-4 p-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: CATEGORIES[b.category] + '26', color: CATEGORIES[b.category] }}><CalendarClock size={20} /></span>
            <div className="min-w-0 flex-1"><p className="font-bold">{b.name}</p>
              <p className="flex items-center gap-2 text-xs text-mute"><span>Due {fmtDate(b.due)}</span><span className="flex items-center gap-1"><Repeat size={11} />{b.cycle}</span></p></div>
            <Badge tone={tone[b.status]}>{b.status}</Badge>
            <p className="num w-24 text-right font-bold">{usd(b.amount)}</p>
            {b.status !== 'Paid' ? <button className={cx(btnGhost, 'py-2')} onClick={() => pay(b.id)}><Check size={15} />Mark paid</button> : <span className="w-[116px]" />}
          </Card>))}
        {!list.length && <p className="rounded-2xl border border-dashed border-line p-10 text-center text-sm text-mute">Nothing here. Switch tabs or add a bill.</p>}
      </ul>
      <Modal open={open} onClose={() => setOpen(false)} title="Add bill" width="max-w-md">
        <form onSubmit={add} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Field label="Name"><input autoFocus className={inp} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Gym membership" /></Field></div>
          <Field label="Amount (USD)"><input type="number" min="0" step="0.01" className={cx(inp, 'num')} value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></Field>
          <Field label="Due date"><input type="date" className={inp} value={f.due} onChange={(e) => setF({ ...f, due: e.target.value })} /></Field>
          <Field label="Category"><select className={inp} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{Object.keys(CATEGORIES).filter((c) => c !== 'Income').map((c) => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Repeats"><select className={inp} value={f.cycle} onChange={(e) => setF({ ...f, cycle: e.target.value })}>{['Monthly', 'Quarterly', 'Yearly'].map((c) => <option key={c}>{c}</option>)}</select></Field>
          <div className="sm:col-span-2 flex justify-end gap-2"><button type="button" className={btnGhost} onClick={() => setOpen(false)}>Cancel</button><button className={btnPrimary}>Add bill</button></div>
        </form>
      </Modal>
    </>
  )
}
