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
  saveSavingsCharacter as dbSaveCharacter,
  addXP, todayStr,
} from '../lib/storage'
import { useAuth } from '../contexts/AuthContext'
import { SAVINGS_STAGES, getStageFromXP } from '../data/creatures'
import Character from '../components/Character'
import CoinStack from '../games/CoinStack'
import VaultDash from '../games/VaultDash'
import ExactChange from '../games/ExactChange'
import type { SavingsData, Installment, SavingsGoal } from '../types'

const GOAL_EMOJIS = ['🎯', '🏠', '🚗', '📱', '✈️', '💍', '🎓', '🛵']

type GameTab = 'clicker' | 'arcade' | 'puzzle'
type MainTab = 'overview' | 'goals' | 'cicilan' | 'games'

const ACCENT = '#0D9488'
const CARD_BG = '#FFFFFF'
const CARD_BORDER = '#E5E4E2'
const INPUT_BG = '#F0EEE8'
const GOOD_COLOR = '#16A34A'
const BAD_COLOR = '#DC2626'

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

  useEffect(() => {
    if (!userId) return
    getSavingsData(userId).then(setData)
  }, [userId])

  const showToast = (msg: string, good = true) => {
    setToast({ msg, good })
    setTimeout(() => setToast(null), 2500)
  }

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: '#F5F4F2' }}>
        <div className="font-nunito text-[#09090F]/40 text-sm">Loading…</div>
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

  const applyXP = (xpGain: number, next: SavingsData) => {
    const newCharacter = addXP(next.character, xpGain)
    setData({ ...next, character: newCharacter })
    dbSaveCharacter(userId, newCharacter)
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
    setData(d => d ? { ...d, goals: d.goals.filter(g => g.id !== id) } : d)
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
      showToast(!wasComplete && nowComplete ? `🎉 Goal reached! +${xpGain} XP!` : `+${xpGain} XP!`)
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
      showToast('Cicilan added!')
    } catch {
      showToast('Failed to add cicilan', false)
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
        const onTime = new Date().getDate() <= inst.dueDay
        const xpGain = onTime ? 25 : 10
        const nextInsts = data.installments.map(i =>
          i.id === inst.id ? { ...i, payments: [{ month, paidAt: todayStr() }, ...i.payments] } : i)
        applyXP(xpGain, { ...data, installments: nextInsts })
        showToast(onTime ? `Paid on time! +${xpGain} XP!` : `Paid! +${xpGain} XP`)
      } else {
        const nextInsts = data.installments.map(i =>
          i.id === inst.id ? { ...i, payments: i.payments.filter(p => p.month !== month) } : i)
        setData(d => d ? { ...d, installments: nextInsts } : d)
      }
    } catch {
      showToast('Failed to update payment', false)
    }
  }

  const handleXPEarned = (xp: number) => {
    const newCharacter = addXP(data.character, xp)
    setData(d => d ? { ...d, character: newCharacter } : d)
    dbSaveCharacter(userId, newCharacter)
    showToast(`+${xp} XP from game!`)
  }

  const petCard = (
    <Character
      type="savings"
      xp={data.character.xp}
      happiness={data.character.happiness}
      prestige={data.character.prestige}
      onEvolution={s => showToast(`Evolved to ${s.name}!`, true)}
      onPrestige={p => showToast(`✨ Prestige ${p}! Pet reborn!`, true)}
    />
  )

  return (
    <div className="h-full flex flex-col" style={{ background: '#F5F4F2' }}>

      {toast && (
        <div
          className="fixed top-[72px] right-4 z-50 px-4 py-2.5 rounded-xl shadow-lg font-nunito text-white text-sm bounce-in"
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
        <button
          onClick={() => navigate('/studios/dashboard')}
          className="w-8 h-8 flex items-center justify-center rounded-lg font-nunito text-[#09090F]/50 hover:text-[#09090F] hover:bg-black/5 transition"
        >
          ←
        </button>
        <div className="font-nunito font-bold text-[#09090F] text-sm md:text-base">🐖 Nabung & Cicilan</div>
        <div className="hidden lg:flex items-center gap-1.5 text-xs font-nunito text-[#09090F]/50 bg-black/5 px-2.5 py-1.5 rounded-lg">
          <span>{petStage.emoji}</span>
          <span>{data.character.xp} XP</span>
        </div>
        <div className="lg:hidden w-8" />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">

          {/* Mobile pet card */}
          <div className="lg:hidden rounded-xl p-5 mb-4" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
            <div className="text-xs font-nunito font-bold uppercase tracking-widest mb-4" style={{ color: ACCENT }}>Your Pet</div>
            {petCard}
          </div>

          {/* Metrics strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
            {[
              { label: 'Total saved', value: formatRp(totalSaved), color: GOOD_COLOR },
              { label: 'Goals done', value: `${completedGoals}/${data.goals.length}`, color: ACCENT },
              { label: 'Monthly cicilan', value: formatRp(monthlyCommit), color: '#09090F' },
              { label: 'Remaining debt', value: formatRp(totalDebt), color: totalDebt > 0 ? BAD_COLOR : GOOD_COLOR },
            ].map(m => (
              <div key={m.label} className="rounded-xl p-3" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                <div className="font-nunito font-bold text-sm md:text-base mb-0.5 truncate" style={{ color: m.color }}>{m.value}</div>
                <div className="text-xs text-[#09090F]/50 font-nunito">{m.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex mb-5 overflow-x-auto scrollbar-hidden" style={{ borderBottom: '1px solid #E5E4E2' }}>
            {([
              { key: 'overview', label: '📊 Overview' },
              { key: 'goals',    label: '🎯 Goals' },
              { key: 'cicilan',  label: '📅 Cicilan' },
              { key: 'games',    label: '🎮 Games' },
            ] as { key: MainTab; label: string }[]).map(t => (
              <button
                key={t.key}
                onClick={() => setMainTab(t.key)}
                className="px-3 md:px-4 py-2.5 font-nunito text-sm transition border-b-2 -mb-px whitespace-nowrap flex-shrink-0"
                style={{
                  borderBottomColor: mainTab === t.key ? ACCENT : 'transparent',
                  color: mainTab === t.key ? '#09090F' : 'rgba(9,9,15,0.4)',
                  fontWeight: mainTab === t.key ? 600 : 400,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW ─────────────────────────────────────── */}
          {mainTab === 'overview' && (
            <div className="space-y-4">

              {nextDue && (
                <div
                  className="rounded-xl p-4 md:p-5 flex items-center gap-3"
                  style={{
                    background: isOverdue(nextDue) ? '#FEE2E2' : CARD_BG,
                    border: `1px solid ${isOverdue(nextDue) ? '#FCA5A5' : CARD_BORDER}`,
                  }}
                >
                  <div className="text-2xl">{isOverdue(nextDue) ? '⚠️' : '📅'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-nunito font-semibold text-sm text-[#09090F] truncate">
                      {nextDue.itemName} — {formatRp(nextDue.monthlyAmount)}
                    </div>
                    <div className="text-xs text-[#09090F]/50 font-nunito">
                      {isOverdue(nextDue)
                        ? `Overdue! Was due on day ${nextDue.dueDay} this month`
                        : `Due on day ${nextDue.dueDay} this month`}
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleMonth(nextDue)}
                    className="px-4 py-2 text-white font-nunito font-bold text-xs rounded-lg transition active:scale-95 flex-shrink-0"
                    style={{ background: ACCENT }}
                  >
                    Mark paid
                  </button>
                </div>
              )}

              {data.goals.length > 0 && (
                <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-nunito font-bold uppercase tracking-widest" style={{ color: ACCENT }}>Goal Progress</div>
                    <button onClick={() => setMainTab('goals')} className="text-xs font-nunito transition hover:opacity-70" style={{ color: ACCENT }}>
                      See all →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {data.goals.slice(0, 3).map(g => {
                      const saved = goalSaved(g)
                      const pct = Math.min(100, (saved / g.targetAmount) * 100)
                      return (
                        <div key={g.id}>
                          <div className="flex justify-between text-xs font-nunito mb-1.5">
                            <span className="font-semibold text-[#09090F]">{g.emoji} {g.name}</span>
                            <span className="text-[#09090F]/60">{Math.round(pct)}% · {formatRp(saved)} / {formatRp(g.targetAmount)}</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#E5E4E2' }}>
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: pct >= 100 ? GOOD_COLOR : ACCENT }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {overdueCount > 0 && (
                <div className="rounded-xl p-3 text-xs font-nunito leading-relaxed" style={{ background: '#FEE2E2', border: '1px solid #FCA5A5' }}>
                  <strong className="text-red-700">Heads up:</strong>{' '}
                  <span className="text-red-800">{overdueCount} cicilan {overdueCount === 1 ? 'is' : 'are'} overdue this month. Pay on time to earn +25 XP instead of +10!</span>
                </div>
              )}

              {data.goals.length === 0 && data.installments.length === 0 && (
                <div className="text-center py-12 rounded-xl" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                  <div className="text-5xl mb-3">🐖</div>
                  <div className="font-nunito font-semibold text-[#09090F] mb-1">Nothing here yet</div>
                  <div className="text-xs text-[#09090F]/40 font-nunito">Create a savings goal or add a cicilan to get started</div>
                </div>
              )}
            </div>
          )}

          {/* ── GOALS ────────────────────────────────────────── */}
          {mainTab === 'goals' && (
            <div className="space-y-4">

              {/* Add goal */}
              <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                <div className="text-xs font-nunito font-bold uppercase tracking-widest mb-3" style={{ color: ACCENT }}>New Savings Goal</div>
                <div className="flex gap-1.5 mb-2 flex-wrap">
                  {GOAL_EMOJIS.map(e => (
                    <button
                      key={e}
                      onClick={() => setGoalForm(f => ({ ...f, emoji: e }))}
                      className="w-9 h-9 rounded-lg text-lg transition"
                      style={goalForm.emoji === e
                        ? { background: ACCENT + '20', border: `1px solid ${ACCENT}` }
                        : { background: INPUT_BG, border: `1px solid ${CARD_BORDER}` }}
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
                    className="px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                    style={{ background: INPUT_BG, border: `1px solid ${CARD_BORDER}` }}
                  />
                  <input
                    type="number"
                    placeholder="Target (Rp)"
                    value={goalForm.target}
                    onChange={e => setGoalForm(f => ({ ...f, target: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleAddGoal()}
                    className="px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                    style={{ background: INPUT_BG, border: `1px solid ${CARD_BORDER}` }}
                  />
                </div>
                <button
                  onClick={handleAddGoal}
                  disabled={!goalForm.name || !goalForm.target}
                  className="w-full py-2.5 text-white font-nunito font-bold text-sm rounded-lg transition disabled:opacity-40 active:scale-95"
                  style={{ background: ACCENT }}
                >
                  Create Goal
                </button>
              </div>

              {data.goals.map(g => {
                const saved = goalSaved(g)
                const pct = Math.min(100, (saved / g.targetAmount) * 100)
                const complete = saved >= g.targetAmount
                return (
                  <div key={g.id} className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `1px solid ${complete ? GOOD_COLOR + '60' : CARD_BORDER}` }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-2xl">{g.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-nunito font-bold text-sm text-[#09090F] truncate">
                          {g.name} {complete && <span style={{ color: GOOD_COLOR }}>✓ Done!</span>}
                        </div>
                        <div className="text-xs text-[#09090F]/50 font-nunito">{formatRp(saved)} of {formatRp(g.targetAmount)}</div>
                      </div>
                      <button
                        onClick={() => { setDepositFor(depositFor === g.id ? null : g.id); setDepositForm({ amount: '', note: '' }) }}
                        className="px-3 py-1.5 font-nunito font-bold text-xs rounded-lg transition active:scale-95"
                        style={{ background: ACCENT + '15', color: ACCENT, border: `1px solid ${ACCENT}40` }}
                      >
                        + Deposit
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(g.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-[#09090F]/30 hover:text-red-500 hover:bg-red-50 transition flex-shrink-0"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="h-2 rounded-full overflow-hidden mb-1" style={{ background: '#E5E4E2' }}>
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: complete ? GOOD_COLOR : ACCENT }} />
                    </div>
                    <div className="text-xs text-[#09090F]/40 font-nunito text-right">{Math.round(pct)}%</div>

                    {depositFor === g.id && (
                      <div className="flex gap-2 mt-3">
                        <input
                          type="number"
                          placeholder="Amount (Rp)"
                          value={depositForm.amount}
                          autoFocus
                          onChange={e => setDepositForm(f => ({ ...f, amount: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && handleAddDeposit(g)}
                          className="flex-1 px-3 py-2 rounded-lg font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                          style={{ background: INPUT_BG, border: `1px solid ${CARD_BORDER}` }}
                        />
                        <input
                          type="text"
                          placeholder="Note"
                          value={depositForm.note}
                          onChange={e => setDepositForm(f => ({ ...f, note: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && handleAddDeposit(g)}
                          className="flex-1 px-3 py-2 rounded-lg font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                          style={{ background: INPUT_BG, border: `1px solid ${CARD_BORDER}` }}
                        />
                        <button
                          onClick={() => handleAddDeposit(g)}
                          disabled={!depositForm.amount}
                          className="px-4 py-2 text-white font-nunito font-bold text-sm rounded-lg transition disabled:opacity-40 active:scale-95"
                          style={{ background: ACCENT }}
                        >
                          Save
                        </button>
                      </div>
                    )}

                    {g.deposits.length > 0 && (
                      <div className="mt-3 pt-3 border-t space-y-1.5" style={{ borderColor: CARD_BORDER }}>
                        {g.deposits.slice(0, 3).map(d => (
                          <div key={d.id} className="flex justify-between text-xs font-nunito">
                            <span className="text-[#09090F]/50">{d.date}{d.note ? ` · ${d.note}` : ''}</span>
                            <span className="font-semibold" style={{ color: GOOD_COLOR }}>+{formatRp(d.amount)}</span>
                          </div>
                        ))}
                        {g.deposits.length > 3 && (
                          <div className="text-xs text-[#09090F]/30 font-nunito">+{g.deposits.length - 3} more deposits</div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}

              {data.goals.length === 0 && (
                <div className="text-center py-12 rounded-xl" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                  <div className="text-5xl mb-3">🎯</div>
                  <div className="font-nunito font-semibold text-[#09090F] mb-1">No goals yet</div>
                  <div className="text-xs text-[#09090F]/40 font-nunito">Create your first savings goal above — every deposit feeds your pet!</div>
                </div>
              )}
            </div>
          )}

          {/* ── CICILAN ──────────────────────────────────────── */}
          {mainTab === 'cicilan' && (
            <div className="space-y-4">

              {/* Add installment */}
              <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                <div className="text-xs font-nunito font-bold uppercase tracking-widest mb-3" style={{ color: ACCENT }}>New Cicilan</div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Item (e.g. Motor, HP)"
                    value={instForm.item}
                    onChange={e => setInstForm(f => ({ ...f, item: e.target.value }))}
                    className="px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                    style={{ background: INPUT_BG, border: `1px solid ${CARD_BORDER}` }}
                  />
                  <input
                    type="number"
                    placeholder="Total price (Rp)"
                    value={instForm.total}
                    onChange={e => setInstForm(f => ({ ...f, total: e.target.value }))}
                    className="px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                    style={{ background: INPUT_BG, border: `1px solid ${CARD_BORDER}` }}
                  />
                  <input
                    type="number"
                    placeholder="Monthly (Rp)"
                    value={instForm.monthly}
                    onChange={e => setInstForm(f => ({ ...f, monthly: e.target.value }))}
                    className="px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                    style={{ background: INPUT_BG, border: `1px solid ${CARD_BORDER}` }}
                  />
                  <input
                    type="number"
                    placeholder="Due day (1-31)"
                    min={1}
                    max={31}
                    value={instForm.dueDay}
                    onChange={e => setInstForm(f => ({ ...f, dueDay: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleAddInstallment()}
                    className="px-3 py-2.5 rounded-lg font-nunito text-sm text-[#09090F] outline-none placeholder-[#09090F]/30"
                    style={{ background: INPUT_BG, border: `1px solid ${CARD_BORDER}` }}
                  />
                </div>
                <button
                  onClick={handleAddInstallment}
                  disabled={!instForm.item || !instForm.total || !instForm.monthly}
                  className="w-full py-2.5 text-white font-nunito font-bold text-sm rounded-lg transition disabled:opacity-40 active:scale-95"
                  style={{ background: ACCENT }}
                >
                  Add Cicilan
                </button>
              </div>

              {data.installments.map(inst => {
                const rem = remaining(inst)
                const paidMonths = inst.payments.length
                const totalMonths = Math.ceil(inst.totalAmount / inst.monthlyAmount)
                const paidThisMonth = isPaidThisMonth(inst)
                const overdue = isOverdue(inst)
                const lunas = rem <= 0
                return (
                  <div
                    key={inst.id}
                    className="rounded-xl p-4 md:p-5"
                    style={{
                      background: CARD_BG,
                      border: `1px solid ${lunas ? GOOD_COLOR + '60' : overdue ? '#FCA5A5' : CARD_BORDER}`,
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-nunito font-bold text-sm text-[#09090F] truncate">
                          {inst.itemName}
                          {lunas && <span className="ml-2" style={{ color: GOOD_COLOR }}>✓ Lunas!</span>}
                          {overdue && <span className="ml-2 text-xs font-nunito font-bold px-2 py-0.5 rounded-full" style={{ background: '#FEE2E2', color: BAD_COLOR }}>Overdue</span>}
                        </div>
                        <div className="text-xs text-[#09090F]/50 font-nunito">
                          {formatRp(inst.monthlyAmount)}/month · due day {inst.dueDay} · {paidMonths}/{totalMonths} paid
                        </div>
                      </div>
                      {!lunas && (
                        <button
                          onClick={() => handleToggleMonth(inst)}
                          className="px-3 py-2 font-nunito font-bold text-xs rounded-lg transition active:scale-95 flex-shrink-0"
                          style={paidThisMonth
                            ? { background: '#DCFCE7', color: GOOD_COLOR, border: `1px solid ${GOOD_COLOR}40` }
                            : { background: ACCENT, color: '#fff' }}
                        >
                          {paidThisMonth ? '✓ Paid this month' : 'Mark paid'}
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteInstallment(inst.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-[#09090F]/30 hover:text-red-500 hover:bg-red-50 transition flex-shrink-0"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="h-2 rounded-full overflow-hidden mb-1" style={{ background: '#E5E4E2' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, (paidMonths / totalMonths) * 100)}%`, background: lunas ? GOOD_COLOR : ACCENT }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-[#09090F]/40 font-nunito">
                      <span>Remaining: {formatRp(rem)}</span>
                      <span>{Math.round((paidMonths / totalMonths) * 100)}%</span>
                    </div>
                  </div>
                )
              })}

              {data.installments.length === 0 && (
                <div className="text-center py-12 rounded-xl" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                  <div className="text-5xl mb-3">📅</div>
                  <div className="font-nunito font-semibold text-[#09090F] mb-1">No cicilan yet</div>
                  <div className="text-xs text-[#09090F]/40 font-nunito">Add an installment plan above — paying on time earns bonus XP!</div>
                </div>
              )}
            </div>
          )}

          {/* ── GAMES ────────────────────────────────────────── */}
          {mainTab === 'games' && (
            <div className="rounded-xl p-4 md:p-5" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-nunito font-bold uppercase tracking-widest" style={{ color: ACCENT }}>Mini Games</div>
                <span className="text-xs text-[#09090F]/50 font-nunito">XP → Savings Pet</span>
              </div>
              <div className="flex gap-1.5 mb-5 p-1 rounded-xl" style={{ background: INPUT_BG }}>
                {(['clicker', 'arcade', 'puzzle'] as GameTab[]).map(g => (
                  <button
                    key={g}
                    onClick={() => setGameTab(g)}
                    className="flex-1 py-2 rounded-lg font-nunito text-sm transition"
                    style={gameTab === g
                      ? { background: CARD_BG, color: '#09090F', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
                      : { color: 'rgba(9,9,15,0.4)' }}
                  >
                    {g === 'clicker' ? '👆 Clicker' : g === 'arcade' ? '🕹️ Arcade' : '🧩 Puzzle'}
                  </button>
                ))}
              </div>
              {gameTab === 'clicker' && <CoinStack onXPEarned={handleXPEarned} />}
              {gameTab === 'arcade' && <VaultDash onXPEarned={handleXPEarned} />}
              {gameTab === 'puzzle' && <ExactChange onXPEarned={handleXPEarned} />}
            </div>
          )}
        </div>

        {/* RIGHT PANEL — desktop only */}
        <aside className="w-72 flex-shrink-0 hidden lg:block overflow-y-auto" style={{ borderLeft: `1px solid ${CARD_BORDER}`, background: '#F5F4F2' }}>
          <div className="p-6 space-y-4">
            <div className="rounded-xl p-5" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
              <div className="text-xs font-nunito font-bold uppercase tracking-widest mb-4" style={{ color: ACCENT }}>Your Pet</div>
              {petCard}
            </div>
            {nextDue && (
              <div className="rounded-xl p-4" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                <div className="text-xs font-nunito font-bold uppercase tracking-widest mb-2" style={{ color: ACCENT }}>Next Due</div>
                <div className="font-nunito font-semibold text-sm text-[#09090F]">{nextDue.itemName}</div>
                <div className="text-xs text-[#09090F]/50 font-nunito">
                  {formatRp(nextDue.monthlyAmount)} · day {nextDue.dueDay}
                </div>
              </div>
            )}
            <div className="rounded-xl p-3 text-xs font-nunito leading-relaxed" style={{ background: '#CCFBF1', border: '1px solid #99F6E4' }}>
              <strong className="text-teal-700">Pet tip:</strong>{' '}
              <span className="text-teal-800">Deposits earn +15 XP, on-time cicilan +25 XP, and finishing a goal +50 XP!</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
