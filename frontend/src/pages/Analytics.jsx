import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useStore } from '../store.jsx'
import { CATEGORIES, dailySpend, monthly } from '../data/mock.js'
import { Card, PageHeader, Tabs, chartTooltip, usd } from '../components/ui.jsx'

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function Analytics() {
  const { budgets } = useStore()
  const [range, setRange] = useState('12M')
  const [hover, setHover] = useState(null)
  const bars = range === '6M' ? monthly.slice(-6) : monthly
  const donut = useMemo(() => budgets.filter((b) => b.spent > 0 && b.category !== 'Savings goals').map((b) => ({ name: b.category, value: b.spent })), [budgets])
  const total = donut.reduce((s, d) => s + d.value, 0)
  const offset = new Date(2026, 9, 1).getDay() // Oct 1, 2026 is a Thursday
  const max = Math.max(...dailySpend.filter((_, i) => i > 0))
  const cells = [...Array(offset).fill(null), ...dailySpend.map((v, i) => ({ d: i + 1, v }))]
  const shade = (v) => (v === 0 ? 'rgb(var(--ink) / .05)' : `rgba(182,255,46,${0.15 + 0.85 * Math.min(v / max, 1)})`)
  const axis = { tickLine: false, axisLine: false, tick: { fill: 'rgb(var(--muted))', fontSize: 12 } }

  return (
    <>
      <PageHeader title="Analytics" sub="Spot patterns before they become problems."><Tabs tabs={['6M', '12M']} value={range} onChange={setRange} /></PageHeader>
      <div className="grid gap-4 xl:grid-cols-5">
        <Card className="p-5 xl:col-span-3">
          <h2 className="mb-4 font-bold">Income vs. expenses</h2>
          <div className="h-80"><ResponsiveContainer>
            <BarChart data={bars} margin={{ left: -10 }} barGap={4}>
              <CartesianGrid stroke="rgb(var(--line) / .08)" vertical={false} /><XAxis dataKey="m" {...axis} /><YAxis {...axis} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip {...chartTooltip} formatter={(v) => usd(v)} cursor={{ fill: 'rgb(var(--ink) / .05)' }} /><Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="income" name="Income" fill="#B6FF2E" radius={[6, 6, 0, 0]} /><Bar dataKey="expense" name="Expenses" fill="#EF4444" radius={[6, 6, 0, 0]} />
            </BarChart></ResponsiveContainer></div>
        </Card>
        <Card className="p-5 xl:col-span-2">
          <h2 className="mb-2 font-bold">Where it went in October</h2>
          <div className="relative h-60"><ResponsiveContainer>
            <PieChart><Pie data={donut} dataKey="value" innerRadius={68} outerRadius={100} paddingAngle={3} stroke="none">{donut.map((d) => <Cell key={d.name} fill={CATEGORIES[d.name]} />)}</Pie>
              <Tooltip {...chartTooltip} formatter={(v) => usd(v)} /></PieChart></ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center"><div><p className="text-xs text-mute">Total spent</p><p className="num text-xl font-bold">{usd(total, 0)}</p></div></div></div>
          <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">{donut.map((d) => (
            <li key={d.name} className="flex items-center justify-between"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full" style={{ background: CATEGORIES[d.name] }} />{d.name}</span><span className="num text-mute">{Math.round((d.value / total) * 100)}%</span></li>))}</ul>
        </Card>
      </div>

      <Card className="mt-4 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h2 className="font-bold">Spending heatmap · October 2026</h2>
          <p className="num min-h-5 text-sm text-mute">{hover ? `Oct ${hover.d}: ${usd(hover.v)}` : 'Hover a day to see its spend'}</p></div>
        <div className="grid max-w-xl grid-cols-7 gap-1.5 sm:gap-2">
          {DOW.map((d) => <span key={d} className="pb-1 text-center text-xs text-mute">{d}</span>)}
          {cells.map((c, i) => c ? (
            <button key={i} onMouseEnter={() => setHover(c)} onFocus={() => setHover(c)} onMouseLeave={() => setHover(null)} aria-label={`October ${c.d}: ${usd(c.v)}`}
              className="num grid aspect-square place-items-center rounded-lg text-[11px] font-semibold transition-transform hover:scale-110" style={{ background: shade(c.v), color: c.v / max > 0.5 ? '#000' : 'rgb(var(--ink))' }}>{c.d}</button>
          ) : <span key={i} />)}
        </div>
        <p className="mt-3 text-xs text-mute">Rent on the 1st is the darkest day. Weekends tend to run higher than weekdays.</p>
      </Card>
    </>
  )
}
