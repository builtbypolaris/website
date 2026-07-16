import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getSavingsData,
  addSavingsGoal as dbAddGoal,
  deleteSavingsGoal as dbDeleteGoal,
  addDeposit as dbAddDeposit,
  addInstallment as dbAddInstallment,
  deleteInstallment as dbDeleteInstallment,
  setInstallmentMonthPaid as dbSetMonthPaid,
  addXP, todayStr,
} from '../lib/storage'
import { awardXP, getStreak, getBadges, getWeekMissions, applyHappinessDecay, type StreakRow, type MissionRow } from '../lib/gamification'
import { useCelebrations } from '../components/CelebrationLayer'
import { StreakBadge } from '../components/StreakBadge'
import { PetRoom } from '../components/PetRoom'
import { DailyChallenges } from '../components/DailyChallenges'
import { useAuth } from '../contexts/AuthContext'
import { SAVINGS_STAGES, getStageFromXP } from '../data/creatures'
import Character from '../components/Character'
import { INK, MUTED, Panel, NButton, NProgress } from '../components/ui'
import CoinStack from '../games/CoinStack'
import VaultDash from '../games/VaultDash'
import ExactChange from '../games/ExactChange'
import type { SavingsData, Installment, SavingsGoal } from '../types'

const GOAL_EMOJIS = ['🎯', '🏠', '🚗', '📱', '✈️', '💍', '🎓', '🛵']

type GameTab = 'clicker' | 'arcade' | 'puzzle'
type MainTab = 'overview' | 'goals' | 'installments' | 'pet' | 'games'

const ACCENT = '#0D9488'
const GOOD_COLOR = '#16A34A'
const BAD_COLOR = '#DC2626'

const MAIN_TABS: { key: MainTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'goals', label: 'Goals' },
  { key: 'installments', label: 'Installments' },
  { key: 'pet', label: 'Pet' },
  { key: 'games', label: 'Games' },
]

function formatRp(n: number) { return 'Rp ' + n.toLocaleString('id-ID') }

function currentMonth() { return todayStr().slice(0, 7) }

function goalSaved(g: SavingsGoal) { return g.deposits.reduce((s, d) => s + d.amount, 0) }

function remaining(i: Installment) {
  return Math.max(0, i.totalAmount - i.payments.length * i.monthlyAmount)
}

function isPaidThisMonth(i: Installment) {
  return i.payments.some(p => p.month === currentMonth())
}

function isOverdue(i: Installment) {
  return remaining(i) > 0 && !isPaidThisMonth(i) && new Date().getDate() > i.dueDay
}

