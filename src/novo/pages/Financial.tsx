import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  addTransaction as dbAddTransaction,
  deleteTransaction as dbDeleteTransaction,
  getFinancialData,
  saveBudget as dbSaveBudget,
  deleteBudget as dbDeleteBudget,
  addRecurring as dbAddRecurring,
  deleteRecurring as dbDeleteRecurring,
  setRecurringMonthPaid as dbSetRecurringPaid,
  addXP, todayStr,
} from '../lib/storage'
import { awardXP, getStreak, getBadges, getWeekMissions, applyHappinessDecay, type StreakRow, type MissionRow } from '../lib/gamification'
import { useCelebrations } from '../components/CelebrationLayer'
import { StreakBadge } from '../components/StreakBadge'
import { PetRoom } from '../components/PetRoom'
import { DailyChallenges } from '../components/DailyChallenges'
import { useAuth } from '../contexts/AuthContext'
import { FINANCIAL_STAGES, getStageFromXP } from '../data/creatures'
import { INK, MUTED, Panel, NButton, NProgress, StableLabel } from '../components/ui'
import Character from '../components/Character'
import MoneyRain from '../games/MoneyRain'
import BudgetDodge from '../games/BudgetDodge'
import MoneyMatch from '../games/MoneyMatch'
import type { CharacterState, FinancialData } from '../types'
import { FIN_T, CATEGORY_WORD, MONTH_SHORT, type Lang, type FinancialDict } from './Financial.i18n'

const INCOME_CATS = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other']
const EXPENSE_CATS = ['Food', 'Transport', 'Shopping', 'Health', 'Bills', 'Entertainment', 'Other']
const BAR_MAX_H = 112
const LANG_KEY = 'novo-lang'

type GameTab = 'clicker' | 'arcade' | 'puzzle'
type MainTab = 'overview' | 'log' | 'budgets' | 'analytics' | 'pet' | 'games'
const MAIN_TAB_KEYS: MainTab[] = ['overview', 'log', 'budgets', 'analytics', 'pet', 'games']

const ACCENT = '#B45309'
const INCOME_COLOR = '#16A34A'
const EXPENSE_COLOR = '#DC2626'
const WARN_COLOR = '#D97706'

