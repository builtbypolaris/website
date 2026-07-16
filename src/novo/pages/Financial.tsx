import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  addTransaction as dbAddTransaction,
  deleteTransaction as dbDeleteTransaction,
  getFinancialData,
  addXP, todayStr,
} from '../lib/storage'
import { awardXP, getStreak, getBadges, getWeekMissions, applyHappinessDecay, type StreakRow, type MissionRow } from '../lib/gamification'
import { useCelebrations } from '../components/CelebrationLayer'
import { StreakBadge } from '../components/StreakBadge'
import { PetRoom } from '../components/PetRoom'
import { DailyChallenges } from '../components/DailyChallenges'
import { useAuth } from '../contexts/AuthContext'
import { FINANCIAL_STAGES, getStageFromXP } from '../data/creatures'
import { INK, MUTED, Panel, NButton, NProgress } from '../components/ui'
import Character from '../components/Character'
import MoneyRain from '../games/MoneyRain'
import BudgetDodge from '../games/BudgetDodge'
import MoneyMatch from '../games/MoneyMatch'
import type { CharacterState, FinancialData } from '../types'

const INCOME_CATS = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other']
const EXPENSE_CATS = ['Food', 'Transport', 'Shopping', 'Health', 'Bills', 'Entertainment', 'Other']
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const BAR_MAX_H = 112

type GameTab = 'clicker' | 'arcade' | 'puzzle'
type MainTab = 'overview' | 'log' | 'analytics' | 'pet' | 'games'

const ACCENT = '#B45309'
const INCOME_COLOR = '#16A34A'
const EXPENSE_COLOR = '#DC2626'

