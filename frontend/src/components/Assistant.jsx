import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Send, Sparkles, X } from 'lucide-react'
import { useStore } from '../store.jsx'
import { useT } from '../i18n/index.js'
import { api } from '../services/api.js'
import { cx } from './ui.jsx'
import { WHATSAPP } from '../data/contact.js'

/** "Adji AI" floating assistant. Talks to POST /api/assistant. */
export default function Assistant() {
  const { lang } = useStore()
  const t = useT()
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState([]) // [{ role: 'user' | 'assistant', content }]
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const end = useRef(null)
  const input = useRef(null)

  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [msgs, busy, open])
  useEffect(() => { if (open) setTimeout(() => input.current?.focus(), 150) }, [open])
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [])

  const send = async (raw) => {
    const content = (raw ?? text).trim()
    if (!content || busy) return
    const next = [...msgs, { role: 'user', content }]
    setMsgs(next); setText(''); setBusy(true)
    try {
      const { reply } = await api('/assistant', { method: 'POST', body: { messages: next, lang } })
      setMsgs((m) => [...m, { role: 'assistant', content: reply }])
    } catch {
      setMsgs((m) => [...m, { role: 'assistant', content: t('ai.error') }])
    } finally { setBusy(false) }
  }

  const bubble = (role) => cx('max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed', role === 'user' ? 'ml-auto rounded-br-md bg-spark text-black' : 'rounded-bl-md bg-ink/10')

  return (
    <>
      {open && (
        <section role="dialog" aria-label={t('ai.title')} className="glass fixed bottom-24 right-5 z-50 flex h-[32rem] max-h-[calc(100vh-8rem)] w-[22rem] max-w-[calc(100vw-2.5rem)] animate-pop flex-col overflow-hidden rounded-3xl">
          <header className="flex items-center gap-3 border-b border-line bg-gradient-to-r from-spark/20 to-transparent p-4">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-spark text-black"><Sparkles size={20} /></span>
            <div className="min-w-0 flex-1">
              <p className="font-extrabold leading-tight">{t('ai.title')}</p>
              <p className="flex items-center gap-1.5 text-xs text-mute"><span className="h-1.5 w-1.5 rounded-full bg-emerald" />{t('ai.status')}</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label={t('ai.close')} className="rounded-lg p-1.5 text-mute hover:bg-ink/10 hover:text-ink"><X size={18} /></button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
            <div className={bubble('assistant')}>{t('ai.hello')}</div>
            {!msgs.length && (
              <div className="flex flex-wrap gap-2 pt-1">
                {t('ai.suggest').map((s) => <button key={s} onClick={() => send(s)} className="rounded-full border border-spark/40 px-3 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-spark/10">{s}</button>)}
              </div>
            )}
            {msgs.map((m, i) => <div key={i} className={bubble(m.role)}>{m.content}</div>)}
            {busy && (
              <div className={cx(bubble('assistant'), 'flex w-16 items-center justify-center gap-1')} aria-label="…">
                {[0, 150, 300].map((d) => <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-mute" style={{ animationDelay: d + 'ms' }} />)}
              </div>
            )}
            <div ref={end} />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); send() }} className="flex items-center gap-2 border-t border-line p-3">
            <input ref={input} value={text} onChange={(e) => setText(e.target.value)} maxLength={500} placeholder={t('ai.placeholder')} aria-label={t('ai.placeholder')}
              className="min-w-0 flex-1 rounded-xl border border-line bg-onyx/60 px-3 py-2.5 text-sm text-ink placeholder:text-mute focus:border-spark/60 focus:outline-none focus:ring-2 focus:ring-spark/30" />
            <button disabled={busy || !text.trim()} aria-label={t('ai.send')} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#B6FF2E] text-black transition-all hover:-translate-y-0.5 disabled:opacity-50"><Send size={17} /></button>
          </form>
          <a href={WHATSAPP} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 border-t border-line py-2 text-xs font-semibold text-mute hover:text-ink"><MessageCircle size={13} />{t('ai.human')}</a>
        </section>
      )}

      <button onClick={() => setOpen((o) => !o)} aria-label={open ? t('ai.close') : t('ai.open')} aria-expanded={open}
        className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[#B6FF2E] to-emerald text-black shadow-[0_0_30px_-4px_#B6FF2E] transition-transform hover:scale-105">
        {!open && <span className="absolute inset-0 animate-ping rounded-full bg-spark opacity-30" />}
        {open ? <X size={24} className="relative" /> : <Sparkles size={26} className="relative" />}
        {!open && <span className="absolute -right-1 -top-1 rounded-full bg-black px-1.5 py-0.5 text-[10px] font-extrabold text-spark ring-2 ring-spark">AI</span>}
      </button>
    </>
  )
}
