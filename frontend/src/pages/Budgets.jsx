import { useMemo, useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import { useStore } from '../store.jsx'
import { CATEGORIES } from '../data/mock.js'
import { budgetTone, barColor } from './Overview.jsx'
import { Badge, Card, Field, Modal, PageHeader, btnGhost, btnPrimary, cx, inp, usd } from '../components/ui.jsx'

export default function Budgets() {
  const { txs, budgets, setBudgets, notify } = useStore()
  const [edit, setEdit] = useState(null)
  const [val, setVal] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [newCat, setNewCat] = useState('Groceries')
  const [newTarget, setNewTarget] = useState('500')

  // Live spent from user's transactions
  const spentMap = useMemo(() => {
    const map = {}
    txs.filter((t) => t.amount < 0).forEach((t) => {
      map[t.category] = (map[t.category] || 0) + Math.abs(t.amount)
    })
    return map
  }, [txs])

  const rows = useMemo(
    () =>
      budgets.map((b) => ({
        ...b,
        spent: spentMap[b.category] || 0,
      })),
    [budgets, spentMap],
  )

  const assigned = rows.reduce((s, b) => s + b.target, 0)
  const spent = rows.reduce((s, b) => s + b.spent, 0)

  const save = (e) => {
    e.preventDefault()
    const n = Number(val)
    if (!n || n < 1) return
    setBudgets((p) => p.map((b) => (b.category === edit ? { ...b, target: n } : b)))
    notify('Budget updated')
    setEdit(null)
  }

  const addBudget = (e) => {
    e.preventDefault()
    const n = Number(newTarget)
    if (!n || n < 1) return
    if (budgets.some((b) => b.category === newCat)) {
      notify('Category already has a budget')
      return
    }
    setBudgets((p) => [...p, { category: newCat, target: n, spent: 0 }])
    notify('Budget created')
    setAddOpen(false)
  }

  return (
    <>
      <PageHeader title="Budgets" sub="Give every dollar a job.">
        <button className={btnPrimary} onClick={() => setAddOpen(true)}>
          <Plus size={16} /> Add budget
        </button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm font-semibold text-mute">Assigned</p>
          <p className="num mt-2 text-2xl font-bold">{usd(assigned, 0)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-semibold text-mute">Spent</p>
          <p className="num mt-2 text-2xl font-bold">{usd(spent, 0)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-semibold text-mute">Left</p>
          <p className="num mt-2 text-2xl font-bold text-accent">{usd(assigned - spent, 0)}</p>
        </Card>
      </div>

      <div className="mt-4">
        <Card className="p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-bold">Zero-based tracker</h2>
            <div className="flex gap-3 text-xs text-mute">
              {[
                ['bg-spark', 'On track'],
                ['bg-amber', '85%+'],
                ['bg-crimson', 'Exceeded'],
              ].map(([c, l]) => (
                <span key={l} className="flex items-center gap-1.5">
                  <i className={cx('h-2 w-2 rounded-full', c)} />
                  {l}
                </span>
              ))}
            </div>
          </div>

          {rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-mute">
              No budgets yet. Click “Add budget” to set category limits. Spending updates automatically from your transactions.
            </p>
          ) : (
            <ul className="space-y-5">
              {rows.map((b) => {
                const p = b.target ? (b.spent / b.target) * 100 : 0
                const tone = budgetTone(p)
                const left = b.target - b.spent
                return (
                  <li key={b.category}>
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-sm font-semibold">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: CATEGORIES[b.category] }} />
                        {b.category}
                        {p > 100 && <Badge tone="red">Over by {usd(-left)}</Badge>}
                        {p >= 85 && p <= 100 && <Badge tone="amber">{Math.round(p)}% used</Badge>}
                      </span>
                      <span className="flex items-center gap-2 text-xs text-mute">
                        <span className="num">
                          {usd(b.spent, 0)} of {usd(b.target, 0)}
                        </span>
                        <button
                          aria-label={`Edit ${b.category} target`}
                          onClick={() => {
                            setEdit(b.category)
                            setVal(b.target)
                          }}
                          className="rounded-md p-1 hover:bg-ink/10 hover:text-ink"
                        >
                          <Pencil size={13} />
                        </button>
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-ink/10">
                      <div
                        className={cx('h-full rounded-full transition-all duration-700', barColor[tone])}
                        style={{ width: Math.min(p, 100) + '%' }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-mute">
                      {left >= 0 ? `${usd(left)} left to assign` : 'Move money from another category to cover this.'}
                    </p>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>

      <Modal open={!!edit} onClose={() => setEdit(null)} title={`Edit ${edit} target`} width="max-w-sm">
        <form onSubmit={save} className="space-y-4">
          <Field label="Monthly target (USD)">
            <input autoFocus type="number" min="1" className={cx(inp, 'num')} value={val} onChange={(e) => setVal(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-2">
            <button type="button" className={btnGhost} onClick={() => setEdit(null)}>
              Cancel
            </button>
            <button className={btnPrimary}>Save target</button>
          </div>
        </form>
      </Modal>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add budget" width="max-w-sm">
        <form onSubmit={addBudget} className="space-y-4">
          <Field label="Category">
            <select className={inp} value={newCat} onChange={(e) => setNewCat(e.target.value)}>
              {Object.keys(CATEGORIES)
                .filter((c) => c !== 'Income')
                .map((c) => (
                  <option key={c}>{c}</option>
                ))}
            </select>
          </Field>
          <Field label="Monthly target (USD)">
            <input type="number" min="1" className={cx(inp, 'num')} value={newTarget} onChange={(e) => setNewTarget(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-2">
            <button type="button" className={btnGhost} onClick={() => setAddOpen(false)}>
              Cancel
            </button>
            <button className={btnPrimary}>Create</button>
          </div>
        </form>
      </Modal>
    </>
  )
}