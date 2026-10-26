export const CATEGORIES = {
  Housing: '#B6FF2E', Groceries: '#10B981', Dining: '#F59E0B', Transport: '#38BDF8',
  Utilities: '#A78BFA', Subscriptions: '#F472B6', Shopping: '#EF4444', Health: '#2DD4BF',
  Entertainment: '#FB923C', Income: '#B6FF2E', 'Savings goals': '#64748B',
}
export const ACCOUNT_NAMES = ['Checking', 'Credit Card', 'Savings']

const rows = [
  ['t1', '2026-10-24', 'Whole Foods Market', 'Weekly groceries', 'Groceries', 'Credit Card', -128.46, 'Organic produce and pantry restock.', 'Food', true],
  ['t2', '2026-10-23', 'Uber', 'Airport ride', 'Transport', 'Credit Card', -42.8, '', 'Rides', true],
  ['t3', '2026-10-22', 'Netflix', 'Premium plan', 'Subscriptions', 'Credit Card', -22.99, 'Annual review due in January.', 'Streaming', false],
  ['t4', '2026-10-21', 'Northwind Studio', 'Freelance invoice #1042', 'Income', 'Checking', 2400, 'Brand identity project, milestone 2.', 'Client', true],
  ['t5', '2026-10-20', 'Blue Bottle Coffee', 'Coffee with Amara', 'Dining', 'Credit Card', -14.5, '', 'Coffee', false],
  ['t6', '2026-10-19', 'Amazon', 'Desk lamp and cables', 'Shopping', 'Credit Card', -87.3, 'Home office upgrade.', 'Online', true],
  ['t7', '2026-10-18', 'Con Edison', 'Electricity bill', 'Utilities', 'Checking', -96.2, '', 'Utility', true],
  ['t8', '2026-10-17', 'Spotify', 'Family plan', 'Subscriptions', 'Credit Card', -16.99, '', 'Music', false],
  ['t9', '2026-10-16', 'Trader Joe\u2019s', 'Groceries', 'Groceries', 'Checking', -74.12, '', 'Food', false],
  ['t10', '2026-10-15', 'Acme Corp Payroll', 'Salary \u2014 October', 'Income', 'Checking', 6400, 'Net pay after tax.', 'Salary', true],
  ['t11', '2026-10-14', 'Nobu', 'Team dinner', 'Dining', 'Credit Card', -184.0, 'Check with finance if this can be expensed.', 'Business', true],
  ['t12', '2026-10-13', 'Planet Fitness', 'Monthly membership', 'Health', 'Checking', -24.99, '', 'Gym', false],
  ['t13', '2026-10-12', 'Shell', 'Fuel', 'Transport', 'Credit Card', -58.4, '', 'Fuel', false],
  ['t14', '2026-10-11', 'AWS', 'Cloud hosting', 'Subscriptions', 'Credit Card', -64.18, 'Side-project infrastructure.', 'Cloud', true],
  ['t15', '2026-10-10', 'CVS Pharmacy', 'Prescription refill', 'Health', 'Credit Card', -32.75, '', 'Pharmacy', true],
  ['t16', '2026-10-09', 'Apple Store', 'Phone case + charger', 'Shopping', 'Credit Card', -219.0, '', 'Electronics', true],
  ['t17', '2026-10-08', 'AMC Theatres', 'Movie night', 'Entertainment', 'Credit Card', -46.0, '', 'Cinema', false],
  ['t18', '2026-10-07', 'Savings transfer', 'Monthly auto-save', 'Savings goals', 'Savings', 800, 'Automated rule.', 'Transfer', false],
  ['t19', '2026-10-06', 'Sweetgreen', 'Lunch', 'Dining', 'Credit Card', -18.9, '', 'Lunch', false],
  ['t20', '2026-10-05', 'Verizon', 'Mobile + broadband', 'Utilities', 'Checking', -113.8, '', 'Telecom', true],
  ['t21', '2026-10-04', 'MTA', 'Monthly MetroCard', 'Transport', 'Checking', -132.0, '', 'Transit', false],
  ['t22', '2026-10-03', 'Zara', 'Autumn jacket', 'Shopping', 'Credit Card', -149.0, '', 'Clothing', true],
  ['t23', '2026-10-02', 'Dividend payout', 'VTI quarterly dividend', 'Income', 'Savings', 96.4, '', 'Investing', false],
  ['t24', '2026-10-01', 'Landlord \u2014 Park Ave', 'October rent', 'Housing', 'Checking', -1650, 'Auto-pay on the 1st.', 'Rent', true],
]
export const initialTransactions = rows.map(([id, date, merchant, description, category, account, amount, notes, tag, receipt]) => ({
  id, date, merchant, description, category, account, amount, notes, tag, receipt,
}))

// Targets sum to $6,913 so $4,286.50 spent = 62% of the overall budget.
export const initialBudgets = [
  { category: 'Housing', target: 1700, spent: 1650 },
  { category: 'Groceries', target: 900, spent: 612.5 },
  { category: 'Dining', target: 400, spent: 348 },
  { category: 'Transport', target: 600, spent: 285 },
  { category: 'Utilities', target: 300, spent: 210 },
  { category: 'Subscriptions', target: 100, spent: 126 },
  { category: 'Shopping', target: 500, spent: 540 },
  { category: 'Health', target: 500, spent: 215 },
  { category: 'Entertainment', target: 600, spent: 300 },
  { category: 'Savings goals', target: 1313, spent: 0 },
]

