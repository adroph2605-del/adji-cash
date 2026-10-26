import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Download, Printer, Search, Tag, Trash2, Receipt, ArrowDownLeft, ArrowUpRight, Scale } from 'lucide-react'
import { useStore } from '../store.jsx'
import { ACCOUNT_NAMES, CATEGORIES } from '../data/mock.js'
import { Badge, Card, Drawer, Field, Money, PageHeader, btnGhost, cx, downloadFile, fmtDate, inp, usd } from '../components/ui.jsx'

const PAGE = 10
const COLS = [['date', 'Date'], ['merchant', 'Merchant'], ['category', 'Category'], ['account', 'Account'], ['amount', 'Amount']]

export default function Transactions() {
  const { txs, updateTx, deleteTx, setAddOpen, notify } = useStore()
  const [params] = useSearchParams()
  const [q, setQ] = useState(params.get('q') || '')
  const [cat, setCat] = useState('All'), [acct, setAcct] = useState('All')
  const [from, setFrom] = useState(''), [to, setTo] = useState('')
  const [sort, setSort] = useState({ key: 'date', dir: 'desc' })
  const [page, setPage] = useState(1)
  const [openId, setOpenId] = useState(null)
  const [confirmDel, setConfirmDel] = useState(false)
  useEffect(() => { setQ(params.get('q') || '') }, [params])
  useEffect(() => setPage(1), [q, cat, acct, from, to])

  const rows = useMemo(() => {
    const s = q.toLowerCase()
    const f = txs.filter((t) => (!s || (t.merchant + t.description + t.tag).toLowerCase().includes(s)) && (cat === 'All' || t.category === cat)
      && (acct === 'All' || t.account === acct) && (!from || t.date >= from) && (!to || t.date <= to))
    const m = sort.dir === 'asc' ? 1 : -1
    return [...f].sort((a, b) => (a[sort.key] > b[sort.key] ? 1 : a[sort.key] < b[sort.key] ? -1 : 0) * m)
  }, [txs, q, cat, acct, from, to, sort])

  const inflow = rows.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const outflow = rows.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0)
  const pages = Math.max(1, Math.ceil(rows.length / PAGE))
  const view = rows.slice((page - 1) * PAGE, page * PAGE)
  const open = txs.find((t) => t.id === openId)
  const toggleSort = (key) => setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'amount' || key === 'date' ? 'desc' : 'asc' }))
  const exportCsv = () => {
    const esc = (v) => `"${String(v).replace(/"/g, '""')}"`
    downloadFile('adji-cash-transactions.csv', ['Date,Merchant,Description,Category,Account,Amount', ...rows.map((t) => [t.date, t.merchant, t.description, t.category, t.account, t.amount].map(esc).join(','))].join('\n'), 'text/csv')
    notify(`Exported ${rows.length} transactions`)
  }

  const summary = [['Inflow', inflow, ArrowDownLeft, 'text-emerald'], ['Outflow', outflow, ArrowUpRight, 'text-crimson'], ['Net', inflow + outflow, Scale, 'text-accent']]
  return (
    <>
      <PageHeader title="Transactions" sub={`${rows.length} of ${txs.length} transactions`}>
        <button className={btnGhost} onClick={exportCsv}><Download size={16} />Export CSV</button>
        <button className={btnGhost} onClick={() => window.print()}><Printer size={16} />Export PDF</button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        {summary.map(([l, v, I, c]) => (
          <Card key={l} className="flex items-center gap-4 p-5"><span className={cx('grid h-11 w-11 place-items-center rounded-xl bg-ink/5', c)}><I size={20} /></span>
            <div><p className="text-xs font-semibold text-mute">{l}</p><Money value={v} className={cx('text-xl font-bold', l === 'Net' && (v < 0 ? 'text-crimson' : 'text-ink'))} /></div></Card>))}
      </div>

      <Card className="mt-4 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <div className="relative lg:col-span-2"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
            <input aria-label="Search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search merchant, note or tag" className={cx(inp, 'pl-9')} /></div>
          <select aria-label="Category" className={inp} value={cat} onChange={(e) => setCat(e.target.value)}><option value="All">All categories</option>{Object.keys(CATEGORIES).map((c) => <option key={c}>{c}</option>)}</select>
          <select aria-label="Account" className={inp} value={acct} onChange={(e) => setAcct(e.target.value)}><option value="All">All accounts</option>{ACCOUNT_NAMES.map((a) => <option key={a}>{a}</option>)}</select>
          <input aria-label="From date" type="date" className={inp} value={from} onChange={(e) => setFrom(e.target.value)} />
          <input aria-label="To date" type="date" className={inp} value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        {(q || cat !== 'All' || acct !== 'All' || from || to) && (
          <button className="mt-3 text-xs font-semibold text-accent" onClick={() => { setQ(''); setCat('All'); setAcct('All'); setFrom(''); setTo('') }}>Clear all filters</button>)}
      </Card>

      <Card className="mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-ink/[0.03] text-left text-xs text-mute">
              <tr>{COLS.map(([k, l]) => (
                <th key={k} className={cx('px-4 py-3 font-semibold', k === 'amount' && 'text-right')} aria-sort={sort.key === k ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <button onClick={() => toggleSort(k)} className="inline-flex items-center gap-1 hover:text-ink">{l}
                    {sort.key === k ? (sort.dir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} className="opacity-40" />}</button></th>))}
                <th className="px-4 py-3 text-right font-semibold">Actions</th></tr>
            </thead>
            <tbody>
              {view.map((t) => (
                <tr key={t.id} onClick={() => setOpenId(t.id)} className="cursor-pointer border-t border-line transition-colors hover:bg-hover">
                  <td className="whitespace-nowrap px-4 py-3 text-mute">{fmtDate(t.date)}</td>
                  <td className="px-4 py-3"><p className="font-semibold">{t.merchant}</p><p className="text-xs text-mute">{t.description}</p></td>
                  <td className="px-4 py-3"><span className="inline-flex items-center gap-2 text-xs font-semibold"><span className="h-2 w-2 rounded-full" style={{ background: CATEGORIES[t.category] }} />{t.category}</span></td>
                  <td className="px-4 py-3 text-mute">{t.account}</td>
                  <td className="px-4 py-3 text-right font-semibold"><Money value={t.amount} sign /></td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <button aria-label={`Delete ${t.merchant}`} className="rounded-lg p-2 text-mute hover:bg-crimson/15 hover:text-crimson" onClick={() => deleteTx(t.id)}><Trash2 size={15} /></button></td>
                </tr>))}
              {!view.length && <tr><td colSpan={6} className="px-4 py-14 text-center text-mute">No transactions match these filters. Clear a filter or <button className="font-semibold text-accent" onClick={() => setAddOpen(true)}>add a transaction</button>.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-line px-4 py-3 text-xs text-mute">
          <span>Page {page} of {pages}</span>
          <div className="flex gap-1">
            <button aria-label="Previous page" disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-line p-1.5 hover:bg-hover disabled:opacity-30"><ChevronLeft size={15} /></button>
            <button aria-label="Next page" disabled={page === pages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-line p-1.5 hover:bg-hover disabled:opacity-30"><ChevronRight size={15} /></button>
          </div>
        </div>
      </Card>

      <Drawer open={!!open} onClose={() => { setOpenId(null); setConfirmDel(false) }} title="Transaction details">
        {open && (
          <div className="space-y-5">
            <div className="rounded-2xl bg-onyx/60 p-5 text-center border border-line">
              <p className="text-sm text-mute">{open.merchant}</p>
              <Money value={open.amount} sign className="mt-1 block text-3xl font-bold" />
              <p className="mt-1 text-xs text-mute">{fmtDate(open.date)} · {open.account}</p>
            </div>
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-mute"><Receipt size={14} />Receipt</p>
              {open.receipt ? (
                <div className="mx-auto w-44 rotate-[-1.5deg] rounded-md bg-white p-4 text-[10px] leading-4 text-neutral-700 shadow-xl" aria-label="Receipt thumbnail">
                  <p className="text-center font-bold uppercase tracking-wide text-neutral-900">{open.merchant}</p><p className="text-center">{fmtDate(open.date)}</p>
                  <div className="my-2 border-t border-dashed border-neutral-400" />
                  <div className="flex justify-between"><span>{open.description.slice(0, 18)}</span><span className="font-mono">{usd(Math.abs(open.amount))}</span></div>
                  <div className="my-2 border-t border-dashed border-neutral-400" />
                  <div className="flex justify-between font-bold"><span>TOTAL</span><span className="font-mono">{usd(Math.abs(open.amount))}</span></div>
                </div>
              ) : <p className="rounded-xl border border-dashed border-line p-4 text-center text-xs text-mute">No receipt attached to this transaction.</p>}
            </div>
            <Field label="Category">
              <select className={inp} value={open.category} onChange={(e) => { updateTx(open.id, { category: e.target.value }); notify('Category updated') }}>
                {Object.keys(CATEGORIES).map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Merchant tag"><div className="relative"><Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
              <input className={cx(inp, 'pl-9')} value={open.tag} onChange={(e) => updateTx(open.id, { tag: e.target.value })} /></div></Field>
            <Field label="Notes"><textarea rows={3} className={inp} value={open.notes} placeholder="Add a note…" onChange={(e) => updateTx(open.id, { notes: e.target.value })} /></Field>
            {!confirmDel ? (
              <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-crimson/40 py-2.5 text-sm font-semibold text-crimson hover:bg-crimson/10" onClick={() => setConfirmDel(true)}><Trash2 size={16} />Delete transaction</button>
            ) : (
              <div className="rounded-xl border border-crimson/40 bg-crimson/10 p-4"><p className="text-sm font-semibold">Delete this transaction permanently?</p>
                <div className="mt-3 flex gap-2"><button className={cx(btnGhost, 'flex-1')} onClick={() => setConfirmDel(false)}>Keep it</button>
                  <button className="flex-1 rounded-xl bg-crimson py-2.5 text-sm font-bold text-white" onClick={() => { deleteTx(open.id); setOpenId(null); setConfirmDel(false) }}>Delete</button></div></div>)}
          </div>)}
      </Drawer>
    </>
  )
}
