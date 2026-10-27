import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useStore } from '../store.jsx'
import { CATEGORIES } from '../data/mock.js'
import { Badge, Card, Field, Modal, PageHeader, btnGhost, btnPrimary, cx, inp, usd } from '../components/ui.jsx'

export default function Bills() {
  const { bills, setBills, notify } = useStore()
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ name: '', category: 'Subscriptions', amount: '', due: '', cycle: 'Monthly' })
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }))

  const add = (e) => {
    e.preventDefault()
    if (!f.name.trim() || !Number(f.amount)) return
    setBills((p) => [
      {
        id: 'b' + Date.now(),
        name: f.name.trim(),
        category: f.category,
        amount: Number(f.amount),
        due: f.due || new Date().toISOString().slice(0, 10),
        status: 'Upcoming',
        cycle: f.cycle,
      },
      ...p,
    ])
    notify('Bill added')
    setF({ name: '', category: 'Subscriptions', amount: '', due: '', cycle: 'Monthly' })
    setOpen(false)
  }

  const remove = (id) => {
    setBills((p) => p.filter((b) => b.id !== id))
    notify('Bill removed')
  }

  const total = bills.reduce((s, b) => s + b.amount, 0)

  return (
    <>
      <PageHeader title="Bills & Subscriptions" sub="Never miss a payment.">
        <button className={btnPrimary} onClick={() => setOpen(true)}>
          <Plus size={16} /> Add bill
        </button>
      </PageHeader>

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm font-semibold text-mute">Active bills</p>
          <p className="num mt-2 text-2xl font-bold">{bills.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-semibold text-mute">Monthly total</p>
          <p className="num mt-2 text-2xl font-bold">{usd(total)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-semibold text-mute">Overdue</p>
          <p className="num mt-2 text-2xl font-bold text-crimson">
            {bills.filter((b) => b.status === 'Overdue').length}
          </p>
        </Card>
      </div>

      {bills.length === 0 ? (
        <Card className="p-10 text-center text-sm text-mute">
          No bills yet. Click “Add bill” to track rent, Netflix, or any recurring payment.
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-mute">
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 font-semibold">Due</th>
                <th className="px-5 py-3 font-semibold">Cycle</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Amount</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {bills.map((b) => (
                <tr key={b.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3 font-semibold">{b.name}</td>
                  <td className="px-5 py-3 text-mute">{b.category}</td>
                  <td className="px-5 py-3 text-mute">{b.due}</td>
                  <td className="px-5 py-3 text-mute">{b.cycle}</td>
                  <td className="px-5 py-3">
                    <Badge tone={b.status === 'Overdue' ? 'red' : b.status === 'Paid' ? 'green' : 'amber'}>
                      {b.status}
                    </Badge>
                  </td>
                  <td className="num px-5 py-3 text-right font-semibold">{usd(b.amount)}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      aria-label="Delete bill"
                      className="rounded-lg p-1.5 text-mute hover:bg-crimson/10 hover:text-crimson"
                      onClick={() => remove(b.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add bill" width="max-w-md">
        <form onSubmit={add} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Name">
              <input className={inp} value={f.name} onChange={set('name')} placeholder="e.g. Netflix" autoFocus />
            </Field>
          </div>
          <Field label="Amount">
            <input className={cx(inp, 'num')} type="number" min="0" step="0.01" value={f.amount} onChange={set('amount')} />
          </Field>
          <Field label="Due date">
            <input className={inp} type="date" value={f.due} onChange={set('due')} />
          </Field>
          <Field label="Category">
            <select className={inp} value={f.category} onChange={set('category')}>
              {Object.keys(CATEGORIES).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Cycle">
            <select className={inp} value={f.cycle} onChange={set('cycle')}>
              {['Weekly', 'Monthly', 'Quarterly', 'Yearly'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button type="button" className={btnGhost} onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button className={btnPrimary}>Save bill</button>
          </div>
        </form>
      </Modal>
    </>
  )
}