function formatRp(n: number) { return 'Rp ' + n.toLocaleString('id-ID') }
function shortRp(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`
  return String(n)
}
function currentMonth() { return todayStr().slice(0, 7) }

const introKey = (userId: string) => `novo-intro-financial-seen-${userId}`

function TourCoachmark({ step, steps, targetEl, tr, onNext, onSkip }: {
  step: number
  steps: { tab: MainTab; text: string }[]
  targetEl: HTMLButtonElement | null
  tr: FinancialDict
  onNext: () => void
  onSkip: () => void
}) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)

  useEffect(() => {
    const place = () => {
      if (!targetEl) return
      const r = targetEl.getBoundingClientRect()
      setPos({ top: r.bottom + 10, left: r.left + r.width / 2 })
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [targetEl, step])

  if (!pos) return null
  const last = step === steps.length - 1

  return (
    <div
      className="fixed bounce-in"
      style={{ top: pos.top, left: pos.left, transform: 'translateX(-50%)', zIndex: 9990, width: 260 }}
    >
      <Panel tone="fill" accent={ACCENT} className="p-4">
        <div className="font-nunito text-xs text-white/70 mb-1.5">{step + 1} / {steps.length}</div>
        <div className="font-nunito text-sm text-white leading-relaxed mb-3">{steps[step].text}</div>
        <div className="flex items-center justify-between">
          <button onClick={onSkip} className="font-nunito text-xs text-white/60 hover:text-white/90 transition-colors">
            {tr.tourSkip}
          </button>
          <NButton onClick={onNext} style={{ background: '#FFFFFF', color: ACCENT }} size="sm">
            {last ? tr.tourDone : tr.tourNext}
          </NButton>
        </div>
      </Panel>
    </div>
  )
}

export default function Financial() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const userId = session?.user.id ?? ''

  const [data, setData] = useState<FinancialData | null>(null)
  const [mainTab, setMainTab] = useState<MainTab>('overview')
  const [gameTab, setGameTab] = useState<GameTab>('clicker')
  const [form, setForm] = useState({ type: 'income' as 'income' | 'expense', amount: '', category: INCOME_CATS[0], description: '' })
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [budgetInputs, setBudgetInputs] = useState<Record<string, string>>({})
  const [recurForm, setRecurForm] = useState({ name: '', amount: '', type: 'expense' as 'income' | 'expense', category: EXPENSE_CATS[0], dueDay: '' })
  const [recurAlreadyPaid, setRecurAlreadyPaid] = useState(false)
  const [toast, setToast] = useState<{ msg: string; good: boolean } | null>(null)
  const [streak, setStreak] = useState<StreakRow | null>(null)
  const [earnedBadges, setEarnedBadges] = useState<Set<string>>(new Set())
  const [missions, setMissions] = useState<MissionRow[]>([])
  const [tourStep, setTourStep] = useState<number | null>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem(LANG_KEY) as Lang | null) ?? 'en')
  const { celebrate, layer } = useCelebrations()

  const tr = FIN_T[lang]
  const changeLang = (l: Lang) => { localStorage.setItem(LANG_KEY, l); setLang(l) }
  const categoryLabel = (cat: string) => CATEGORY_WORD[lang][cat] ?? cat
  const MONTH_LABELS = MONTH_SHORT[lang]

  const tabLabelKey = (key: MainTab): keyof FinancialDict => ({
    overview: 'tabOverview', log: 'tabLog', budgets: 'tabBudgets', analytics: 'tabAnalytics', pet: 'tabPet', games: 'tabGames',
  } as const)[key]
  const MAIN_TABS = MAIN_TAB_KEYS.map(key => ({ key, label: tr[tabLabelKey(key)] as string, enLabel: FIN_T.en[tabLabelKey(key)] as string, idLabel: FIN_T.id[tabLabelKey(key)] as string }))

  const TOUR_STEPS: { tab: MainTab; text: string }[] = [
    { tab: 'overview', text: tr.tourOverview },
    { tab: 'log', text: tr.tourLog },
    { tab: 'budgets', text: tr.tourBudgets },
    { tab: 'analytics', text: tr.tourAnalytics },
    { tab: 'pet', text: tr.tourPet },
    { tab: 'games', text: tr.tourGames },
  ]

  useEffect(() => {
    if (!userId) return
    getStreak(userId, 'financial').then(setStreak)
    getBadges(userId, 'financial').then(rows => setEarnedBadges(new Set(rows.map(b => b.badgeId))))
    getWeekMissions(userId).then(setMissions)
    getFinancialData(userId).then(setData)
    if (!localStorage.getItem(introKey(userId))) setTourStep(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  useEffect(() => {
    if (tourStep === null) return
    setMainTab(TOUR_STEPS[tourStep].tab)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourStep])

  const endTour = () => {
    localStorage.setItem(introKey(userId), '1')
    setTourStep(null)
  }

  const advanceTour = () => {
    if (tourStep === null) return
    if (tourStep >= TOUR_STEPS.length - 1) endTour()
    else setTourStep(tourStep + 1)
  }

  const handleTabClick = (key: MainTab) => {
    setMainTab(key)
    if (tourStep !== null) endTour()
  }

  // Idle-day happiness decay, guarded to once per tracker per day
  useEffect(() => {
    if (!userId || !data) return
    applyHappinessDecay(userId, 'financial', data.character).then(c => {
      if (c.happiness !== data.character.happiness) setData(d => d ? { ...d, character: c } : d)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, data === null])

  const showToast = (msg: string, good = true) => {
    setToast({ msg, good })
    setTimeout(() => setToast(null), 2500)
  }

  const runAward = (before: CharacterState, gain: number, kind: 'log' | 'game' = 'log') => {
    void awardXP(userId, 'financial', before, gain, kind).then(r => {
      setData(d => d ? { ...d, character: r.character } : d)
      setStreak(r.streak)
      const freshBadges = r.celebrations.flatMap(c => c.type === 'badge' ? [c.badgeId] : [])
      if (freshBadges.length) setEarnedBadges(s => new Set([...s, ...freshBadges]))
      celebrate(r.celebrations)
    })
  }

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: '#F5F4F2' }}>
        <div className="font-nunito text-sm" style={{ color: MUTED }}>{tr.loading}</div>
      </div>
    )
  }

  // ── Core stats (all time — used in Analytics, which is explicitly historical) ──
  const totalIncome  = data.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = data.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const net = totalIncome - totalExpense
  const savingsRate = totalIncome > 0 ? Math.round((net / totalIncome) * 100) : 0
  const healthScore = Math.min(100, Math.max(0, savingsRate * 1.5 + (net > 0 ? 20 : -20) + 30))
  const uniqueDays = new Set(data.transactions.map(t => t.date)).size || 1
  const dailyAvgExpense = Math.round(totalExpense / uniqueDays)

  // ── This month's stats — what Overview and Cashflow health actually show ──
  const monthTx = data.transactions.filter(t => t.date.startsWith(currentMonth()))
  const monthIncome = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const monthExpense = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const monthNet = monthIncome - monthExpense
  const monthSavingsRate = monthIncome > 0 ? Math.round((monthNet / monthIncome) * 100) : 0
  const monthHealthScore = Math.min(100, Math.max(0, monthSavingsRate * 1.5 + (monthNet > 0 ? 20 : -20) + 30))
  const monthUniqueDays = new Set(monthTx.map(t => t.date)).size || 1
  const monthDailyAvgExpense = Math.round(monthExpense / monthUniqueDays)

  const petStage = getStageFromXP(FINANCIAL_STAGES, data.character.xp)

  // ── Analytics: monthly data (last 6 months) ───────────────
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    return { key: d.toISOString().slice(0, 7), label: MONTH_LABELS[d.getMonth()] }
  })
  const monthlyData = last6Months.map(({ key, label }) => {
    const txs = data.transactions.filter(t => t.date.startsWith(key))
    return {
      label,
      income:  txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expense: txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    }
  })
  const maxMonthly = Math.max(...monthlyData.flatMap(m => [m.income, m.expense]), 1)

  // ── Analytics: category breakdowns ───────────────────────
  const byCategory = (type: 'income' | 'expense') =>
    Object.entries(
      data.transactions.filter(t => t.type === type).reduce<Record<string, number>>((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      }, {})
    ).sort((a, b) => b[1] - a[1])

  const topExpenses = byCategory('expense').slice(0, 5)
  const incomeSources = byCategory('income')

  // ── Analytics: net worth trend (cumulative running balance) ──
  const sortedTx = [...data.transactions].sort((a, b) => a.date.localeCompare(b.date))
  let running = 0
  const netWorthSeries = sortedTx.map(t => {
    running += t.type === 'income' ? t.amount : -t.amount
    return running
  })
  const nwMin = Math.min(...netWorthSeries, 0)
  const nwMax = Math.max(...netWorthSeries, 0)
  const netWorthPoints = netWorthSeries.map((v, i) => {
    const x = netWorthSeries.length > 1 ? (i / (netWorthSeries.length - 1)) * 100 : 50
    const y = nwMax > nwMin ? 90 - ((v - nwMin) / (nwMax - nwMin)) * 80 : 50
    return `${x},${y}`
  }).join(' ')
  const netWorthColor = (netWorthSeries[netWorthSeries.length - 1] ?? 0) >= 0 ? INCOME_COLOR : EXPENSE_COLOR

  // ── Budgets: this month's spend per category ──────────────
  const monthExpenses = data.transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMonth()))
  const spentInCategory = (cat: string) => monthExpenses.filter(t => t.category === cat).reduce((s, t) => s + t.amount, 0)
  const budgetFor = (cat: string) => data.budgets.find(b => b.category === cat)
  const budgetAlerts = EXPENSE_CATS
    .map(cat => ({ cat, budget: budgetFor(cat), spent: spentInCategory(cat) }))
    .filter(b => b.budget && b.spent / b.budget!.monthlyLimit >= 0.8)
    .map(b => ({ ...b, pct: Math.round((b.spent / b.budget!.monthlyLimit) * 100) }))

  // ── Recurring bills ────────────────────────────────────────
  const isRecurPaid = (r: FinancialData['recurring'][number]) => r.payments.some(p => p.month === currentMonth())
  const isRecurOverdue = (r: FinancialData['recurring'][number]) => !isRecurPaid(r) && new Date().getDate() > r.dueDay
  const activeRecurring = data.recurring.filter(r => r.active)
  const nextBill = activeRecurring
    .filter(r => !isRecurPaid(r))
    .sort((a, b) => a.dueDay - b.dueDay)[0]

  const applyXP = (xpGain: number, patch: Partial<FinancialData>, kind: 'log' | 'game' = 'log') => {
    const before = data.character
    setData(d => d ? { ...d, ...patch, character: addXP(before, xpGain) } : d)
    runAward(before, xpGain, kind)
  }

  // ── Actions ───────────────────────────────────────────────
  const handleAddTransaction = async () => {
    if (!form.amount || isNaN(Number(form.amount))) return
    const amt = Math.abs(Number(form.amount))
    const newIncome = form.type === 'income' ? totalIncome + amt : totalIncome
    const newNet    = newIncome - (form.type === 'expense' ? totalExpense + amt : totalExpense)
    const newRate   = newIncome > 0 ? (newNet / newIncome) * 100 : 0

    let xpGain: number
    let xpNote: string | null = null
    if (form.type === 'income') {
      xpGain = newRate > 30 ? 25 : newRate > 20 ? 20 : newRate > 10 ? 12 : 8
    } else if (newIncome === 0) {
      // No income on record yet to compare against — logging an expense first is
      // completely normal, so this isn't judged against a savings rate that doesn't exist.
      xpGain = 5
      xpNote = tr.xpNoteLogIncome
    } else if (newRate >= 20) {
      xpGain = 2
    } else if (newRate >= 0) {
      xpGain = -5
    } else if (newRate >= -20) {
      xpGain = -10
    } else {
      xpGain = -20
    }

    try {
      const tx = await dbAddTransaction(userId, {
        type: form.type,
        amount: amt,
        category: form.category,
        description: form.description || form.category,
        date: todayStr(),
      })
      applyXP(xpGain, { transactions: [tx, ...data.transactions] })
      setForm(f => ({ ...f, amount: '', description: '' }))
      if (xpNote) showToast(tr.xpWithNote(xpGain, xpNote), true)
      else if (xpGain > 0) showToast(tr.normalXp(xpGain), true)
      else showToast(`${xpGain} XP. ${tr.watchCashflow}`, false)
    } catch {
      showToast(tr.failedToSaveTransaction, false)
    }
  }

  const handleDeleteTransaction = async (id: string) => {
    setData(d => d ? { ...d, transactions: d.transactions.filter(t => t.id !== id) } : d)
    await dbDeleteTransaction(id)
  }

  const handleXPEarned = (xp: number) => {
    const before = data.character
    setData(d => d ? { ...d, character: addXP(before, xp) } : d)
    runAward(before, xp, 'game')
  }

  const handleClaimChallenge = (xp: number, title: string) => {
    const before = data.character
    setData(d => d ? { ...d, character: addXP(before, xp) } : d)
    runAward(before, xp)
    showToast(tr.challengeClaimed(title, xp))
  }

  // ── Budget actions ───────────────────────────────────────
  const handleBudgetBlur = async (cat: string) => {
    const raw = budgetInputs[cat]
    if (raw === undefined) return
    const val = Math.abs(Number(raw))
    if (!raw || isNaN(val) || val === 0) {
      if (budgetFor(cat)) {
        setData(d => d ? { ...d, budgets: d.budgets.filter(b => b.category !== cat) } : d)
        await dbDeleteBudget(userId, cat)
      }
      return
    }
    setData(d => d ? { ...d, budgets: [...d.budgets.filter(b => b.category !== cat), { category: cat, monthlyLimit: val }] } : d)
    await dbSaveBudget(userId, cat, val)
  }

  // ── Recurring actions ────────────────────────────────────
  const handleAddRecurring = async () => {
    if (!recurForm.name || !recurForm.amount || !recurForm.dueDay) return
    try {
      const item = await dbAddRecurring(userId, {
        name: recurForm.name,
        amount: Math.abs(Number(recurForm.amount)),
        type: recurForm.type,
        category: recurForm.category,
        dueDay: Math.min(31, Math.max(1, Number(recurForm.dueDay))),
      })
      let finalItem = item
      if (recurAlreadyPaid) {
        const month = currentMonth()
        await dbSetRecurringPaid(item.id, userId, month, true, todayStr())
        finalItem = { ...item, payments: [{ month, paidAt: todayStr() }] }
      }
      setData(d => d ? { ...d, recurring: [...d.recurring, finalItem] } : d)
      setRecurForm({ name: '', amount: '', type: 'expense', category: EXPENSE_CATS[0], dueDay: '' })
      setRecurAlreadyPaid(false)
      showToast(tr.recurringAdded)
    } catch {
      showToast(tr.failedToAddRecurring, false)
    }
  }

  const handleDeleteRecurring = async (id: string) => {
    setData(d => d ? { ...d, recurring: d.recurring.filter(r => r.id !== id) } : d)
    await dbDeleteRecurring(id)
  }

  const handleMarkRecurringPaid = async (r: FinancialData['recurring'][number]) => {
    const month = currentMonth()
    const daysLate = new Date().getDate() - r.dueDay
    const xpGain = daysLate <= 0 ? 25 : daysLate > 7 ? -5 : 10
    try {
      await dbSetRecurringPaid(r.id, userId, month, true, todayStr())
      const tx = await dbAddTransaction(userId, {
        type: r.type,
        amount: r.amount,
        category: r.category,
        description: r.name,
        date: todayStr(),
      })
      const nextRecurring = data.recurring.map(x => x.id === r.id ? { ...x, payments: [{ month, paidAt: todayStr() }, ...x.payments] } : x)
      applyXP(xpGain, { recurring: nextRecurring, transactions: [tx, ...data.transactions] })
      showToast(daysLate <= 0 ? tr.paidOnTime(xpGain) : daysLate > 7 ? tr.paidLate(xpGain) : tr.paidNormal(xpGain), xpGain > 0)
    } catch {
      showToast(tr.failedToMarkPaid, false)
    }
  }

  const cats     = form.type === 'income' ? INCOME_CATS : EXPENSE_CATS
  const filtered = data.transactions.filter(t => filter === 'all' || t.type === filter)
  const recent3  = data.transactions.slice(0, 3)

  const healthColor = healthScore >= 70 ? INCOME_COLOR : healthScore >= 40 ? ACCENT : EXPENSE_COLOR
  const monthHealthLabel = monthHealthScore >= 70 ? tr.healthHealthy : monthHealthScore >= 40 ? tr.healthFair : tr.healthAtRisk
  const monthHealthColor = monthHealthScore >= 70 ? INCOME_COLOR : monthHealthScore >= 40 ? ACCENT : EXPENSE_COLOR

  const txToday = data.transactions.filter(t => t.date === todayStr())
  const dailyChallenges = [
    { id: 'log2', title: tr.challengeLog2, emoji: '🧾', xp: 15, met: txToday.length >= 2 },
    { id: 'income', title: tr.challengeLogIncome, emoji: '💵', xp: 20, met: txToday.some(t => t.type === 'income') },
    { id: 'log5', title: tr.challengeLog5, emoji: '📚', xp: 30, met: txToday.length >= 5 },
  ]

  return (
    <div className="h-full flex flex-col" style={{ background: '#F5F4F2' }}>
      {layer}
      {tourStep !== null && (
        <TourCoachmark step={tourStep} steps={TOUR_STEPS} targetEl={tabRefs.current[tourStep] ?? null} tr={tr} onNext={advanceTour} onSkip={endTour} />
      )}

      {toast && (
        <div
          className="fixed top-[72px] right-4 z-50 px-4 py-2.5 rounded-2xl font-nunito font-semibold text-white text-sm bounce-in"
          style={{ background: toast.good ? '#16A34A' : '#DC2626' }}
        >
          {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <header
        className="flex items-center justify-between px-4 md:px-6 py-3 sticky top-0 z-30 flex-shrink-0"
        style={{ background: 'rgba(245,244,242,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E5E4E2' }}
      >
        <button onClick={() => navigate('/studios/dashboard')} className="font-nunito text-sm transition-opacity hover:opacity-70 flex-shrink-0" style={{ color: MUTED }}>
          {tr.back}
        </button>
        <div className="font-nunito font-semibold text-sm flex items-center gap-2 flex-shrink-0" style={{ color: INK }}>
          {tr.headerTitle} <StreakBadge streak={streak} />
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden lg:flex items-center gap-3 text-xs font-nunito" style={{ color: MUTED }}>
            <span>{petStage.emoji}</span>
            <span>{data.character.xp} XP</span>
            <button onClick={() => setTourStep(0)} className="transition-opacity hover:opacity-70" style={{ color: MUTED }}>
              {tr.howThisWorks}
            </button>
          </div>
          <div className="flex rounded-full overflow-hidden" style={{ background: `${INK}08` }}>
            {(['en', 'id'] as Lang[]).map(l => (
              <button
                key={l}
                onClick={() => changeLang(l)}
                className="px-2.5 py-1 font-nunito text-xs font-semibold transition-colors"
                style={lang === l ? { background: ACCENT, color: '#FFFFFF' } : { color: MUTED }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">

          {/* Mobile pet, plain — no box */}
          <div className="lg:hidden mb-5">
            <Character type="financial" xp={data.character.xp} happiness={data.character.happiness} prestige={data.character.prestige} onEvolution={s => showToast(tr.evolved(s.name), true)} onPrestige={p => showToast(tr.prestige(p), true)} />
          </div>

          {/* Metrics — plain typographic row, no boxed tiles */}
          <div className="font-nunito text-xs mb-1.5" style={{ color: MUTED }}>{tr.thisMonth}</div>
          <div className="flex flex-wrap gap-x-8 gap-y-3 mb-6">
            {[
              { label: tr.metricIncome, value: formatRp(monthIncome), color: INCOME_COLOR },
              { label: tr.metricExpenses, value: formatRp(monthExpense), color: EXPENSE_COLOR },
              { label: tr.metricNet, value: `${monthNet >= 0 ? '+' : ''}${formatRp(monthNet)}`, color: monthNet >= 0 ? INCOME_COLOR : EXPENSE_COLOR },
              { label: tr.metricSavings, value: `${monthSavingsRate}%`, color: monthHealthColor },
            ].map(m => (
              <div key={m.label}>
                <div className="font-nunito font-bold text-lg md:text-xl leading-none" style={{ color: m.color }}>{m.value}</div>
                <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs — solid pill buttons, not underlined links */}
          <div className="flex flex-wrap gap-2 mb-6">
            {MAIN_TABS.map((t, i) => {
              const isTourTarget = tourStep !== null && TOUR_STEPS[tourStep].tab === t.key
              return (
                <button
                  key={t.key}
                  ref={el => { tabRefs.current[i] = el }}
                  onClick={() => handleTabClick(t.key)}
                  className="px-4 py-2 rounded-full font-nunito text-sm font-semibold transition-all"
                  style={{
                    ...(mainTab === t.key
                      ? { background: ACCENT, color: '#FFFFFF', boxShadow: `0 3px 10px ${ACCENT}50` }
                      : { background: `${INK}08`, color: MUTED }),
                    ...(isTourTarget ? { boxShadow: `0 0 0 3px ${ACCENT}80, 0 3px 10px ${ACCENT}50` } : {}),
                  }}
                >
                  <StableLabel a={t.enLabel} b={t.idLabel} active={lang === 'en' ? 'a' : 'b'} />
                </button>
              )
            })}
          </div>

          {/* ── OVERVIEW ─────────────────────────────────────── */}
          {mainTab === 'overview' && (
            <div className="max-w-5xl grid lg:grid-cols-2 gap-x-10 gap-y-6">
            <div className="space-y-6">

              {(budgetAlerts.length > 0 || nextBill) && (
                <div className="space-y-1">
                  {budgetAlerts.map(a => (
                    <div key={a.cat} className="font-nunito text-xs" style={{ color: a.pct >= 100 ? EXPENSE_COLOR : WARN_COLOR }}>
                      {tr.budgetAlertLine(categoryLabel(a.cat), a.pct, formatRp(a.budget!.monthlyLimit))}
                    </div>
                  ))}
                  {nextBill && (
                    <div className="font-nunito text-xs" style={{ color: isRecurOverdue(nextBill) ? EXPENSE_COLOR : MUTED }}>
                      {isRecurOverdue(nextBill) ? tr.billOverdueLine(nextBill.name, nextBill.dueDay) : tr.billRenewsLine(nextBill.name, nextBill.dueDay)}, {formatRp(nextBill.amount)}
                    </div>
                  )}
                </div>
              )}

              {/* Add transaction — the one panel on this tab, it's real input UI */}
              <Panel tone="tint" accent={ACCENT} className="p-5">
                <div className="font-nunito font-semibold text-sm mb-3" style={{ color: INK }}>{tr.addTransaction}</div>
                <div className="flex gap-2 mb-3">
                  {(['income', 'expense'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setForm(f => ({ ...f, type: t, category: t === 'income' ? INCOME_CATS[0] : EXPENSE_CATS[0] }))}
                      className="flex-1 py-2 rounded-full font-nunito text-sm font-semibold transition-colors"
                      style={form.type === t
                        ? { background: t === 'income' ? INCOME_COLOR : EXPENSE_COLOR, color: '#FFFFFF' }
                        : { background: 'transparent', color: MUTED }}
                    >
                      <StableLabel
                        a={t === 'income' ? FIN_T.en.toggleIncome : FIN_T.en.toggleExpense}
                        b={t === 'income' ? FIN_T.id.toggleIncome : FIN_T.id.toggleExpense}
                        active={lang === 'en' ? 'a' : 'b'}
                      />
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="number"
                    placeholder={tr.amountPlaceholder}
                    value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleAddTransaction()}
                    className="px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                    style={{ background: '#FFFFFF', color: INK }}
                  />
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                    style={{ background: '#FFFFFF', color: INK }}
                  >
                    {cats.map(c => <option key={c} value={c}>{categoryLabel(c)}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={tr.descriptionPlaceholder}
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleAddTransaction()}
                    className="flex-1 px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                    style={{ background: '#FFFFFF', color: INK }}
                  />
                  <NButton onClick={handleAddTransaction} disabled={!form.amount} accent={ACCENT}>
                    {tr.add}
                  </NButton>
                </div>
              </Panel>
            </div>

            <div className="space-y-6">
              {/* Cashflow health — plain content, no box */}
              {data.transactions.length > 0 && (
                <div>
                  <div className="font-nunito font-semibold text-sm mb-1" style={{ color: INK }}>{tr.cashflowHealth}</div>
                  <div className="font-nunito text-xs mb-2" style={{ color: MUTED }}>
                    {tr.cashflowHealthCaption}
                  </div>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="font-nunito font-bold leading-none" style={{ color: monthHealthColor, fontSize: 34 }}>{monthHealthScore}</div>
                    <div className="flex-1">
                      <div className="font-nunito text-sm" style={{ color: INK }}>{monthHealthLabel}</div>
                      <div className="font-nunito text-xs" style={{ color: MUTED }}>{tr.savingsRateThisMonth(monthSavingsRate)}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-nunito text-xs" style={{ color: MUTED }}>{tr.dailyAvgSpend}</div>
                      <div className="font-nunito text-sm" style={{ color: INK }}>{formatRp(monthDailyAvgExpense)}</div>
                    </div>
                  </div>
                  <NProgress pct={monthHealthScore} accent={monthHealthColor} height={5} />
                </div>
              )}

              {/* Recent transactions — plain divided list */}
              {recent3.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-nunito font-semibold text-sm" style={{ color: INK }}>{tr.recent}</div>
                    <button onClick={() => setMainTab('log')} className="font-nunito text-xs transition-opacity hover:opacity-70" style={{ color: ACCENT }}>
                      {tr.seeAll}
                    </button>
                  </div>
                  <div>
                    {recent3.map((tx, i) => (
                      <div key={tx.id} className="flex items-center gap-3 py-2.5" style={{ borderTop: i === 0 ? 'none' : `1px solid ${INK}0D` }}>
                        <span className="font-nunito text-sm flex-shrink-0" style={{ color: tx.type === 'income' ? INCOME_COLOR : EXPENSE_COLOR }}>
                          {tx.type === 'income' ? '+' : '−'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-nunito text-sm truncate" style={{ color: INK }}>{tx.description}</div>
                          <div className="font-nunito text-xs" style={{ color: MUTED }}>{categoryLabel(tx.category)} · {tx.date}</div>
                        </div>
                        <span className="font-nunito font-semibold text-sm flex-shrink-0" style={{ color: tx.type === 'income' ? INCOME_COLOR : EXPENSE_COLOR }}>
                          {formatRp(tx.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.transactions.length === 0 && (
                <div className="py-10 text-center">
                  <div className="font-nunito text-sm" style={{ color: INK }}>{tr.noTransactionsYet}</div>
                  <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>{tr.addFirstTransaction}</div>
                </div>
              )}
            </div>
            </div>
          )}

          {/* ── LOG ──────────────────────────────────────────── */}
          {mainTab === 'log' && (
            <div className="max-w-2xl">
              <div className="flex gap-5 mb-5">
                {(['all', 'income', 'expense'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className="font-nunito text-sm transition-colors"
                    style={{ color: filter === f ? INK : MUTED, fontWeight: filter === f ? 600 : 400 }}
                  >
                    {f === 'all' ? tr.filterAll(data.transactions.length) : f === 'income' ? tr.filterIncome : tr.filterExpense}
                  </button>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="py-10 text-center font-nunito text-sm" style={{ color: MUTED }}>
                  {data.transactions.length === 0 ? tr.noTransactionsYetAddOne : tr.noTransactionsMatchFilter}
                </div>
              )}

              {filtered.map((tx, i) => (
                <div key={tx.id} className="flex items-center gap-3 py-3" style={{ borderTop: i === 0 ? 'none' : `1px solid ${INK}0D` }}>
                  <span className="font-nunito text-sm flex-shrink-0" style={{ color: tx.type === 'income' ? INCOME_COLOR : EXPENSE_COLOR }}>
                    {tx.type === 'income' ? '+' : '−'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-nunito font-medium text-sm truncate" style={{ color: INK }}>{tx.description}</div>
                    <div className="font-nunito text-xs" style={{ color: MUTED }}>{categoryLabel(tx.category)} · {tx.date}</div>
                  </div>
                  <span className="font-nunito font-semibold text-sm flex-shrink-0" style={{ color: tx.type === 'income' ? INCOME_COLOR : EXPENSE_COLOR }}>
                    {formatRp(tx.amount)}
                  </span>
                  <button
                    onClick={() => handleDeleteTransaction(tx.id)}
                    className="text-sm flex-shrink-0 transition-opacity hover:opacity-70"
                    style={{ color: MUTED }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── BUDGETS ──────────────────────────────────────── */}
          {mainTab === 'budgets' && (
            <div className="max-w-5xl grid lg:grid-cols-2 gap-x-10 gap-y-10">

              <div>
                <div className="font-nunito font-semibold text-sm mb-1" style={{ color: INK }}>{tr.categoryBudgetsHeading}</div>
                <div className="font-nunito text-xs mb-4" style={{ color: MUTED }}>{tr.categoryBudgetsCaption}</div>
                <div className="space-y-4">
                  {EXPENSE_CATS.map(cat => {
                    const budget = budgetFor(cat)
                    const spent = spentInCategory(cat)
                    const pct = budget ? Math.min(100, (spent / budget.monthlyLimit) * 100) : 0
                    const over = !!budget && spent > budget.monthlyLimit
                    const near = !!budget && !over && pct >= 80
                    const color = over ? EXPENSE_COLOR : near ? WARN_COLOR : ACCENT
                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between gap-3 mb-1.5">
                          <span className="font-nunito text-sm" style={{ color: INK }}>{categoryLabel(cat)}</span>
                          <input
                            type="number"
                            placeholder={tr.noLimitPlaceholder}
                            value={budgetInputs[cat] ?? (budget ? String(budget.monthlyLimit) : '')}
                            onChange={e => setBudgetInputs(f => ({ ...f, [cat]: e.target.value }))}
                            onBlur={() => handleBudgetBlur(cat)}
                            className="w-32 px-2 py-1 rounded-lg font-nunito text-xs text-right outline-none"
                            style={{ background: '#F0EEE8', color: INK }}
                          />
                        </div>
                        {budget && (
                          <>
                            <NProgress pct={pct} accent={color} height={4} />
                            <div className="flex justify-between font-nunito text-xs mt-1" style={{ color: over ? EXPENSE_COLOR : MUTED }}>
                              <span>{tr.spentLabel(formatRp(spent))}</span>
                              <span>{over ? tr.overBudget : tr.ofLimit(formatRp(budget.monthlyLimit))}</span>
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                <div className="font-nunito font-semibold text-sm mb-1" style={{ color: INK }}>{tr.recurringBillsHeading}</div>
                <div className="font-nunito text-xs mb-4" style={{ color: MUTED }}>{tr.recurringBillsCaption}</div>
                <Panel tone="tint" accent={ACCENT} className="p-4 mb-4">
                  <div className="flex gap-2 mb-2">
                    {(['expense', 'income'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setRecurForm(f => ({ ...f, type: t, category: t === 'income' ? INCOME_CATS[0] : EXPENSE_CATS[0] }))}
                        className="flex-1 py-1.5 rounded-full font-nunito text-xs font-semibold transition-colors"
                        style={recurForm.type === t
                          ? { background: t === 'income' ? INCOME_COLOR : EXPENSE_COLOR, color: '#FFFFFF' }
                          : { background: 'transparent', color: MUTED }}
                      >
                        <StableLabel
                          a={t === 'income' ? FIN_T.en.toggleIncome : FIN_T.en.toggleBill}
                          b={t === 'income' ? FIN_T.id.toggleIncome : FIN_T.id.toggleBill}
                          active={lang === 'en' ? 'a' : 'b'}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input
                      type="text" placeholder={tr.namePlaceholder} value={recurForm.name}
                      onChange={e => setRecurForm(f => ({ ...f, name: e.target.value }))}
                      className="px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                      style={{ background: '#FFFFFF', color: INK }}
                    />
                    <input
                      type="number" placeholder={tr.amountPlaceholder} value={recurForm.amount}
                      onChange={e => setRecurForm(f => ({ ...f, amount: e.target.value }))}
                      className="px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                      style={{ background: '#FFFFFF', color: INK }}
                    />
                    <select
                      value={recurForm.category}
                      onChange={e => setRecurForm(f => ({ ...f, category: e.target.value }))}
                      className="px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                      style={{ background: '#FFFFFF', color: INK }}
                    >
                      {(recurForm.type === 'income' ? INCOME_CATS : EXPENSE_CATS).map(c => <option key={c} value={c}>{categoryLabel(c)}</option>)}
                    </select>
                    <input
                      type="number" min={1} max={31} placeholder={tr.renewsOnDayPlaceholder} value={recurForm.dueDay}
                      onChange={e => { setRecurForm(f => ({ ...f, dueDay: e.target.value })); setRecurAlreadyPaid(false) }}
                      onKeyDown={e => e.key === 'Enter' && handleAddRecurring()}
                      className="px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                      style={{ background: '#FFFFFF', color: INK }}
                    />
                  </div>
                  <div className="font-nunito text-xs mb-2" style={{ color: MUTED }}>
                    {tr.renewsCaption}
                  </div>
                  {recurForm.dueDay !== '' && Number(recurForm.dueDay) > 0 && Number(recurForm.dueDay) < new Date().getDate() && (
                    <label className="flex items-start gap-2 mb-3 font-nunito text-xs cursor-pointer" style={{ color: INK }}>
                      <input
                        type="checkbox"
                        checked={recurAlreadyPaid}
                        onChange={e => setRecurAlreadyPaid(e.target.checked)}
                        className="mt-0.5"
                      />
                      <span>{tr.alreadyPaidCheckbox(recurForm.dueDay)}</span>
                    </label>
                  )}
                  <NButton onClick={handleAddRecurring} disabled={!recurForm.name || !recurForm.amount || !recurForm.dueDay} accent={ACCENT} className="w-full">
                    {tr.addRecurring}
                  </NButton>
                </Panel>

                {data.recurring.map((r, i) => {
                  const paid = isRecurPaid(r)
                  const overdue = isRecurOverdue(r)
                  return (
                    <div key={r.id} className="flex items-center gap-3 py-3" style={{ borderTop: i === 0 ? 'none' : `1px solid ${INK}0D` }}>
                      <div className="flex-1 min-w-0">
                        <div className="font-nunito font-medium text-sm truncate" style={{ color: overdue ? EXPENSE_COLOR : INK }}>
                          {r.name}
                        </div>
                        <div className="font-nunito text-xs" style={{ color: overdue ? EXPENSE_COLOR : MUTED }}>
                          {r.type === 'income' ? '+' : '−'}{formatRp(r.amount)} · {overdue ? tr.recurOverdue(r.dueDay) : tr.recurRenews(r.dueDay)} · {categoryLabel(r.category)}
                        </div>
                      </div>
                      {paid ? (
                        <span className="font-nunito text-xs flex-shrink-0" style={{ color: INCOME_COLOR }}>{tr.paidThisMonth}</span>
                      ) : (
                        <button onClick={() => handleMarkRecurringPaid(r)} className="font-nunito text-xs flex-shrink-0" style={{ color: overdue ? EXPENSE_COLOR : ACCENT }}>
                          {tr.markPaid}
                        </button>
                      )}
                      <button onClick={() => handleDeleteRecurring(r.id)} className="text-sm flex-shrink-0 transition-opacity hover:opacity-70" style={{ color: MUTED }}>✕</button>
                    </div>
                  )
                })}

                {data.recurring.length === 0 && (
                  <div className="font-nunito text-xs" style={{ color: MUTED }}>{tr.noRecurringYet}</div>
                )}
              </div>
            </div>
          )}

          {/* ── ANALYTICS ────────────────────────────────────── */}
          {mainTab === 'analytics' && (
            <div className="space-y-8 max-w-5xl">
              {data.transactions.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="font-nunito text-sm" style={{ color: INK }}>{tr.noDataYet}</div>
                  <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>{tr.addTransactionsToUnlock}</div>
                </div>
              ) : (
                <>
                  <div className="font-nunito text-xs mb-1.5" style={{ color: MUTED }}>{tr.allTime}</div>
                  <div className="flex flex-wrap gap-x-8 gap-y-3">
                    {[
                      { label: tr.analyticsTransactions, value: String(data.transactions.length), color: INK },
                      { label: tr.dailyAvgSpend, value: formatRp(dailyAvgExpense), color: EXPENSE_COLOR },
                      { label: tr.netBalance, value: `${net >= 0 ? '+' : ''}${shortRp(net)}`, color: net >= 0 ? INCOME_COLOR : EXPENSE_COLOR },
                      { label: tr.healthScore, value: `${healthScore}/100`, color: healthColor },
                    ].map(s => (
                      <div key={s.label}>
                        <div className="font-nunito font-bold text-lg leading-none" style={{ color: s.color }}>{s.value}</div>
                        <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {netWorthSeries.length >= 2 && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-nunito font-semibold text-sm" style={{ color: INK }}>{tr.netWorthTrend}</div>
                        <span className="font-nunito text-xs" style={{ color: MUTED }}>
                          {formatRp(netWorthSeries[0])} → {formatRp(netWorthSeries[netWorthSeries.length - 1])}
                        </span>
                      </div>
                      <div className="font-nunito text-xs mb-2" style={{ color: MUTED }}>
                        {tr.netWorthCaption}
                      </div>
                      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full" style={{ height: 100 }}>
                        <polyline points={netWorthPoints} fill="none" stroke={netWorthColor} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
                      </svg>
                      <div className="flex justify-between font-nunito text-[10px]" style={{ color: MUTED }}>
                        <span>{sortedTx[0]?.date}</span>
                        <span>{sortedTx[sortedTx.length - 1]?.date}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="font-nunito font-semibold text-sm mb-4" style={{ color: INK }}>
                      {tr.incomeVsExpenses}
                    </div>
                    <div className="flex items-end gap-2" style={{ height: BAR_MAX_H + 8 }}>
                      {monthlyData.map(m => (
                        <div key={m.label} className="flex-1 flex flex-col">
                          <div className="flex items-end gap-0.5 flex-1">
                            <div
                              title={`${tr.legendIncome}: ${formatRp(m.income)}`}
                              className="flex-1 rounded-t-sm transition-all duration-500"
                              style={{ height: m.income > 0 ? Math.max(4, (m.income / maxMonthly) * BAR_MAX_H) : 0, background: INCOME_COLOR }}
                            />
                            <div
                              title={`${tr.legendExpenses}: ${formatRp(m.expense)}`}
                              className="flex-1 rounded-t-sm transition-all duration-500"
                              style={{ height: m.expense > 0 ? Math.max(4, (m.expense / maxMonthly) * BAR_MAX_H) : 0, background: EXPENSE_COLOR }}
                            />
                          </div>
                          <div className="text-center mt-1.5 font-nunito text-[10px]" style={{ color: MUTED }}>{m.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-4 mt-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: INCOME_COLOR }} />
                        <span className="font-nunito text-xs" style={{ color: MUTED }}>{tr.legendIncome}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: EXPENSE_COLOR }} />
                        <span className="font-nunito text-xs" style={{ color: MUTED }}>{tr.legendExpenses}</span>
                      </div>
                    </div>
                  </div>

                  {(topExpenses.length > 0 || incomeSources.length > 0) && (
                    <div className="grid lg:grid-cols-2 gap-x-10 gap-y-8">
                      {topExpenses.length > 0 && (
                        <div>
                          <div className="font-nunito font-semibold text-sm mb-3" style={{ color: INK }}>{tr.topSpendingCategories}</div>
                          <div className="space-y-3">
                            {topExpenses.map(([cat, amt]) => (
                              <div key={cat}>
                                <div className="flex justify-between font-nunito text-xs mb-1.5">
                                  <span style={{ color: INK }}>{categoryLabel(cat)}</span>
                                  <span style={{ color: MUTED }}>
                                    {totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0}% · {formatRp(amt)}
                                  </span>
                                </div>
                                <NProgress pct={totalExpense > 0 ? (amt / totalExpense) * 100 : 0} accent={EXPENSE_COLOR} height={4} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {incomeSources.length > 0 && (
                        <div>
                          <div className="font-nunito font-semibold text-sm mb-3" style={{ color: INK }}>{tr.incomeSources}</div>
                          <div className="space-y-3">
                            {incomeSources.map(([cat, amt]) => (
                              <div key={cat}>
                                <div className="flex justify-between font-nunito text-xs mb-1.5">
                                  <span style={{ color: INK }}>{categoryLabel(cat)}</span>
                                  <span style={{ color: MUTED }}>
                                    {totalIncome > 0 ? Math.round((amt / totalIncome) * 100) : 0}% · {formatRp(amt)}
                                  </span>
                                </div>
                                <NProgress pct={totalIncome > 0 ? (amt / totalIncome) * 100 : 0} accent={INCOME_COLOR} height={4} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── PET ──────────────────────────────────────────── */}
          {mainTab === 'pet' && (
            <div className="space-y-4 max-w-2xl">
              <DailyChallenges trackerId="financial" accent={ACCENT} challenges={dailyChallenges} onClaim={handleClaimChallenge} />
              <PetRoom
                userId={userId}
                trackerId="financial"
                character={data.character}
                streak={streak}
                earnedBadges={earnedBadges}
                missions={missions}
                onCharacter={c => setData(d => d ? { ...d, character: c } : d)}
              />
            </div>
          )}

          {/* ── GAMES ────────────────────────────────────────── */}
          {mainTab === 'games' && (
            <div className="max-w-xl">
              <div className="flex flex-wrap gap-2 mb-5">
                {(['clicker', 'arcade', 'puzzle'] as GameTab[]).map(g => (
                  <button
                    key={g}
                    onClick={() => setGameTab(g)}
                    className="px-4 py-2 rounded-full font-nunito text-sm font-semibold transition-all"
                    style={gameTab === g
                      ? { background: ACCENT, color: '#FFFFFF', boxShadow: `0 3px 10px ${ACCENT}50` }
                      : { background: `${INK}08`, color: MUTED }}
                  >
                    <StableLabel
                      a={g === 'clicker' ? FIN_T.en.gameClicker : g === 'arcade' ? FIN_T.en.gameArcade : FIN_T.en.gamePuzzle}
                      b={g === 'clicker' ? FIN_T.id.gameClicker : g === 'arcade' ? FIN_T.id.gameArcade : FIN_T.id.gamePuzzle}
                      active={lang === 'en' ? 'a' : 'b'}
                    />
                  </button>
                ))}
              </div>
              {gameTab === 'clicker' && <MoneyRain onXPEarned={handleXPEarned} />}
              {gameTab === 'arcade' && <BudgetDodge onXPEarned={handleXPEarned} />}
              {gameTab === 'puzzle' && <MoneyMatch onXPEarned={handleXPEarned} />}
            </div>
          )}
        </div>

        {/* RIGHT PANEL, desktop only */}
        <aside className="w-72 flex-shrink-0 hidden lg:block overflow-y-auto" style={{ borderLeft: `1px solid ${INK}0D`, background: '#F5F4F2' }}>
          <Panel tone="tint" accent={ACCENT} className="m-6 p-5">
            <Character type="financial" xp={data.character.xp} happiness={data.character.happiness} prestige={data.character.prestige} onEvolution={s => showToast(tr.evolved(s.name), true)} onPrestige={p => showToast(tr.prestige(p), true)} />
            <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${INK}0D` }}>
              <div className="font-nunito font-semibold text-sm mb-1" style={{ color: INK }}>{tr.cashflowHealth}</div>
              <div className="font-nunito text-xs mb-2" style={{ color: MUTED }}>{tr.cashflowHealthCaptionShort}</div>
              <NProgress pct={monthHealthScore} accent={monthHealthColor} height={5} />
              <div className="flex justify-between font-nunito text-xs mt-1.5">
                <span style={{ color: MUTED }}>{monthHealthLabel}</span>
                <span style={{ color: MUTED }}>{tr.savingsThisMonth(monthSavingsRate)}</span>
              </div>
            </div>
            {nextBill && (
              <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${INK}0D` }}>
                <div className="font-nunito font-semibold text-sm mb-1" style={{ color: INK }}>{tr.nextBill}</div>
                <div className="font-nunito text-sm" style={{ color: INK }}>{nextBill.name}</div>
                <div className="font-nunito text-xs" style={{ color: isRecurOverdue(nextBill) ? EXPENSE_COLOR : MUTED }}>
                  {formatRp(nextBill.amount)} · {isRecurOverdue(nextBill) ? tr.recurOverdue(nextBill.dueDay) : tr.recurRenews(nextBill.dueDay)}
                </div>
              </div>
            )}
            <div className="font-nunito text-xs leading-relaxed mt-4 pt-4" style={{ color: MUTED, borderTop: `1px solid ${INK}0D` }}>
              {tr.sidebarTip}
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  )
}
