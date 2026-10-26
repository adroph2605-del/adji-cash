// Adji AI — Built-in smart assistant (no API key needed)
// Still supports Anthropic if ANTHROPIC_API_KEY is later added

import { config } from '../config.js'

const system = (lang) => `You are "Adji AI", the friendly assistant for Adji Cash, a financial intelligence and expense management app made by ADROPH TECH in Tanzania.
Help visitors understand the product and give practical budgeting tips.
Facts you may use: Plans are Starter (free: 2 linked accounts, manual transactions, basic budgets), Pro ($9/month, or $7/month billed yearly: unlimited accounts, zero-based budgets, receipt vault, forecasting) and Business ($15/month, or $12/month billed yearly: everything in Pro, multi-currency, team access, priority support). Paid plans have a 14-day free trial with no card needed. Features: zero-based budgeting, automatic expense categorisation, multi-currency and income streams, 90-day cash-flow forecast, receipt vault, bills and subscriptions tracking, reports. The interface works in Swahili and English. Contact: adroph2605@gmail.com, +255 774 082 430, WhatsApp https://wa.me/255774082430.
Rules: keep answers under 90 words, plain text only, no markdown. Reply in ${lang === 'SW' ? 'Kiswahili' : 'English'} unless the user writes in the other language. If you do not know something about the product, say so and suggest contacting the team. You are not a licensed financial advisor; for big investment or legal decisions suggest a professional. Never ask for passwords or card numbers.`

async function askClaude(messages, lang) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': config.ai.key,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: config.ai.model,
      max_tokens: 400,
      system: system(lang),
      messages,
    }),
    signal: AbortSignal.timeout(20_000),
  })
  if (!r.ok) throw new Error('AI request failed: ' + r.status)
  const j = await r.json()
  const text = (j.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim()
  if (!text) throw new Error('empty AI reply')
  return text
}

