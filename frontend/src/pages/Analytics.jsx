import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useStore } from '../store.jsx'
import { CATEGORIES } from '../data/mock.js'
import { Card, PageHeader, Tabs, chartTooltip, usd } from '../components/ui.jsx'

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function Analytics() {
  const { txs } = useStore()
  const [range, setRange] = useState('12M')
  const [hover, setHover] = useState(null)

  // Income vs expenses by month from real txs
  const bars = useMemo(() => {
    const map = {}
    txs.forEach((tx) => {
      const key = tx.date?.slice(0, 7)
      if (!key) return
      if (!map[key]) map[key] = { key, m: MONTH_LABELS[Number(key.slice(5, 7)) - 1] || key, income: 0, expense: 0 }
      if (tx.amount > 0) map[key].income += tx.amount
      else map[key].expense += Math.abs(tx.amount)
    })
    const all = Object.values(map).sort((a, b) => a.key.localeCompare(b.key))
    return range === '6M' ? all.slice(-6) : all
  }, [txs, range])

  // Category breakdown from expenses
  const donut = useMemo(() => {
    const map = {}
    txs.filter((tx) => tx.amount < 0).forEach((tx) => {
      const c = tx.category || 'Other'
      map[c] = (map[c] || 0) + Math.abs(tx.amount)
    })
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [txs])

  const total = donut.reduce((s, d) => s + d.value, 0)

  // Heatmap: daily spend for current month from real txs
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const offset = new Date(year, month, 1).getDay()

  const dailySpend = useMemo(() => {
    const arr = Array(daysInMonth + 1).fill(0)
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`
    txs.forEach((tx) => {
      if (tx.amount >= 0 || !tx.date?.startsWith(prefix)) return
      const d = Number(tx.date.slice(8, 10))
      if (d >= 1 && d <= daysInMonth) arr[d] += Math.abs(tx.amount)
    })
    return arr
  }, [txs, year, month, daysInMonth])

  const max = Math.max(1, ...dailySpend.slice(1))
  const cells = [...Array(offset).fill(null), ...dailySpend.slice(1).map((v, i) => ({ d: i + 1, v }))]
  const shade = (v) => (v === 0 ? 'rgb(var(--ink) / .05)' : `rgba(182,255,46,${0.15 + 0.85 * Math.min(v / max, 1)})`)
  const axis = { tickLine: false, axisLine: false, tick: { fill: 'rgb(var(--muted))', fontSize: 12 } }

  return (
    <>
      <PageHeader title="Analytics" sub="Spot patterns before they become problems.">
        <Tabs tabs={['6M', '12M']} value={range} onChange={setRange} />
      </PageHeader>

      <div className="grid gap-4 xl:grid-cols-5">
        <Card className="p-5 xl:col-span-3">
          <h2 className="mb-4 font-bold">Income vs. expenses</h2>
          {bars.length === 0 ? (
            <div className="flex h-80 items-center justify-center text-sm text-mute">
              No data yet. Add transactions to see charts.
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer>
                <BarChart data={bars} margin={{ left: -10 }} barGap={4}>
                  <CartesianGrid stroke="rgb(var(--line) / .08)" vertical={false} />
                  <XAxis dataKey="m" {...axis} />
                  <YAxis {...axis} tickFormatter={(v) => (v >= 1000 ? `$${v / 1000}k` : `$${v}`)} />
                  <Tooltip {...chartTooltip} formatter={(v) => usd(v)} cursor={{ fill: 'rgb(var(--ink) / .05)' }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="income" name="Income" fill="#B6FF2E" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expense" name="Expenses" fill="#EF4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="p-5 xl:col-span-2">
          <h2 className="mb-2 font-bold">Where it went</h2>
          {donut.length === 0 ? (
            <div className="flex h-60 items-center justify-center text-sm text-mute">No expenses yet.</div>
          ) : (
            <>
              <div className="relative h-60">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={donut}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                      onMouseEnter={(_, i) => setHover(i)}
                      onMouseLeave={() => setHover(null)}
                    >
                      {donut.map((d, i) => (
                        <Cell key={d.name} fill={CATEGORIES[d.name] || '#64748B'} opacity={hover === null || hover === i ? 1 : 0.4} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => usd(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-xs text-mute">Total</p>
                  <p className="num text-lg font-bold">{usd(total, 0)}</p>
                </div>
              </div>
              <ul className="mt-2 space-y-1.5">
                {donut.slice(0, 6).map((d) => (
                  <li key={d.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <i className="h-2 w-2 rounded-full" style={{ background: CATEGORIES[d.name] || '#64748B' }} />
                      {d.name}
                    </span>
                    <span className="num text-mute">{usd(d.value, 0)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
      </div>

      <Card className="mt-4 p-5">
        <h2 className="mb-1 font-bold">Daily spending heatmap</h2>
        <p className="mb-4 text-xs text-mute">Current month · darker = more spent</p>
        <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] text-mute">
          {DOW.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((c, i) =>
            c === null ? (
              <div key={`e-${i}`} />
            ) : (
              <div
                key={c.d}
                title={`Day ${c.d}: ${usd(c.v)}`}
                className="flex aspect-square items-center justify-center rounded-md text-[10px] font-semibold"
                style={{ background: shade(c.v) }}
              >
                {c.d}
              </div>
            ),
          )}
        </div>
        {txs.length === 0 && (
          <p className="mt-4 text-center text-sm text-mute">Add transactions to fill the heatmap.</p>
        )}
      </Card>
    </>
  )
}