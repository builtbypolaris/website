import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  addTransaction as dbAddTransaction,
  deleteTransaction as dbDeleteTransaction,
  getFinancialData,
  addXP, todayStr,
} from '../lib/storage'
import { awardXP, getStreak, getBadges, type StreakRow } from '../lib/gamification'
import { useCelebrations } from '../components/CelebrationLayer'
import { StreakBadge } from '../components/StreakBadge'
import { BadgeWall } from '../components/BadgeWall'
import { useAuth } from '../contexts/AuthContext'
import { FINANCIAL_STAGES, getStageFromXP } from '../data/creatures'
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
type MainTab = 'overview' | 'log' | 'analytics' | 'games'

const ACCENT = '#B45309'
const CARD_BG = '#FFFFFF'
const CARD_BORDER = '#09090F'
const INPUT_BG = '#F0EEE8'
const INCOME_COLOR = '#16A34A'
const EXPENSE_COLOR = '#DC2626'

function formatRp(n: number) { return 'Rp ' + n.toLocaleString('id-ID') }
function shortRp(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`
  return String(n)
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
  const [toast, setToast] = useState<{ msg: string; good: boolean } | null>(null)
  const [streak, setStreak] = useState<StreakRow | null>(null)
  const [earnedBadges, setEarnedBadges] = useState<Set<string>>(new Set())
  const { celebrate, layer } = useCelebrations()

  useEffect(() => {
    if (!userId) return
    getStreak(userId, 'financial').then(setStreak)
    getBadges(userId, 'financial').then(rows => setEarnedBadges(new Set(rows.map(b => b.badgeId))))
    getFinancialData(userId).then(setData)
  }, [userId])

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
        <div className="font-nunito text-[#09090F]/40 text-sm">Loading…</div>
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

  // ── Pet strip ─────────────────────────────────────────────
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
      else showToast(`${xpGain} XP — watch your cashflow!`, false)
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

  const cats     = form.type === 'income' ? INCOME_CATS : EXPENSE_CATS
  const filtered = data.transactions.filter(t => filter === 'all' || t.type === filter)
  const recent3  = data.transactions.slice(0, 3)

  const healthLabel = healthScore >= 70 ? '💚 Healthy' : healthScore >= 40 ? '💛 Fair' : '❤️ At risk'
  const healthColor = healthScore >= 70 ? INCOME_COLOR : healthScore >= 40 ? ACCENT : EXPENSE_COLOR

  return (
    <div className="h-full flex flex-col" style={{ background: '#F5F4F2' }}>

      {layer}

      {toast && (
        <div
          className="fixed top-[72px] right-4 z-50 px-4 py-2.5 rounded-xl font-nunito font-black text-white text-sm bounce-in"
          style={{ background: toast.good ? '#16A34A' : '#DC2626', border: '2.5px solid #09090F', boxShadow: '3px 3px 0 #09090F' }}
        >
          {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <header
        className="flex items-center justify-between px-4 md:px-6 py-3 sticky top-0 z-30 flex-shrink-0"
        style={{ background: 'rgba(245,244,242,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E5E4E2' }}
      >
        <button
          onClick={() => navigate('/studios/dashboard')}
          className="w-8 h-8 flex items-center justify-center rounded-lg font-nunito text-[#09090F]/50 hover:text-[#09090F] hover:bg-black/5 transition"
        >
          ←
        </button>
        <div className="font-nunito font-black uppercase tracking-wide text-[#09090F] text-sm md:text-base flex items-center gap-2">💰 Financial Tracker <StreakBadge streak={streak} /></div>
        <div className="hidden lg:flex items-center gap-1.5 text-xs font-nunito text-[#09090F]/50 bg-black/5 px-2.5 py-1.5 rounded-lg">
          <span>{petStage.emoji}</span>
          <span>{data.character.xp} XP</span>
        </div>
        <div className="lg:hidden w-8" />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">

          {/* Mobile pet card */}
          <div className="lg:hidden rounded-xl p-5 mb-4" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
            <div className="text-xs font-nunito font-black uppercase tracking-widest mb-4" style={{ color: ACCENT }}>Your Pet</div>
            <Character type="financial" xp={data.character.xp} happiness={data.character.happiness} prestige={data.character.prestige} onEvolution={s => showToast(`Evolved to ${s.name}!`, true)} onPrestige={p => showToast(`✨ Prestige ${p}! Pet reborn!`, true)} />
          </div>

          <div className="lg:hidden mb-4"><BadgeWall earned={earnedBadges} accent={ACCENT} /></div>

          {/* Metrics strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
            {[
              { label: 'Income',   value: formatRp(totalIncome),  color: INCOME_COLOR },
              { label: 'Expenses', value: formatRp(totalExpense), color: EXPENSE_COLOR },
              { label: 'Net',      value: `${net >= 0 ? '+' : ''}${formatRp(net)}`, color: net >= 0 ? INCOME_COLOR : EXPENSE_COLOR },
              { label: 'Savings',  value: `${savingsRate}%`,      color: healthColor },
            ].map(m => (
              <div key={m.label} className="rounded-xl p-3" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                <div className="font-nunito font-black text-base md:text-xl mb-0.5 truncate" style={{ color: m.color }}>{m.value}</div>
                <div className="text-[10px] font-nunito font-black uppercase tracking-widest text-[#09090F]/45">{m.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex mb-5 overflow-x-auto scrollbar-hidden gap-1.5 py-1">
            {([
              { key: 'overview',  label: '📊 Overview' },
              { key: 'log',       label: '📋 Log' },
              { key: 'analytics', label: '📈 Analytics' },
              { key: 'games',     label: '🎮 Games' },
            ] as { key: MainTab; label: string }[]).map(t => (
              <button
                key={t.key}
                onClick={() => setMainTab(t.key)}
                className="px-3 md:px-4 py-2 rounded-xl font-nunito text-sm transition whitespace-nowrap flex-shrink-0"
                style={mainTab === t.key
                  ? { background: ACCENT, color: '#FFFFFF', border: '2.5px solid #09090F', boxShadow: '3px 3px 0 #09090F', fontWeight: 800 }
                  : { color: 'rgba(9,9,15,0.45)', border: '2.5px solid transparent', fontWeight: 700 }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW ─────────────────────────────────────── */}
          {mainTab === 'overview' && (
            <div className="space-y-4">

              {/* Add transaction */}
              <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                <div className="text-xs font-nunito font-black uppercase tracking-widest mb-3" style={{ color: ACCENT }}>
                  Add Transaction
                </div>
                <div className="flex gap-2 mb-3">
                  {(['income', 'expense'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setForm(f => ({ ...f, type: t, category: t === 'income' ? INCOME_CATS[0] : EXPENSE_CATS[0] }))}
                      className="flex-1 py-2 rounded-lg font-nunito text-sm font-semibold transition"
                      style={form.type === t
                        ? { background: t === 'income' ? '#DCFCE7' : '#FEE2E2', color: t === 'income' ? INCOME_COLOR : EXPENSE_COLOR }
                        : { background: INPUT_BG, color: 'rgba(9,9,15,0.4)', border: `3px solid ${CARD_BORDER}` }}
                    >
                      {t === 'income' ? '+ Income' : '− Expense'}
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
                    className="px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                    style={{ background: INPUT_BG, border: `2.5px solid ${CARD_BORDER}` }}
                  />
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none"
                    style={{ background: INPUT_BG, border: `2.5px solid ${CARD_BORDER}` }}
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
                    className="flex-1 px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                    style={{ background: INPUT_BG, border: `2.5px solid ${CARD_BORDER}` }}
                  />
                  <button
                    onClick={handleAddTransaction}
                    disabled={!form.amount}
                    className="px-5 py-2 text-white font-nunito font-bold text-sm rounded-lg transition disabled:opacity-40 active:scale-95"
                    style={{ background: ACCENT, border: '2.5px solid #09090F', boxShadow: '3px 3px 0 #09090F' }}
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Cashflow health */}
              {data.transactions.length > 0 && (
                <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                  <div className="text-xs font-nunito font-black uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Cashflow Health</div>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="text-4xl font-nunito font-black leading-none" style={{ color: healthColor }}>{healthScore}</div>
                    <div className="flex-1">
                      <div className="font-nunito font-semibold text-sm text-[#09090F] mb-0.5">{healthLabel}</div>
                      <div className="text-xs text-[#09090F]/50 font-nunito">{savingsRate}% savings rate</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-[#09090F]/40 font-nunito mb-0.5">daily avg spend</div>
                      <div className="font-nunito font-semibold text-sm text-[#09090F]">{formatRp(dailyAvgExpense)}</div>
                    </div>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: '#E5E4E2' }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${healthScore}%`, background: healthColor }} />
                  </div>
                </div>
              )}

              {/* Recent transactions */}
              {recent3.length > 0 && (
                <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-nunito font-black uppercase tracking-widest" style={{ color: ACCENT }}>Recent</div>
                    <button onClick={() => setMainTab('log')} className="text-xs font-nunito transition hover:opacity-70" style={{ color: ACCENT }}>
                      See all →
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {recent3.map(tx => (
                      <div key={tx.id} className="flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: tx.type === 'income' ? '#DCFCE7' : '#FEE2E2', color: tx.type === 'income' ? INCOME_COLOR : EXPENSE_COLOR }}
                        >
                          {tx.type === 'income' ? '↑' : '↓'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-nunito text-sm text-[#09090F] truncate">{tx.description}</div>
                          <div className="text-xs text-[#09090F]/40 font-nunito">{tx.category} · {tx.date}</div>
                        </div>
                        <span className="font-nunito font-semibold text-sm flex-shrink-0" style={{ color: tx.type === 'income' ? INCOME_COLOR : EXPENSE_COLOR }}>
                          {tx.type === 'income' ? '+' : '−'}{formatRp(tx.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.transactions.length === 0 && (
                <div className="text-center py-12 rounded-xl" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                  <div className="text-5xl mb-3">💰</div>
                  <div className="font-nunito font-semibold text-[#09090F] mb-1">No transactions yet</div>
                  <div className="text-xs text-[#09090F]/40 font-nunito">Add your first income or expense above to start tracking</div>
                </div>
              )}
            </div>
          )}

          {/* ── LOG ──────────────────────────────────────────── */}
          {mainTab === 'log' && (
            <div className="space-y-2">
              <div className="flex gap-2 mb-4">
                {(['all', 'income', 'expense'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className="px-3 py-1.5 rounded-lg font-nunito text-xs font-semibold transition"
                    style={filter === f
                      ? { background: ACCENT, color: '#fff', border: '2.5px solid #09090F', boxShadow: '3px 3px 0 #09090F' }
                      : { background: CARD_BG, color: 'rgba(9,9,15,0.4)', border: `3px solid ${CARD_BORDER}` }}
                  >
                    {f === 'all' ? `All (${data.transactions.length})` : f === 'income' ? '+ Income' : '− Expense'}
                  </button>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-12 rounded-xl" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                  <div className="text-3xl mb-2">🗒️</div>
                  <div className="text-sm text-[#09090F]/50 font-nunito">
                    {data.transactions.length === 0 ? 'No transactions yet — add one in Overview' : 'No transactions match this filter'}
                  </div>
                </div>
              )}

              {filtered.map(tx => (
                <div key={tx.id} className="px-4 py-3 rounded-xl flex items-center gap-3" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: tx.type === 'income' ? '#DCFCE7' : '#FEE2E2', color: tx.type === 'income' ? INCOME_COLOR : EXPENSE_COLOR }}
                  >
                    {tx.type === 'income' ? '↑' : '↓'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-nunito font-semibold text-sm text-[#09090F] truncate">{tx.description}</div>
                    <div className="text-xs text-[#09090F]/50 font-nunito">{tx.category} · {tx.date}</div>
                  </div>
                  <span className="font-nunito font-bold text-sm flex-shrink-0" style={{ color: tx.type === 'income' ? INCOME_COLOR : EXPENSE_COLOR }}>
                    {tx.type === 'income' ? '+' : '−'}{formatRp(tx.amount)}
                  </span>
                  <button
                    onClick={() => handleDeleteTransaction(tx.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-[#09090F]/30 hover:text-red-500 hover:bg-red-50 transition flex-shrink-0"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── ANALYTICS ────────────────────────────────────── */}
          {mainTab === 'analytics' && (
            <div className="space-y-4">
              {data.transactions.length === 0 ? (
                <div className="text-center py-14 rounded-xl" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                  <div className="text-4xl mb-3">📈</div>
                  <div className="font-nunito font-semibold text-[#09090F] mb-1">No data yet</div>
                  <div className="text-xs text-[#09090F]/40 font-nunito">Add some transactions to unlock analytics</div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Transactions',    value: String(data.transactions.length), color: '#09090F' },
                      { label: 'Daily avg spend', value: formatRp(dailyAvgExpense),         color: EXPENSE_COLOR },
                      { label: 'Net balance',     value: `${net >= 0 ? '+' : ''}${shortRp(net)}`, color: net >= 0 ? INCOME_COLOR : EXPENSE_COLOR },
                      { label: 'Health score',    value: `${healthScore} / 100`,             color: healthColor },
                    ].map(s => (
                      <div key={s.label} className="rounded-xl p-3.5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                        <div className="font-nunito font-bold text-lg mb-0.5" style={{ color: s.color }}>{s.value}</div>
                        <div className="text-xs text-[#09090F]/50 font-nunito">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                    <div className="text-xs font-nunito font-black uppercase tracking-widest mb-4" style={{ color: ACCENT }}>
                      Income vs Expenses · Last 6 Months
                    </div>
                    <div className="flex items-end gap-2" style={{ height: BAR_MAX_H + 8 }}>
                      {monthlyData.map(m => (
                        <div key={m.label} className="flex-1 flex flex-col">
                          <div className="flex items-end gap-0.5 flex-1">
                            <div
                              title={`Income: ${formatRp(m.income)}`}
                              className="flex-1 rounded-t-sm transition-all duration-500"
                              style={{ height: m.income > 0 ? Math.max(4, (m.income / maxMonthly) * BAR_MAX_H) : 0, background: INCOME_COLOR + '80' }}
                            />
                            <div
                              title={`Expenses: ${formatRp(m.expense)}`}
                              className="flex-1 rounded-t-sm transition-all duration-500"
                              style={{ height: m.expense > 0 ? Math.max(4, (m.expense / maxMonthly) * BAR_MAX_H) : 0, background: EXPENSE_COLOR + '80' }}
                            />
                          </div>
                          <div className="text-center mt-1.5 text-[10px] text-[#09090F]/40 font-nunito">{m.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-4 mt-3 pt-3 border-t" style={{ borderColor: CARD_BORDER }}>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm" style={{ background: INCOME_COLOR + '80' }} />
                        <span className="text-xs font-nunito text-[#09090F]/60">Income</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm" style={{ background: EXPENSE_COLOR + '80' }} />
                        <span className="text-xs font-nunito text-[#09090F]/60">Expenses</span>
                      </div>
                    </div>
                  </div>

                  {topExpenses.length > 0 && (
                    <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                      <div className="text-xs font-nunito font-black uppercase tracking-widest mb-4" style={{ color: ACCENT }}>
                        Top Spending Categories
                      </div>
                      <div className="space-y-3">
                        {topExpenses.map(([cat, amt], i) => (
                          <div key={cat}>
                            <div className="flex justify-between text-xs font-nunito mb-1.5">
                              <span className="font-semibold text-[#09090F]">
                                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`} {cat}
                              </span>
                              <span className="text-[#09090F]/60">
                                {totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0}% · {formatRp(amt)}
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#E5E4E2' }}>
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${totalExpense > 0 ? (amt / totalExpense) * 100 : 0}%`, background: EXPENSE_COLOR + '99' }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {incomeSources.length > 0 && (
                    <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
                      <div className="text-xs font-nunito font-black uppercase tracking-widest mb-4" style={{ color: ACCENT }}>
                        Income Sources
                      </div>
                      <div className="space-y-3">
                        {incomeSources.map(([cat, amt]) => (
                          <div key={cat}>
                            <div className="flex justify-between text-xs font-nunito mb-1.5">
                              <span className="font-semibold text-[#09090F]">{cat}</span>
                              <span className="text-[#09090F]/60">
                                {totalIncome > 0 ? Math.round((amt / totalIncome) * 100) : 0}% · {formatRp(amt)}
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#E5E4E2' }}>
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${totalIncome > 0 ? (amt / totalIncome) * 100 : 0}%`, background: INCOME_COLOR + '99' }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── GAMES ────────────────────────────────────────── */}
          {mainTab === 'games' && (
            <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-nunito font-black uppercase tracking-widest" style={{ color: ACCENT }}>Mini Games</div>
                <span className="text-xs text-[#09090F]/50 font-nunito">XP → Financial Pet</span>
              </div>
              <div className="flex gap-1.5 mb-5 p-1 rounded-xl" style={{ background: INPUT_BG }}>
                {(['clicker', 'arcade', 'puzzle'] as GameTab[]).map(g => (
                  <button
                    key={g}
                    onClick={() => setGameTab(g)}
                    className="flex-1 py-2 rounded-lg font-nunito text-sm transition"
                    style={gameTab === g
                      ? { background: ACCENT, color: '#FFFFFF', border: '2.5px solid #09090F', boxShadow: '2px 2px 0 #09090F' }
                      : { color: 'rgba(9,9,15,0.4)' }}
                  >
                    {g === 'clicker' ? '👆 Clicker' : g === 'arcade' ? '🕹️ Arcade' : '🧩 Puzzle'}
                  </button>
                ))}
              </div>
              {gameTab === 'clicker' && <MoneyRain onXPEarned={handleXPEarned} />}
              {gameTab === 'arcade' && <BudgetDodge onXPEarned={handleXPEarned} />}
              {gameTab === 'puzzle' && <MoneyMatch onXPEarned={handleXPEarned} />}
            </div>
          )}
        </div>

        {/* RIGHT PANEL — desktop only */}
        <aside className="w-72 flex-shrink-0 hidden lg:block overflow-y-auto" style={{ borderLeft: `1px solid ${CARD_BORDER}`, background: '#F5F4F2' }}>
          <div className="p-6 space-y-4">
            <div className="rounded-xl p-5" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
              <div className="text-xs font-nunito font-black uppercase tracking-widest mb-4" style={{ color: ACCENT }}>Your Pet</div>
              <Character type="financial" xp={data.character.xp} happiness={data.character.happiness} prestige={data.character.prestige} onEvolution={s => showToast(`Evolved to ${s.name}!`, true)} onPrestige={p => showToast(`✨ Prestige ${p}! Pet reborn!`, true)} />
            </div>
            <BadgeWall earned={earnedBadges} accent={ACCENT} />
            <div className="rounded-xl p-4" style={{ background: CARD_BG, border: `3px solid ${CARD_BORDER}`, boxShadow: '4px 4px 0 #09090F' }}>
              <div className="text-xs font-nunito font-black uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Cashflow Health</div>
              <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background: '#E5E4E2' }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${healthScore}%`, background: healthColor }} />
              </div>
              <div className="flex justify-between text-xs font-nunito">
                <span className="text-[#09090F]/60">{healthLabel}</span>
                <span className="text-[#09090F]/50">{savingsRate}% savings</span>
              </div>
            </div>
            <div className="rounded-xl p-3 text-xs font-nunito leading-relaxed" style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
              <strong className="text-amber-700">Pet tip:</strong>{' '}
              <span className="text-amber-800">Healthier cashflow = faster pet growth. Keep savings above 20% for max XP!</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