function formatRp(n: number) { return 'Rp ' + n.toLocaleString('id-ID') }
function shortRp(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`
  return String(n)
}

const MAIN_TABS: { key: MainTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'log', label: 'Log' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'pet', label: 'Pet' },
  { key: 'games', label: 'Games' },
]

export default function Financial() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const userId = session?.user.id ?? ''

  const [data, setData] = useState<FinancialData | null>(null)
  const [mainTab, setMainTab] = useState<MainTab>('overview')
  const [gameTab, setGameTab] = useState<GameTab>('clicker')
  const [form, setForm] = useState({ type: 'income' as 'income' | 'expense', amount: '', category: INCOME_CATS[0], description: '' })
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [toast, setToast] = useState<{ msg: string; good: boolean } | null>(null)
  const [streak, setStreak] = useState<StreakRow | null>(null)
  const [earnedBadges, setEarnedBadges] = useState<Set<string>>(new Set())
  const [missions, setMissions] = useState<MissionRow[]>([])
  const { celebrate, layer } = useCelebrations()

  useEffect(() => {
    if (!userId) return
    getStreak(userId, 'financial').then(setStreak)
    getBadges(userId, 'financial').then(rows => setEarnedBadges(new Set(rows.map(b => b.badgeId))))
    getWeekMissions(userId).then(setMissions)
    getFinancialData(userId).then(setData)
  }, [userId])

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
        <div className="font-nunito text-sm" style={{ color: MUTED }}>Loading…</div>
      </div>
    )
  }

  // ── Core stats ────────────────────────────────────────────
  const totalIncome  = data.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = data.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const net = totalIncome - totalExpense
  const savingsRate = totalIncome > 0 ? Math.round((net / totalIncome) * 100) : 0
  const healthScore = Math.min(100, Math.max(0, savingsRate * 1.5 + (net > 0 ? 20 : -20) + 30))
  const uniqueDays = new Set(data.transactions.map(t => t.date)).size || 1
  const dailyAvgExpense = Math.round(totalExpense / uniqueDays)

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

  // ── Actions ───────────────────────────────────────────────
  const handleAddTransaction = async () => {
    if (!form.amount || isNaN(Number(form.amount))) return
    const amt = Math.abs(Number(form.amount))
    const newIncome = form.type === 'income' ? totalIncome + amt : totalIncome
    const newNet    = newIncome - (form.type === 'expense' ? totalExpense + amt : totalExpense)
    const newRate   = newIncome > 0 ? (newNet / newIncome) * 100 : 0

    let xpGain: number
    if (form.type === 'income') {
      xpGain = newRate > 30 ? 25 : newRate > 20 ? 20 : newRate > 10 ? 12 : 8
    } else {
      if (newIncome === 0)      xpGain = -10
      else if (newRate >= 20)   xpGain =   2
      else if (newRate >= 0)    xpGain =  -5
      else if (newRate >= -20)  xpGain = -10
      else                      xpGain = -20
    }

    const newCharacter = addXP(data.character, xpGain)
    try {
      const tx = await dbAddTransaction(userId, {
        type: form.type,
        amount: amt,
        category: form.category,
        description: form.description || form.category,
        date: todayStr(),
      })
      setData(d => d ? { ...d, transactions: [tx, ...d.transactions], character: newCharacter } : d)
      runAward(data.character, xpGain)
      setForm(f => ({ ...f, amount: '', description: '' }))
      if (xpGain > 0) showToast(`+${xpGain} XP!`, true)
      else showToast(`${xpGain} XP. Watch your cashflow!`, false)
    } catch {
      showToast('Failed to save transaction', false)
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
    showToast(`+${xp} XP from game!`)
  }

  const handleClaimChallenge = (xp: number, title: string) => {
    const before = data.character
    setData(d => d ? { ...d, character: addXP(before, xp) } : d)
    runAward(before, xp)
    showToast(`${title}: +${xp} XP!`)
  }

  const cats     = form.type === 'income' ? INCOME_CATS : EXPENSE_CATS
  const filtered = data.transactions.filter(t => filter === 'all' || t.type === filter)
  const recent3  = data.transactions.slice(0, 3)

  const healthLabel = healthScore >= 70 ? 'Healthy' : healthScore >= 40 ? 'Fair' : 'At risk'
  const healthColor = healthScore >= 70 ? INCOME_COLOR : healthScore >= 40 ? ACCENT : EXPENSE_COLOR

  const txToday = data.transactions.filter(t => t.date === todayStr())
  const dailyChallenges = [
    { id: 'log2', title: 'Log 2 transactions', emoji: '🧾', xp: 15, met: txToday.length >= 2 },
    { id: 'income', title: 'Log an income', emoji: '💵', xp: 20, met: txToday.some(t => t.type === 'income') },
    { id: 'log5', title: 'Log 5 transactions', emoji: '📚', xp: 30, met: txToday.length >= 5 },
  ]

  return (
    <div className="h-full flex flex-col" style={{ background: '#F5F4F2' }}>
      {layer}

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
        <button onClick={() => navigate('/studios/dashboard')} className="font-nunito text-sm transition-opacity hover:opacity-70" style={{ color: MUTED }}>
          Back
        </button>
        <div className="font-nunito font-semibold text-sm flex items-center gap-2" style={{ color: INK }}>
          Financial <StreakBadge streak={streak} />
        </div>
        <div className="hidden lg:flex items-center gap-1.5 text-xs font-nunito" style={{ color: MUTED }}>
          <span>{petStage.emoji}</span>
          <span>{data.character.xp} XP</span>
        </div>
        <div className="lg:hidden w-10" />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">

          {/* Mobile pet, plain — no box */}
          <div className="lg:hidden mb-5">
            <Character type="financial" xp={data.character.xp} happiness={data.character.happiness} prestige={data.character.prestige} onEvolution={s => showToast(`Evolved to ${s.name}!`, true)} onPrestige={p => showToast(`Prestige ${p}! Pet reborn!`, true)} />
          </div>

          {/* Metrics — plain typographic row, no boxed tiles */}
          <div className="flex flex-wrap gap-x-8 gap-y-3 mb-6">
            {[
              { label: 'Income', value: formatRp(totalIncome), color: INCOME_COLOR },
              { label: 'Expenses', value: formatRp(totalExpense), color: EXPENSE_COLOR },
              { label: 'Net', value: `${net >= 0 ? '+' : ''}${formatRp(net)}`, color: net >= 0 ? INCOME_COLOR : EXPENSE_COLOR },
              { label: 'Savings', value: `${savingsRate}%`, color: healthColor },
            ].map(m => (
              <div key={m.label}>
                <div className="font-nunito font-bold text-lg md:text-xl leading-none" style={{ color: m.color }}>{m.value}</div>
                <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs — plain text, underline indicates active */}
          <div className="flex mb-6 overflow-x-auto scrollbar-hidden gap-5" style={{ borderBottom: `1px solid ${INK}12` }}>
            {MAIN_TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setMainTab(t.key)}
                className="pb-2.5 font-nunito text-sm whitespace-nowrap flex-shrink-0 transition-colors"
                style={{
                  color: mainTab === t.key ? INK : MUTED,
                  fontWeight: mainTab === t.key ? 600 : 400,
                  borderBottom: mainTab === t.key ? `2px solid ${ACCENT}` : '2px solid transparent',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW ─────────────────────────────────────── */}
          {mainTab === 'overview' && (
            <div className="space-y-6 max-w-xl">

              {/* Add transaction — the one panel on this tab, it's real input UI */}
              <Panel tone="tint" accent={ACCENT} className="p-5">
                <div className="font-nunito font-semibold text-sm mb-3" style={{ color: INK }}>Add transaction</div>
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
                      {t === 'income' ? 'Income' : 'Expense'}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="number"
                    placeholder="Amount (Rp)"
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
                    {cats.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleAddTransaction()}
                    className="flex-1 px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                    style={{ background: '#FFFFFF', color: INK }}
                  />
                  <NButton onClick={handleAddTransaction} disabled={!form.amount} accent={ACCENT}>
                    Add
                  </NButton>
                </div>
              </Panel>

              {/* Cashflow health — plain content, no box */}
              {data.transactions.length > 0 && (
                <div>
                  <div className="font-nunito font-semibold text-sm mb-2" style={{ color: INK }}>Cashflow health</div>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="font-nunito font-bold leading-none" style={{ color: healthColor, fontSize: 34 }}>{healthScore}</div>
                    <div className="flex-1">
                      <div className="font-nunito text-sm" style={{ color: INK }}>{healthLabel}</div>
                      <div className="font-nunito text-xs" style={{ color: MUTED }}>{savingsRate}% savings rate</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-nunito text-xs" style={{ color: MUTED }}>daily avg spend</div>
                      <div className="font-nunito text-sm" style={{ color: INK }}>{formatRp(dailyAvgExpense)}</div>
                    </div>
                  </div>
                  <NProgress pct={healthScore} accent={healthColor} height={5} />
                </div>
              )}

              {/* Recent transactions — plain divided list */}
              {recent3.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-nunito font-semibold text-sm" style={{ color: INK }}>Recent</div>
                    <button onClick={() => setMainTab('log')} className="font-nunito text-xs transition-opacity hover:opacity-70" style={{ color: ACCENT }}>
                      See all
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
                          <div className="font-nunito text-xs" style={{ color: MUTED }}>{tx.category} · {tx.date}</div>
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
                  <div className="font-nunito text-sm" style={{ color: INK }}>No transactions yet</div>
                  <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>Add your first income or expense above to start tracking</div>
                </div>
              )}
            </div>
          )}

          {/* ── LOG ──────────────────────────────────────────── */}
          {mainTab === 'log' && (
            <div className="max-w-xl">
              <div className="flex gap-5 mb-5">
                {(['all', 'income', 'expense'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className="font-nunito text-sm transition-colors"
                    style={{ color: filter === f ? INK : MUTED, fontWeight: filter === f ? 600 : 400 }}
                  >
                    {f === 'all' ? `All (${data.transactions.length})` : f === 'income' ? 'Income' : 'Expense'}
                  </button>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="py-10 text-center font-nunito text-sm" style={{ color: MUTED }}>
                  {data.transactions.length === 0 ? 'No transactions yet. Add one in Overview' : 'No transactions match this filter'}
                </div>
              )}

              {filtered.map((tx, i) => (
                <div key={tx.id} className="flex items-center gap-3 py-3" style={{ borderTop: i === 0 ? 'none' : `1px solid ${INK}0D` }}>
                  <span className="font-nunito text-sm flex-shrink-0" style={{ color: tx.type === 'income' ? INCOME_COLOR : EXPENSE_COLOR }}>
                    {tx.type === 'income' ? '+' : '−'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-nunito font-medium text-sm truncate" style={{ color: INK }}>{tx.description}</div>
                    <div className="font-nunito text-xs" style={{ color: MUTED }}>{tx.category} · {tx.date}</div>
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

          {/* ── ANALYTICS ────────────────────────────────────── */}
          {mainTab === 'analytics' && (
            <div className="space-y-8 max-w-xl">
              {data.transactions.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="font-nunito text-sm" style={{ color: INK }}>No data yet</div>
                  <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>Add some transactions to unlock analytics</div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-x-8 gap-y-3">
                    {[
                      { label: 'Transactions', value: String(data.transactions.length), color: INK },
                      { label: 'Daily avg spend', value: formatRp(dailyAvgExpense), color: EXPENSE_COLOR },
                      { label: 'Net balance', value: `${net >= 0 ? '+' : ''}${shortRp(net)}`, color: net >= 0 ? INCOME_COLOR : EXPENSE_COLOR },
                      { label: 'Health score', value: `${healthScore}/100`, color: healthColor },
                    ].map(s => (
                      <div key={s.label}>
                        <div className="font-nunito font-bold text-lg leading-none" style={{ color: s.color }}>{s.value}</div>
                        <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="font-nunito font-semibold text-sm mb-4" style={{ color: INK }}>
                      Income vs expenses, last 6 months
                    </div>
                    <div className="flex items-end gap-2" style={{ height: BAR_MAX_H + 8 }}>
                      {monthlyData.map(m => (
                        <div key={m.label} className="flex-1 flex flex-col">
                          <div className="flex items-end gap-0.5 flex-1">
                            <div
                              title={`Income: ${formatRp(m.income)}`}
                              className="flex-1 rounded-t-sm transition-all duration-500"
                              style={{ height: m.income > 0 ? Math.max(4, (m.income / maxMonthly) * BAR_MAX_H) : 0, background: INCOME_COLOR }}
                            />
                            <div
                              title={`Expenses: ${formatRp(m.expense)}`}
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
                        <span className="font-nunito text-xs" style={{ color: MUTED }}>Income</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: EXPENSE_COLOR }} />
                        <span className="font-nunito text-xs" style={{ color: MUTED }}>Expenses</span>
                      </div>
                    </div>
                  </div>

                  {topExpenses.length > 0 && (
                    <div>
                      <div className="font-nunito font-semibold text-sm mb-3" style={{ color: INK }}>Top spending categories</div>
                      <div className="space-y-3">
                        {topExpenses.map(([cat, amt]) => (
                          <div key={cat}>
                            <div className="flex justify-between font-nunito text-xs mb-1.5">
                              <span style={{ color: INK }}>{cat}</span>
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
                      <div className="font-nunito font-semibold text-sm mb-3" style={{ color: INK }}>Income sources</div>
                      <div className="space-y-3">
                        {incomeSources.map(([cat, amt]) => (
                          <div key={cat}>
                            <div className="flex justify-between font-nunito text-xs mb-1.5">
                              <span style={{ color: INK }}>{cat}</span>
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
              <div className="flex items-center gap-5 mb-5" style={{ borderBottom: `1px solid ${INK}12` }}>
                {(['clicker', 'arcade', 'puzzle'] as GameTab[]).map(g => (
                  <button
                    key={g}
                    onClick={() => setGameTab(g)}
                    className="pb-2.5 font-nunito text-sm transition-colors"
                    style={{
                      color: gameTab === g ? INK : MUTED,
                      fontWeight: gameTab === g ? 600 : 400,
                      borderBottom: gameTab === g ? `2px solid ${ACCENT}` : '2px solid transparent',
                    }}
                  >
                    {g === 'clicker' ? 'Clicker' : g === 'arcade' ? 'Arcade' : 'Puzzle'}
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
            <Character type="financial" xp={data.character.xp} happiness={data.character.happiness} prestige={data.character.prestige} onEvolution={s => showToast(`Evolved to ${s.name}!`, true)} onPrestige={p => showToast(`Prestige ${p}! Pet reborn!`, true)} />
            <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${INK}0D` }}>
              <div className="font-nunito font-semibold text-sm mb-2" style={{ color: INK }}>Cashflow health</div>
              <NProgress pct={healthScore} accent={healthColor} height={5} />
              <div className="flex justify-between font-nunito text-xs mt-1.5">
                <span style={{ color: MUTED }}>{healthLabel}</span>
                <span style={{ color: MUTED }}>{savingsRate}% savings</span>
              </div>
            </div>
            <div className="font-nunito text-xs leading-relaxed mt-4" style={{ color: MUTED }}>
              Healthier cashflow means faster pet growth. Keep savings above 20% for max XP.
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  )
}
