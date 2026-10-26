import { useStore } from '../store.jsx'
import { ENG } from './eng.js'
import { SW } from './sw.js'

const DICT = { ENG, SW }

/** translate('SW', 'palette.title', { brand: 'Adji Cash' }). Falls back to English, then to the key. */
export function translate(lang, key, vars) {
  let v = DICT[lang]?.[key] ?? ENG[key] ?? key
  if (vars && typeof v === 'string') for (const [k, x] of Object.entries(vars)) v = v.replaceAll(`{${k}}`, x)
  return v
}
export const useT = () => { const { lang } = useStore(); return (key, vars) => translate(lang, key, vars) }
