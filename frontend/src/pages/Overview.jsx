import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowDownRight, ArrowUpRight, Landmark, PiggyBank, Search, Wallet, TrendingUp, AlertTriangle } from 'lucide-react'
import { useStore } from '../store.jsx'
import { useT } from '../i18n/index.js'
import { Badge, Card, Money, PageHeader, chartTooltip, cx, fmtDate, inp, usd } from '../components/ui.jsx'

export const budgetTone = (p) => (p > 100 ? 'red' : p >= 85 ? 'amber' : 'lime')
export const barColor = { red: 'bg-crimson', amber: 'bg-amber', lime: 'bg-spark' }

export default function Overview() {
  const { txs, budgets } = useStore()
  const t = useT()
  const [range, setRange] = useState('12M')
  const [q, setQ] = useState('')

  const income = useMemo(
    () => txs.filter((tx) => tx.amount > 0).reduce((s, tx) => s + tx.amount, 0),
    [txs],
  )
  const expenses = useMemo(
    () => txs.filter((tx) => tx.amount < 0).reduce((s, tx) => s + Math.abs(tx.amount), 0),
    [txs],
  )
  const savings = income - expenses
  const netWorth = savings

  const metrics = [
    {
      label: t('ov.netWorth'),
      value: netWorth,
      Icon: Landmark,
      delta: txs.length ? '' : t('ov.addData'),
      up: netWorth >= 0,
    },
    {
      label: t('ov.income'),
      value: income,
      Icon: Wallet,
      delta: '',
      up: true,
    },
    {
      label: t('ov.expenses'),
      value: expenses,
      Icon: TrendingUp,
      delta: '',
      up: false,
    },
    {
      label: t('ov.savings'),
      value: savings,
      Icon: PiggyBank,
      delta: income > 0 ? t('ov.ofIncome', { pct: Math.round((savings / income) * 100) }) : '',
      up: savings >= 0,
    },
  ]

  const chartData = useMemo(() => {
    const map = {}
    txs.forEach((tx) => {
      const key = tx.date?.slice(0, 7) || 'Unknown'
      if (!map[key]) map[key] = { month: key, income: 0, expense: 0 }
      if (tx.amount > 0) map[key].income += tx.amount
      else map[key].expense += Math.abs(tx.amount)
    })
    const all = Object.values(map).sort((a, b) => a.month.localeCompare(b.month))
    return range === '6M' ? all.slice(-6) : all
  }, [txs, range])

  const recent = useMemo(
    () =>
      txs
        .filter((tx) => (tx.merchant + tx.category).toLowerCase().includes(q.toLowerCase()))
        .slice(0, 6),
    [txs, q],
  )

  return (
    <>
      <PageHeader title={t('ov.title')} sub={t('ov.sub')} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, Icon, delta, up }) => (
          <Card key={label} hover className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-mute">{label}</span>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-spark/12 text-accent">
                <Icon size={18} />
              </span>
            </div>
            <p className="num mt-3 text-2xl font-bold">{usd(value)}</p>
            {delta && (
              <p className={cx('mt-1 inline-flex items-center gap-1 text-xs font-semibold', up ? 'text-emerald' : 'text-crimson')}>
                {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {delta}
              </p>
            )}
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-bold">{t('ov.cashflow')}</h2>
              <p className="text-xs text-mute">{t('ov.cashflowSub')}</p>
            </div>
            <div className="flex gap-1 rounded-lg bg-ink/5 p-1">
              {['6M', '12M'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={cx('rounded-md px-3 py-1 text-xs font-bold', range === r ? 'bg-spark text-black' : 'text-mute')}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {chartData.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-mute">{t('ov.noChart')}</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="inc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B6FF2E" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#B6FF2E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={chartTooltip} />
                <Area type="monotone" dataKey="income" stroke="#B6FF2E" fill="url(#inc)" strokeWidth={2} />
                <Area type="monotone" dataKey="expense" stroke="#EF4444" fill="transparent" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 font-bold">{t('ov.budgets')}</h2>
          <div className="space-y-4">
            {budgets.filter((b) => b.spent > 0).slice(0, 6).map((b) => {
              const p = (b.spent / b.target) * 100
              const tone = budgetTone(p)
              return (
                <div key={b.category}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 font-semibold">
                      {b.category}
                      {p >= 85 && (
                        <AlertTriangle size={13} className={p > 100 ? 'text-crimson' : 'text-amber'} />
                      )}
                    </span>
                    <span className="num text-xs text-mute">
                      {usd(b.spent, 0)} / {usd(b.target, 0)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-ink/10">
                    <div
                      className={cx('h-full rounded-full transition-all duration-500', barColor[tone])}
                      style={{ width: Math.min(p, 100) + '%' }}
                    />
                  </div>
                </div>
              )
            })}
            {budgets.length === 0 && <p className="text-sm text-mute">{t('ov.noBudgets')}</p>}
          </div>
        </Card>
      </div>

      <Card className="mt-4 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-bold">{t('ov.recent')}</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t('ov.search')}
                className={cx(inp, 'w-48 pl-9')}
              />
            </div>
            <Link to="/transactions" className="text-xs font-semibold text-accent">
              {t('ov.seeAll')}
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="text-left text-xs text-mute">
                <th className="pb-2 font-semibold">{t('ov.merchant')}</th>
                <th className="pb-2 font-semibold">{t('ov.category')}</th>
                <th className="pb-2 font-semibold">{t('ov.date')}</th>
                <th className="pb-2 text-right font-semibold">{t('ov.amount')}</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((tx) => (
                <tr key={tx.id} className="border-t border-line">
                  <td className="py-3 font-semibold">{tx.merchant}</td>
                  <td>
                    <Badge>{tx.category}</Badge>
                  </td>
                  <td className="text-mute">{fmtDate(tx.date)}</td>
                  <td className="text-right">
                    <Money value={tx.amount} sign />
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-mute">
                    {t('ov.noTx')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}