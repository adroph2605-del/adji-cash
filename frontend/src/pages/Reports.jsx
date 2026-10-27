import { useMemo } from 'react'
import { useStore } from '../store.jsx'
import { CATEGORIES } from '../data/mock.js'
import { Badge, Card, PageHeader, usd } from '../components/ui.jsx'

export default function Reports() {
  const { txs, receipts } = useStore()

  const income = useMemo(() => txs.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0), [txs])
  const spent = useMemo(() => txs.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0), [txs])

  const byCategory = useMemo(() => {
    const map = {}
    txs.filter((t) => t.amount < 0).forEach((t) => {
      map[t.category] = (map[t.category] || 0) + Math.abs(t.amount)
    })
    return Object.entries(map)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
  }, [txs])

  return (
    <>
      <PageHeader title="Reports & Receipts" sub="Export-ready summaries of your money." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm font-semibold text-mute">Total income</p>
          <p className="num mt-2 text-2xl font-bold text-emerald">{usd(income)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-semibold text-mute">Total spent</p>
          <p className="num mt-2 text-2xl font-bold text-crimson">{usd(spent)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-semibold text-mute">Net</p>
          <p className="num mt-2 text-2xl font-bold">{usd(income - spent)}</p>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 font-bold">Spending by category</h2>
          {byCategory.length === 0 ? (
            <p className="py-8 text-center text-sm text-mute">No spending data yet.</p>
          ) : (
            <ul className="space-y-3">
              {byCategory.map(({ category, amount }) => (
                <li key={category} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-semibold">
                    <i className="h-2.5 w-2.5 rounded-full" style={{ background: CATEGORIES[category] || '#64748B' }} />
                    {category}
                  </span>
                  <span className="num text-mute">{usd(amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 font-bold">Receipts</h2>
          {receipts.length === 0 ? (
            <p className="py-8 text-center text-sm text-mute">
              No receipts yet. Attach receipts when you add transactions (Pro feature UI).
            </p>
          ) : (
            <ul className="space-y-3">
              {receipts.map((r) => (
                <li key={r.id} className="flex items-center justify-between rounded-xl border border-line px-3 py-2.5 text-sm">
                  <div>
                    <p className="font-semibold">{r.merchant}</p>
                    <p className="text-xs text-mute">
                      {r.date} · {r.file}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="num font-semibold">{usd(r.total)}</p>
                    <Badge>{r.category}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  )
}