export const monthly = [
  ['Nov', 8200, 4010], ['Dec', 8650, 5120], ['Jan', 8400, 4320], ['Feb', 8400, 3980], ['Mar', 8900, 4410], ['Apr', 8600, 4150],
  ['May', 9100, 4620], ['Jun', 8700, 4290], ['Jul', 8800, 4510], ['Aug', 8800, 4070], ['Sep', 8800, 4390], ['Oct', 8800, 4286.5],
].map(([m, income, expense]) => ({ m, income, expense, net: +(income - expense).toFixed(2) }))

// Deterministic daily spend for the heatmap (Oct 2026; data runs to the 24th).
export const dailySpend = Array.from({ length: 31 }, (_, i) => {
  const d = i + 1
  if (d === 1) return 1650
  if (d > 24) return 0
  const seed = Math.abs(Math.sin(d * 12.9898) * 43758.5453) % 1
  return Math.round(seed * seed * 190 + (d % 7 === 6 ? 60 : 8))
})

export const assets = [
  { id: 'a1', name: 'Bank Checking', inst: 'Chase \u2022\u2022 4417', value: 12480.5, change: 1.8, icon: 'Landmark' },
  { id: 'a2', name: 'High-Yield Savings', inst: 'Marcus \u2022\u2022 9081', value: 36200, change: 0.4, icon: 'PiggyBank' },
  { id: 'a3', name: 'Investments', inst: 'Vanguard Brokerage', value: 48600, change: 3.2, icon: 'TrendingUp' },
  { id: 'a4', name: 'Crypto', inst: 'Coinbase', value: 6320.5, change: -4.6, icon: 'Bitcoin' },
  { id: 'a5', name: 'Real Estate Equity', inst: 'Condo \u2014 estimated equity', value: 52000, change: 0.9, icon: 'Building2' },
]
export const liabilities = [
  { id: 'l1', name: 'Credit Card', inst: 'Amex \u2022\u2022 1009', value: 2151, rate: '21.9% APR' },
  { id: 'l2', name: 'Auto Loan', inst: 'Toyota Financial', value: 15000, rate: '4.9% APR' },
]

export const initialBills = [
  { id: 'b1', name: 'Rent', category: 'Housing', amount: 1650, due: '2026-11-01', status: 'Upcoming', cycle: 'Monthly' },
  { id: 'b2', name: 'Netflix', category: 'Subscriptions', amount: 22.99, due: '2026-10-28', status: 'Upcoming', cycle: 'Monthly' },
  { id: 'b3', name: 'Spotify', category: 'Subscriptions', amount: 16.99, due: '2026-10-17', status: 'Paid', cycle: 'Monthly' },
  { id: 'b4', name: 'AWS', category: 'Subscriptions', amount: 64.18, due: '2026-10-22', status: 'Overdue', cycle: 'Monthly' },
  { id: 'b5', name: 'Health Insurance', category: 'Health', amount: 312.4, due: '2026-10-30', status: 'Upcoming', cycle: 'Monthly' },
  { id: 'b6', name: 'Car Insurance', category: 'Transport', amount: 148.0, due: '2026-10-10', status: 'Paid', cycle: 'Quarterly' },
]

export const initialReceipts = [
  { id: 'r1', merchant: 'Whole Foods Market', date: '2026-10-24', total: 128.46, category: 'Groceries', file: 'wfm-1024.pdf', size: '184 KB' },
  { id: 'r2', merchant: 'Apple Store', date: '2026-10-09', total: 219.0, category: 'Shopping', file: 'apple-1009.pdf', size: '212 KB' },
  { id: 'r3', merchant: 'Nobu', date: '2026-10-14', total: 184.0, category: 'Dining', file: 'nobu-1014.jpg', size: '1.2 MB' },
  { id: 'r4', merchant: 'AWS Invoice', date: '2026-10-11', total: 64.18, category: 'Subscriptions', file: 'aws-inv-3321.pdf', size: '96 KB' },
  { id: 'r5', merchant: 'Con Edison', date: '2026-10-18', total: 96.2, category: 'Utilities', file: 'coned-1018.pdf', size: '140 KB' },
  { id: 'r6', merchant: 'Zara', date: '2026-10-03', total: 149.0, category: 'Shopping', file: 'zara-1003.jpg', size: '880 KB' },
]

export const initialNotifications = [
  { id: 'n1', title: 'AWS payment is overdue', body: '$64.18 was due on Oct 22.', unread: true },
  { id: 'n2', title: 'Subscriptions budget exceeded', body: 'You are $26.00 over your $100 target.', unread: true },
  { id: 'n3', title: 'Dining is at 87% of budget', body: '$52.00 left for the rest of October.', unread: true },
  { id: 'n4', title: 'Salary received', body: '$6,400.00 from Acme Corp Payroll.', unread: false },
]