// ===================== IMPROVED KNOWLEDGE BASE =====================
const RULES = [
  // Greetings
  [
    /\b(hi|hello|hey|habari|mambo|hujambo|niaje|salaam|shikamoo|hodi)\b/,
    'Hi! I am Adji AI, your guide for Adji Cash. I can help you with pricing, how to start, budgeting tips, features, or anything about the app. What would you like to know?',
    'Habari! Mimi ni Adji AI, mwongoza wako wa Adji Cash. Naweza kukusaidia kuhusu bei, jinsi ya kuanza, tips za bajeti, features, au chochote kuhusu app. Ungependa kujua nini?',
  ],

  // Pricing & Plans
  [
    /(price|pricing|cost|bei|gharama|plan|plans|kifurushi|subscription|malipo)/,
    'We have 3 plans: Starter (Free forever), Pro ($9/month or $7 yearly), and Business ($15/month or $12 yearly). All paid plans have 14-day free trial — no card needed. Which plan are you interested in?',
    'Tuna mipango 3: Starter (Bure milele), Pro ($9/mwezi au $7 kwa mwaka), na Business ($15/mwezi au $12 kwa mwaka). Mipango yote ya kulipia ina majaribio bure ya siku 14 — hakuna kadi inayohitajika. Ungependa lipi?',
  ],
  [
    /(starter|free plan|mpango bure|bure)/,
    'Starter is completely free forever. You get 2 linked accounts, manual transactions, and basic budgets. Perfect if you are just starting to track your money.',
    'Starter ni bure kabisa milele. Unapata akaunti 2, kuingiza transactions wewe mwenyewe, na bajeti za msingi. Inafaa sana ukianza kufuatilia fedha zako.',
  ],
  [
    /(pro plan|pro\b)/,
    'Pro costs $9/month (or $7 if billed yearly). You get unlimited accounts, zero-based budgets, receipt vault, and 90-day cash-flow forecast. Includes 14-day free trial.',
    'Pro inagharimu $9/mwezi (au $7 ukilipa kwa mwaka). Unapata akaunti zisizo na kikomo, zero-based budgets, sehemu ya risiti, na utabiri wa fedha siku 90. Ina majaribio bure ya siku 14.',
  ],
  [
    /(business plan|business\b|biashara)/,
    'Business is $15/month (or $12 yearly). It includes everything in Pro plus multi-currency, team access, and priority support. Ideal for small businesses and teams.',
    'Business ni $15/mwezi (au $12 kwa mwaka). Inajumuisha kila kitu cha Pro pamoja na sarafu nyingi, ufikiaji wa timu, na msaada wa kipaumbele. Inafaa biashara ndogo na timu.',
  ],
  [
    /(trial|majaribio|jaribio)/,
    'Yes! Pro and Business both come with a 14-day free trial. No credit card required. Just sign up and start using all features.',
    'Ndiyo! Pro na Business zina majaribio bure ya siku 14. Hakuna kadi ya mkopo inayohitajika. Jisajili tu na uanze kutumia features zote.',
  ],

  // Features
  [
    /(feature|features|nini inaweza|inafanya nini|what can|capabilities)/,
    'Adji Cash helps you track expenses, create zero-based budgets, store receipts, track bills & subscriptions, see 90-day forecasts, and generate reports. Works fully in Swahili and English.',
    'Adji Cash inakusaidia kufuatilia matumizi, kutengeneza bajeti, kuhifadhi risiti, kufuatilia bili na usajili, kuona utabiri wa siku 90, na kupata reports. Inafanya kazi kikamilifu kwa Kiswahili na Kiingereza.',
  ],
  [
    /(budget|bajeti|zero.?based)/,
    'We use zero-based budgeting — every shilling gets a job. You assign your income to categories until nothing is left unassigned. It is the most effective way to control spending.',
    'Tunatumia zero-based budgeting — kila shilingi inapewa kazi. Unagawa mapato yako kwenye categories hadi hakuna kitu kibaki. Ni njia bora zaidi ya kudhibiti matumizi.',
  ],
  [
    /(receipt|risiti|vault)/,
    'The Receipt Vault lets you snap or upload receipts and keep them organized. Available on Pro and Business plans so you never lose important proof of payment.',
    'Receipt Vault inakuwezesha kupiga picha au kupakia risiti na kuziweka kwa mpangilio. Inapatikana kwenye Pro na Business ili usipoteze uthibitisho wa malipo.',
  ],
  [
    /(forecast|utabiri|predict|cash.?flow)/,
    'Smart forecasting shows your expected balance 90 days ahead, including upcoming bills. It helps you avoid surprises and plan better. Available on Pro and Business.',
    'Utabiri mahiri unaonyesha salio lako linalotarajiwa siku 90 mbele, ikiwemo bili zijazo. Inakusaidia kuepuka mshangao na kupanga vizuri. Inapatikana kwenye Pro na Business.',
  ],
  [
    /(bill|bili|subscription|usajili|recurring)/,
    'Bills & Subscriptions tracks all your recurring payments (Netflix, rent, internet, etc.) so you can see what is coming and cancel what you no longer need.',
    'Sehemu ya Bili na Usajili inafuatilia malipo yako ya kujirudia (Netflix, kodi, internet n.k.) ili uone yanayokuja na kusitisha yale usiyohitaji tena.',
  ],
  [
    /(report|reports|analytics|ripoti)/,
    'You get clear reports showing where your money goes by category, income vs expenses, and trends over time. Perfect for understanding your spending habits.',
    'Unapata ripoti wazi zinazoonyesha fedha zinakokwenda kwa category, mapato dhidi ya matumizi, na mwenendo wa muda. Inafaa kuelewa tabia zako za matumizi.',
  ],
  [
    /(multi.?currency|sarafu|currency|fedha nyingi)/,
    'Business plan supports multiple currencies. Useful if you earn or spend in TZS, USD, EUR or other currencies.',
    'Mpango wa Business unasaidia sarafu nyingi. Inafaa ukipata au kutumia fedha kwa TZS, USD, EUR au sarafu nyingine.',
  ],

  // How to start
  [
    /(sign.?up|register|jisajili|anza|start|get started|how to|jinsi ya|nitaanzaje)/,
    'Very easy: Click “Start Free Trial” or “Sign Up”, create your account in under a minute, then add your first transaction or set a budget. I can guide you step by step if you want.',
    'Rahisi sana: Bonyeza “Anza Majaribio Bure” au “Jisajili”, fungua akaunti chini ya dakika moja, kisha ongeza muamala wa kwanza au tengeneza bajeti. Naweza kukuongoza hatua kwa hatua ukitaka.',
  ],
  [
    /(how does it work|inafanyaje kazi|jinsi inavyofanya)/,
    '1. Create free account 2. Add your income and expenses 3. Set budgets for categories 4. Track bills 5. View reports and forecasts. Everything is simple and works in Swahili.',
    '1. Fungua akaunti bure 2. Ongeza mapato na matumizi 3. Weka bajeti kwa categories 4. Fuatilia bili 5. Angalia ripoti na utabiri. Kila kitu ni rahisi na kinafanya kazi kwa Kiswahili.',
  ],

  // Security
  [
    /(secure|security|salama|usalama|data|privacy|faragha)/,
    'Your data is protected. Passwords are hashed, sessions use signed tokens, and communication is encrypted. We never sell your data. Your financial information stays private.',
    'Data yako inalindwa. Password zinawekwa kwa njia salama (hash), vikao vinatumia tokeni, na mawasiliano yamesimbwa. Hatuuzi data yako. Taarifa zako za fedha zinabaki faragha.',
  ],

  // Language
  [
    /(swahili|kiswahili|language|lugha|english|kiingereza)/,
    'The whole app works fully in both Swahili and English. Use the SW / ENG switch at the top of the page anytime.',
    'App nzima inafanya kazi kikamilifu kwa Kiswahili na Kiingereza. Tumia kitufe cha SW / ENG juu ya ukurasa wakati wowote.',
  ],

  // Contact & Support
  [
    /(contact|support|help|msaada|wasiliana|simu|email|whatsapp|call)/,
    'You can reach the team at: Email adroph2605@gmail.com, Phone +255 774 082 430, or WhatsApp. We usually reply fast.',
    'Unaweza kuwasiliana na timu: Email adroph2605@gmail.com, Simu +255 774 082 430, au WhatsApp. Tunajibu haraka.',
  ],

  // Who made it
  [
    /(who made|nani alitengeneza|adroph|developer|mtengenezaji|company)/,
    'Adji Cash is built by ADROPH TECH, a Tanzanian tech team. We focus on practical financial tools that work well for people in East Africa.',
    'Adji Cash imetengenezwa na ADROPH TECH, timu ya teknolojia kutoka Tanzania. Tunazingatia zana za fedha zinazofaa watu wa Afrika Mashariki.',
  ],

  // Tips
  [
    /(tip|tips|shauri|ushauri|advice|how to save|kuokoa)/,
    'Quick tip: Start by tracking every expense for 7 days. Then create a simple budget. Most people are surprised where their money actually goes. Consistency beats perfection.',
    'Shauri: Anza kufuatilia kila matumizi kwa siku 7. Kisha tengeneza bajeti rahisi. Watu wengi wanashangaa fedha zao zinakokwenda. Uthabiti ni bora kuliko ukamilifu.',
  ],
]

// Fallback when nothing matches
const FALLBACK = [
  'I am not sure about that specific question. I can help you with: pricing & plans, how to get started, features (budgets, receipts, forecasts), security, or contact info. What would you like to know?',
  'Sina uhakika kuhusu swali hilo hasa. Naweza kukusaidia kuhusu: bei na mipango, jinsi ya kuanza, features (bajeti, risiti, utabiri), usalama, au mawasiliano. Ungependa kujua nini?',
]

export function localAnswer(text, lang) {
  const q = text.toLowerCase().trim()
  const hit = RULES.find(([re]) => re.test(q))
  return hit ? hit[lang === 'SW' ? 2 : 1] : FALLBACK[lang === 'SW' ? 1 : 0]
}

export async function answer(messages, lang) {
  // If Anthropic key exists later, it will be used automatically
  if (config.ai.key) {
    try {
      return await askClaude(messages, lang)
    } catch (e) {
      console.error('[assistant]', e.message)
    }
  }
  // Otherwise use the improved built-in knowledge base
  return localAnswer(messages.at(-1).content, lang)
}