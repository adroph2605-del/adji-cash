import { useMemo, useState } from 'react'
import { Download, Eye, FileImage, FileText, Search, Upload } from 'lucide-react'
import { useStore } from '../store.jsx'
import { CATEGORIES } from '../data/mock.js'
import { Badge, Card, Modal, Money, PageHeader, btnPrimary, cx, downloadFile, fmtDate, inp, usd } from '../components/ui.jsx'

export default function Reports() {
  const { receipts, setReceipts, notify } = useStore()
  const [q, setQ] = useState(''), [cat, setCat] = useState('All'), [view, setView] = useState(null)
  const list = useMemo(() => receipts.filter((r) => r.merchant.toLowerCase().includes(q.toLowerCase()) && (cat === 'All' || r.category === cat)), [receipts, q, cat])
  const download = (r) => { downloadFile(r.file + '.txt', `Adji Cash receipt\nMerchant: ${r.merchant}\nDate: ${r.date}\nTotal: ${usd(r.total)}\nCategory: ${r.category}\n`); notify('Receipt downloaded') }
  const upload = (e) => {
    const file = e.target.files?.[0]; if (!file) return
    setReceipts((p) => [{ id: 'r' + Date.now(), merchant: file.name.replace(/\.[^.]+$/, ''), date: '2026-10-24', total: 0, category: 'Shopping', file: file.name, size: Math.max(1, Math.round(file.size / 1024)) + ' KB' }, ...p])
    notify('Receipt added to the vault'); e.target.value = ''
  }
  return (
    <>
      <PageHeader title="Reports & Receipt Vault" sub={`${receipts.length} scanned documents, stored for tax time.`}>
        <label className={cx(btnPrimary, 'cursor-pointer')}><Upload size={16} />Upload receipt<input type="file" accept="image/*,.pdf" className="sr-only" onChange={upload} /></label></PageHeader>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="relative sm:col-span-2"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" /><input aria-label="Search receipts" className={cx(inp, 'pl-9')} placeholder="Search merchant…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <select aria-label="Category" className={inp} value={cat} onChange={(e) => setCat(e.target.value)}><option value="All">All categories</option>{Object.keys(CATEGORIES).filter((c) => c !== 'Income').map((c) => <option key={c}>{c}</option>)}</select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((r) => { const Img = r.file.endsWith('.pdf') ? FileText : FileImage
          return (
            <Card key={r.id} hover className="overflow-hidden">
              <div className="grid h-36 place-items-center bg-onyx/50"><div className="w-24 rotate-[-2deg] rounded-sm bg-white p-2.5 text-[8px] leading-3 text-neutral-600 shadow-lg">
                <p className="text-center font-bold uppercase text-neutral-900">{r.merchant.slice(0, 14)}</p><div className="my-1 border-t border-dashed border-neutral-400" />
                <div className="h-1 w-full bg-neutral-200" /><div className="mt-1 h-1 w-3/4 bg-neutral-200" /><div className="mt-1 h-1 w-1/2 bg-neutral-200" /><p className="mt-2 text-right font-mono font-bold text-neutral-900">{usd(r.total)}</p></div></div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2"><div><p className="font-bold">{r.merchant}</p><p className="text-xs text-mute">{fmtDate(r.date)}</p></div><Money value={r.total} className="font-bold" /></div>
                <div className="mt-3 flex items-center justify-between"><Badge>{r.category}</Badge><span className="flex items-center gap-1 text-xs text-mute"><Img size={12} />{r.size}</span></div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button onClick={() => setView(r)} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-line py-2 text-xs font-semibold hover:bg-ink/10"><Eye size={14} />Preview</button>
                  <button onClick={() => download(r)} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-spark py-2 text-xs font-bold text-black hover:brightness-95"><Download size={14} />Download</button></div>
              </div>
            </Card>)
        })}
        {!list.length && <p className="col-span-full rounded-2xl border border-dashed border-line p-12 text-center text-sm text-mute">No receipts found. Upload one or clear your filters.</p>}
      </div>
      <Modal open={!!view} onClose={() => setView(null)} title={view?.merchant || ''} width="max-w-sm">
        {view && <dl className="space-y-3 text-sm">{[['File', view.file], ['Date', fmtDate(view.date)], ['Category', view.category], ['Size', view.size], ['Total', usd(view.total)]].map(([k, v]) => (
          <div key={k} className="flex justify-between border-b border-line pb-2"><dt className="text-mute">{k}</dt><dd className="num font-semibold">{v}</dd></div>))}</dl>}
      </Modal>
    </>
  )
}