export default function Savings() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const userId = session?.user.id ?? ''

  const [data, setData] = useState<SavingsData | null>(null)
  const [mainTab, setMainTab] = useState<MainTab>('overview')
  const [gameTab, setGameTab] = useState<GameTab>('clicker')
  const [goalForm, setGoalForm] = useState({ name: '', emoji: GOAL_EMOJIS[0], target: '' })
  const [instForm, setInstForm] = useState({ item: '', total: '', monthly: '', dueDay: '10' })
  const [depositFor, setDepositFor] = useState<string | null>(null)
  const [depositForm, setDepositForm] = useState({ amount: '', note: '' })
  const [toast, setToast] = useState<{ msg: string; good: boolean } | null>(null)
  const [streak, setStreak] = useState<StreakRow | null>(null)
  const [earnedBadges, setEarnedBadges] = useState<Set<string>>(new Set())
  const [missions, setMissions] = useState<MissionRow[]>([])
  const { celebrate, layer } = useCelebrations()

  useEffect(() => {
    if (!userId) return
    getSavingsData(userId).then(setData)
    getStreak(userId, 'savings').then(setStreak)
    getBadges(userId, 'savings').then(rows => setEarnedBadges(new Set(rows.map(b => b.badgeId))))
    getWeekMissions(userId).then(setMissions)
  }, [userId])

  // Idle-day happiness decay, guarded to once per tracker per day
  useEffect(() => {
    if (!userId || !data) return
    applyHappinessDecay(userId, 'savings', data.character).then(c => {
      if (c.happiness !== data.character.happiness) setData(d => d ? { ...d, character: c } : d)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, data === null])

  const showToast = (msg: string, good = true) => {
    setToast({ msg, good })
    setTimeout(() => setToast(null), 2500)
  }

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: '#F5F4F2' }}>
        <div className="font-nunito text-sm" style={{ color: MUTED }}>Loading…</div>
      </div>
    )
  }

  // ── Core stats ────────────────────────────────────────────
  const totalSaved = data.goals.reduce((s, g) => s + goalSaved(g), 0)
  const totalDebt = data.installments.reduce((s, i) => s + remaining(i), 0)
  const monthlyCommit = data.installments.filter(i => remaining(i) > 0).reduce((s, i) => s + i.monthlyAmount, 0)
  const completedGoals = data.goals.filter(g => goalSaved(g) >= g.targetAmount).length
  const overdueCount = data.installments.filter(isOverdue).length

  const petStage = getStageFromXP(SAVINGS_STAGES, data.character.xp)

  const activeInstallments = data.installments.filter(i => remaining(i) > 0)
  const nextDue = activeInstallments
    .filter(i => !isPaidThisMonth(i))
    .sort((a, b) => a.dueDay - b.dueDay)[0]

  const applyXP = (xpGain: number, next: SavingsData, kind: 'log' | 'game' = 'log') => {
    const before = next.character
    setData({ ...next, character: addXP(before, xpGain) })
    void awardXP(userId, 'savings', before, xpGain, kind).then(r => {
      setData(d => d ? { ...d, character: r.character } : d)
      setStreak(r.streak)
      const freshBadges = r.celebrations.flatMap(c => c.type === 'badge' ? [c.badgeId] : [])
      if (freshBadges.length) setEarnedBadges(s => new Set([...s, ...freshBadges]))
      celebrate(r.celebrations)
    })
  }

  // ── Actions ───────────────────────────────────────────────
  const handleAddGoal = async () => {
    if (!goalForm.name || !goalForm.target || isNaN(Number(goalForm.target))) return
    try {
      const goal = await dbAddGoal(userId, {
        name: goalForm.name,
        emoji: goalForm.emoji,
        targetAmount: Math.abs(Number(goalForm.target)),
      })
      setData(d => d ? { ...d, goals: [...d.goals, goal] } : d)
      setGoalForm({ name: '', emoji: GOAL_EMOJIS[0], target: '' })
      showToast('Goal created!')
    } catch {
      showToast('Failed to create goal', false)
    }
  }

  const handleDeleteGoal = async (id: string) => {
    const goal = data.goals.find(g => g.id === id)
    const abandoned = !!goal && goal.deposits.length > 0 && goalSaved(goal) < goal.targetAmount
    if (abandoned) {
      applyXP(-10, { ...data, goals: data.goals.filter(g => g.id !== id) })
      showToast('−10 XP, goal abandoned before finishing', false)
    } else {
      setData(d => d ? { ...d, goals: d.goals.filter(g => g.id !== id) } : d)
    }
    await dbDeleteGoal(id)
  }

  const handleAddDeposit = async (goal: SavingsGoal) => {
    if (!depositForm.amount || isNaN(Number(depositForm.amount))) return
    const amt = Math.abs(Number(depositForm.amount))
    try {
      const { id } = await dbAddDeposit(userId, goal.id, { amount: amt, note: depositForm.note, date: todayStr() })
      const deposit = { id, amount: amt, note: depositForm.note, date: todayStr() }
      const wasComplete = goalSaved(goal) >= goal.targetAmount
      const nowComplete = goalSaved(goal) + amt >= goal.targetAmount
      const xpGain = 15 + (!wasComplete && nowComplete ? 50 : 0)

      const nextGoals = data.goals.map(g => g.id === goal.id ? { ...g, deposits: [deposit, ...g.deposits] } : g)
      applyXP(xpGain, { ...data, goals: nextGoals })
      setDepositForm({ amount: '', note: '' })
      setDepositFor(null)
      showToast(!wasComplete && nowComplete ? `Goal reached! +${xpGain} XP!` : `+${xpGain} XP!`)
    } catch {
      showToast('Failed to save deposit', false)
    }
  }

  const handleAddInstallment = async () => {
    const { item, total, monthly, dueDay } = instForm
    if (!item || !total || !monthly || isNaN(Number(total)) || isNaN(Number(monthly))) return
    const day = Math.min(31, Math.max(1, Number(dueDay) || 10))
    try {
      const inst = await dbAddInstallment(userId, {
        itemName: item,
        totalAmount: Math.abs(Number(total)),
        monthlyAmount: Math.abs(Number(monthly)),
        dueDay: day,
      })
      setData(d => d ? { ...d, installments: [...d.installments, inst] } : d)
      setInstForm({ item: '', total: '', monthly: '', dueDay: '10' })
      showToast('Installment added!')
    } catch {
      showToast('Failed to add installment', false)
    }
  }

  const handleDeleteInstallment = async (id: string) => {
    setData(d => d ? { ...d, installments: d.installments.filter(i => i.id !== id) } : d)
    await dbDeleteInstallment(id)
  }

  const handleToggleMonth = async (inst: Installment) => {
    const month = currentMonth()
    const paid = isPaidThisMonth(inst)
    try {
      await dbSetMonthPaid(inst.id, userId, month, !paid, todayStr())
      if (!paid) {
        const daysLate = new Date().getDate() - inst.dueDay
        const xpGain = daysLate <= 0 ? 25 : daysLate > 7 ? -5 : 10
        const nextInsts = data.installments.map(i =>
          i.id === inst.id ? { ...i, payments: [{ month, paidAt: todayStr() }, ...i.payments] } : i)
        applyXP(xpGain, { ...data, installments: nextInsts })
        showToast(
          daysLate <= 0 ? `Paid on time! +${xpGain} XP!`
          : daysLate > 7 ? `${xpGain} XP. Over a week late, pay by day ${inst.dueDay} for +25!`
          : `Paid! +${xpGain} XP`,
          xpGain > 0,
        )
      } else {
        const nextInsts = data.installments.map(i =>
          i.id === inst.id ? { ...i, payments: i.payments.filter(p => p.month !== month) } : i)
        applyXP(-25, { ...data, installments: nextInsts })
        showToast('−25 XP, payment unmarked', false)
      }
    } catch {
      showToast('Failed to update payment', false)
    }
  }

  const handleXPEarned = (xp: number) => {
    applyXP(xp, data, 'game')
    showToast(`+${xp} XP from game!`)
  }

  const handleClaimChallenge = (xp: number, title: string) => {
    applyXP(xp, data)
    showToast(`${title}: +${xp} XP!`)
  }

  const petCard = (
    <Character
      type="savings"
      xp={data.character.xp}
      happiness={data.character.happiness}
      prestige={data.character.prestige}
      onEvolution={s => showToast(`Evolved to ${s.name}!`, true)}
      onPrestige={p => showToast(`Prestige ${p}! Pet reborn!`, true)}
    />
  )

  const depositsToday = data.goals.flatMap(g => g.deposits).filter(d => d.date === todayStr())
  const dailyChallenges = [
    { id: 'dep1', title: 'Make a deposit', emoji: '💰', xp: 15, met: depositsToday.length >= 1 },
    { id: 'dep2', title: 'Make 2 deposits', emoji: '🏦', xp: 25, met: depositsToday.length >= 2 },
    { id: 'pay', title: 'Pay an installment', emoji: '📅', xp: 20, met: data.installments.some(i => i.payments.some(p => p.paidAt === todayStr())) },
  ]

  return (
    <div className="h-full flex flex-col" style={{ background: '#F5F4F2' }}>
      {layer}

      {toast && (
        <div className="fixed top-[72px] right-4 z-50 px-4 py-2.5 rounded-2xl font-nunito font-semibold text-white text-sm bounce-in" style={{ background: toast.good ? '#16A34A' : '#DC2626' }}>
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
          Savings & Installments <StreakBadge streak={streak} />
        </div>
        <div className="hidden lg:flex items-center gap-1.5 font-nunito text-xs" style={{ color: MUTED }}>
          <span>{petStage.emoji}</span>
          <span>{data.character.xp} XP</span>
        </div>
        <div className="lg:hidden w-10" />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">

          {/* Mobile pet, plain */}
          <div className="lg:hidden mb-5">{petCard}</div>

          {/* Metrics */}
          <div className="flex flex-wrap gap-x-8 gap-y-3 mb-6">
            {[
              { label: 'Total saved', value: formatRp(totalSaved), color: GOOD_COLOR },
              { label: 'Goals done', value: `${completedGoals}/${data.goals.length}`, color: ACCENT },
              { label: 'Monthly payments', value: formatRp(monthlyCommit), color: INK },
              { label: 'Remaining debt', value: formatRp(totalDebt), color: totalDebt > 0 ? BAD_COLOR : GOOD_COLOR },
            ].map(m => (
              <div key={m.label}>
                <div className="font-nunito font-bold text-lg md:text-xl leading-none" style={{ color: m.color }}>{m.value}</div>
                <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
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

              {nextDue && (
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-nunito font-medium text-sm truncate" style={{ color: isOverdue(nextDue) ? BAD_COLOR : INK }}>
                      {nextDue.itemName}: {formatRp(nextDue.monthlyAmount)}
                    </div>
                    <div className="font-nunito text-xs" style={{ color: MUTED }}>
                      {isOverdue(nextDue) ? `Overdue, was due on day ${nextDue.dueDay} this month` : `Due on day ${nextDue.dueDay} this month`}
                    </div>
                  </div>
                  <NButton onClick={() => handleToggleMonth(nextDue)} accent={ACCENT} size="sm">Mark paid</NButton>
                </div>
              )}

              {data.goals.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-nunito font-semibold text-sm" style={{ color: INK }}>Goal progress</div>
                    <button onClick={() => setMainTab('goals')} className="font-nunito text-xs transition-opacity hover:opacity-70" style={{ color: ACCENT }}>
                      See all
                    </button>
                  </div>
                  <div className="space-y-3">
                    {data.goals.slice(0, 3).map(g => {
                      const saved = goalSaved(g)
                      const pct = Math.min(100, (saved / g.targetAmount) * 100)
                      return (
                        <div key={g.id}>
                          <div className="flex justify-between font-nunito text-xs mb-1.5">
                            <span style={{ color: INK }}>{g.emoji} {g.name}</span>
                            <span style={{ color: MUTED }}>{Math.round(pct)}% · {formatRp(saved)} / {formatRp(g.targetAmount)}</span>
                          </div>
                          <NProgress pct={pct} accent={pct >= 100 ? GOOD_COLOR : ACCENT} height={4} />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {overdueCount > 0 && (
                <div className="font-nunito text-sm" style={{ color: BAD_COLOR }}>
                  {overdueCount} installment{overdueCount === 1 ? ' is' : 's are'} overdue this month. Pay on time to earn +25 XP instead of +10.
                </div>
              )}

              {data.goals.length === 0 && data.installments.length === 0 && (
                <div className="py-10 text-center">
                  <div className="font-nunito text-sm" style={{ color: INK }}>Nothing here yet</div>
                  <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>Create a savings goal or add an installment to get started</div>
                </div>
              )}
            </div>
          )}

          {/* ── GOALS ────────────────────────────────────────── */}
          {mainTab === 'goals' && (
            <div className="max-w-xl">

              <Panel tone="tint" accent={ACCENT} className="p-4 mb-5">
                <div className="flex gap-1.5 mb-2 flex-wrap">
                  {GOAL_EMOJIS.map(e => (
                    <button
                      key={e}
                      onClick={() => setGoalForm(f => ({ ...f, emoji: e }))}
                      className="w-9 h-9 rounded-full text-lg transition-colors"
                      style={{ background: goalForm.emoji === e ? `${ACCENT}30` : 'transparent' }}
                    >
                      {e}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Goal name"
                    value={goalForm.name}
                    onChange={e => setGoalForm(f => ({ ...f, name: e.target.value }))}
                    className="px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                    style={{ background: '#FFFFFF', color: INK }}
                  />
                  <input
                    type="number"
                    placeholder="Target (Rp)"
                    value={goalForm.target}
                    onChange={e => setGoalForm(f => ({ ...f, target: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleAddGoal()}
                    className="px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                    style={{ background: '#FFFFFF', color: INK }}
                  />
                </div>
                <NButton onClick={handleAddGoal} disabled={!goalForm.name || !goalForm.target} accent={ACCENT} className="w-full">
                  Create goal
                </NButton>
              </Panel>

              {data.goals.map((g, i) => {
                const saved = goalSaved(g)
                const pct = Math.min(100, (saved / g.targetAmount) * 100)
                const complete = saved >= g.targetAmount
                return (
                  <div key={g.id} className="py-4" style={{ borderTop: i === 0 ? 'none' : `1px solid ${INK}0D` }}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-xl flex-shrink-0">{g.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-nunito font-medium text-sm truncate" style={{ color: INK }}>
                          {g.name} {complete && <span style={{ color: GOOD_COLOR }}>· Done</span>}
                        </div>
                        <div className="font-nunito text-xs" style={{ color: MUTED }}>{formatRp(saved)} of {formatRp(g.targetAmount)}</div>
                      </div>
                      <button
                        onClick={() => { setDepositFor(depositFor === g.id ? null : g.id); setDepositForm({ amount: '', note: '' }) }}
                        className="font-nunito text-xs flex-shrink-0"
                        style={{ color: ACCENT }}
                      >
                        Deposit
                      </button>
                      <button onClick={() => handleDeleteGoal(g.id)} className="text-sm flex-shrink-0 transition-opacity hover:opacity-70" style={{ color: MUTED }}>✕</button>
                    </div>

                    <NProgress pct={pct} accent={complete ? GOOD_COLOR : ACCENT} height={4} />

                    {depositFor === g.id && (
                      <div className="flex gap-2 mt-3">
                        <input
                          type="number"
                          placeholder="Amount (Rp)"
                          value={depositForm.amount}
                          autoFocus
                          onChange={e => setDepositForm(f => ({ ...f, amount: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && handleAddDeposit(g)}
                          className="flex-1 px-3 py-2 rounded-xl font-nunito text-sm outline-none"
                          style={{ background: '#F0EEE8', color: INK }}
                        />
                        <input
                          type="text"
                          placeholder="Note"
                          value={depositForm.note}
                          onChange={e => setDepositForm(f => ({ ...f, note: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && handleAddDeposit(g)}
                          className="flex-1 px-3 py-2 rounded-xl font-nunito text-sm outline-none"
                          style={{ background: '#F0EEE8', color: INK }}
                        />
                        <NButton onClick={() => handleAddDeposit(g)} disabled={!depositForm.amount} accent={ACCENT} size="sm">Save</NButton>
                      </div>
                    )}

                    {g.deposits.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {g.deposits.slice(0, 3).map(d => (
                          <div key={d.id} className="flex justify-between font-nunito text-xs">
                            <span style={{ color: MUTED }}>{d.date}{d.note ? ` · ${d.note}` : ''}</span>
                            <span style={{ color: GOOD_COLOR }}>+{formatRp(d.amount)}</span>
                          </div>
                        ))}
                        {g.deposits.length > 3 && (
                          <div className="font-nunito text-xs" style={{ color: `${INK}55` }}>+{g.deposits.length - 3} more deposits</div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}

              {data.goals.length === 0 && (
                <div className="py-10 text-center">
                  <div className="font-nunito text-sm" style={{ color: INK }}>No goals yet</div>
                  <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>Create your first savings goal above. Every deposit feeds your pet.</div>
                </div>
              )}
            </div>
          )}

          {/* ── INSTALLMENTS ─────────────────────────────────── */}
          {mainTab === 'installments' && (
            <div className="max-w-xl">

              <Panel tone="tint" accent={ACCENT} className="p-4 mb-5">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Item (e.g. Motor, HP)"
                    value={instForm.item}
                    onChange={e => setInstForm(f => ({ ...f, item: e.target.value }))}
                    className="px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                    style={{ background: '#FFFFFF', color: INK }}
                  />
                  <input
                    type="number"
                    placeholder="Total price (Rp)"
                    value={instForm.total}
                    onChange={e => setInstForm(f => ({ ...f, total: e.target.value }))}
                    className="px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                    style={{ background: '#FFFFFF', color: INK }}
                  />
                  <input
                    type="number"
                    placeholder="Monthly (Rp)"
                    value={instForm.monthly}
                    onChange={e => setInstForm(f => ({ ...f, monthly: e.target.value }))}
                    className="px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                    style={{ background: '#FFFFFF', color: INK }}
                  />
                  <input
                    type="number"
                    placeholder="Due day (1-31)"
                    min={1}
                    max={31}
                    value={instForm.dueDay}
                    onChange={e => setInstForm(f => ({ ...f, dueDay: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleAddInstallment()}
                    className="px-3 py-2.5 rounded-xl font-nunito text-sm outline-none"
                    style={{ background: '#FFFFFF', color: INK }}
                  />
                </div>
                <NButton onClick={handleAddInstallment} disabled={!instForm.item || !instForm.total || !instForm.monthly} accent={ACCENT} className="w-full">
                  Add installment
                </NButton>
              </Panel>

              {data.installments.map((inst, i) => {
                const rem = remaining(inst)
                const paidMonths = inst.payments.length
                const totalMonths = Math.ceil(inst.totalAmount / inst.monthlyAmount)
                const paidThisMonth = isPaidThisMonth(inst)
                const overdue = isOverdue(inst)
                const lunas = rem <= 0
                return (
                  <div key={inst.id} className="py-4" style={{ borderTop: i === 0 ? 'none' : `1px solid ${INK}0D` }}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-nunito font-medium text-sm truncate" style={{ color: overdue ? BAD_COLOR : INK }}>
                          {inst.itemName}
                          {lunas && <span className="ml-2" style={{ color: GOOD_COLOR }}>· Paid off</span>}
                          {overdue && <span className="ml-2">· Overdue</span>}
                        </div>
                        <div className="font-nunito text-xs" style={{ color: MUTED }}>
                          {formatRp(inst.monthlyAmount)}/month · due day {inst.dueDay} · {paidMonths}/{totalMonths} paid
                        </div>
                      </div>
                      {!lunas && (
                        <button onClick={() => handleToggleMonth(inst)} className="font-nunito text-xs flex-shrink-0" style={{ color: paidThisMonth ? GOOD_COLOR : ACCENT }}>
                          {paidThisMonth ? 'Paid this month' : 'Mark paid'}
                        </button>
                      )}
                      <button onClick={() => handleDeleteInstallment(inst.id)} className="text-sm flex-shrink-0 transition-opacity hover:opacity-70" style={{ color: MUTED }}>✕</button>
                    </div>

                    <NProgress pct={Math.min(100, (paidMonths / totalMonths) * 100)} accent={lunas ? GOOD_COLOR : ACCENT} height={4} />
                    <div className="flex justify-between font-nunito text-xs mt-1" style={{ color: MUTED }}>
                      <span>Remaining {formatRp(rem)}</span>
                      <span>{Math.round((paidMonths / totalMonths) * 100)}%</span>
                    </div>
                  </div>
                )
              })}

              {data.installments.length === 0 && (
                <div className="py-10 text-center">
                  <div className="font-nunito text-sm" style={{ color: INK }}>No installments yet</div>
                  <div className="font-nunito text-xs mt-1" style={{ color: MUTED }}>Add an installment plan above. Paying on time earns bonus XP.</div>
                </div>
              )}
            </div>
          )}

          {/* ── PET ──────────────────────────────────────────── */}
          {mainTab === 'pet' && (
            <div className="space-y-4 max-w-2xl">
              <DailyChallenges trackerId="savings" accent={ACCENT} challenges={dailyChallenges} onClaim={handleClaimChallenge} />
              <PetRoom
                userId={userId}
                trackerId="savings"
                character={data.character}
                streak={streak}
                earnedBadges={earnedBadges}
                missions={missions}
                onCharacter={c => setData(d => d ? { ...d, character: c } : d)}
              />
            </div>
          )}

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
              {gameTab === 'clicker' && <CoinStack onXPEarned={handleXPEarned} />}
              {gameTab === 'arcade' && <VaultDash onXPEarned={handleXPEarned} />}
              {gameTab === 'puzzle' && <ExactChange onXPEarned={handleXPEarned} />}
            </div>
          )}
        </div>

        {/* RIGHT PANEL, desktop only */}
        <aside className="w-72 flex-shrink-0 hidden lg:block overflow-y-auto" style={{ borderLeft: `1px solid ${INK}0D`, background: '#F5F4F2' }}>
          <Panel tone="tint" accent={ACCENT} className="m-6 p-5">
            {petCard}
            {nextDue && (
              <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${INK}0D` }}>
                <div className="font-nunito font-semibold text-sm mb-1" style={{ color: INK }}>Next due</div>
                <div className="font-nunito text-sm" style={{ color: INK }}>{nextDue.itemName}</div>
                <div className="font-nunito text-xs" style={{ color: MUTED }}>{formatRp(nextDue.monthlyAmount)} · day {nextDue.dueDay}</div>
              </div>
            )}
            <div className="font-nunito text-xs leading-relaxed mt-4 pt-4" style={{ color: MUTED, borderTop: `1px solid ${INK}0D` }}>
              Deposits earn +15 XP, on-time installments +25 XP, and finishing a goal +50 XP.
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  )
}
