import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getFinancialData, getTodoData, getHabitData } from '../lib/storage'
import { FINANCIAL_STAGES, TODO_STAGES, HABIT_STAGES, getStageFromXP } from '../data/creatures'
import { TEMPLATES } from '../data/templates'
import type { TemplateId, FinancialData, TodoData, HabitData } from '../types'

const STAGES_MAP = { financial: FINANCIAL_STAGES, todo: TODO_STAGES, habit: HABIT_STAGES }
const ROUTES: Record<TemplateId, string> = { financial: '/studios/app/financial', todo: '/studios/app/todo', habit: '/studios/app/habit' }

const CARD_STYLES: Record<TemplateId, { bg: string; accent: string; border: string }> = {
  financial: { bg: '#FFFFFF', accent: '#B45309', border: '#E5E4E2' },
  todo:      { bg: '#FFFFFF', accent: '#16A34A', border: '#E5E4E2' },
  habit:     { bg: '#FFFFFF', accent: '#1D4ED8', border: '#E5E4E2' },
}

interface AllData {
  financial: FinancialData
  todo: TodoData
  habit: HabitData
}

function getQuickData(id: TemplateId, data: AllData) {
  if (id === 'financial') {
    const { transactions } = data.financial
    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    return [
      { label: 'Income', value: `+${(income / 1000).toFixed(0)}K` },
      { label: 'Expenses', value: `-${(expense / 1000).toFixed(0)}K` },
      { label: 'Net', value: `${income - expense >= 0 ? '+' : ''}${((income - expense) / 1000).toFixed(0)}K` },
    ]
  }
  if (id === 'todo') {
    const { tasks } = data.todo
    const done = tasks.filter(t => t.completed).length
    return [
      { label: 'Total', value: String(tasks.length) },
      { label: 'Done', value: String(done) },
      { label: 'Rate', value: tasks.length ? `${Math.round((done / tasks.length) * 100)}%` : '0%' },
    ]
  }
  const { habits } = data.habit
  const today = new Date().toISOString().split('T')[0]
  const done = habits.filter(h => h.completions.includes(today)).length
  return [
    { label: 'Habits', value: String(habits.length) },
    { label: 'Today', value: `${done}/${habits.length}` },
    { label: 'Rate', value: habits.length ? `${Math.round((done / habits.length) * 100)}%` : '0%' },
  ]
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { session, profile } = useAuth()
  const [allData, setAllData] = useState<AllData | null>(null)

  useEffect(() => {
    if (!session?.user) return
    const uid = session.user.id
    Promise.all([
      getFinancialData(uid),
      getTodoData(uid),
      getHabitData(uid),
    ]).then(([financial, todo, habit]) => setAllData({ financial, todo, habit }))
  }, [session])

  if (!allData) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: '#F5F4F2' }}>
        <div className="text-[#09090F]/40 font-nunito text-sm">Loading…</div>
      </div>
    )
  }

  const owned = profile?.owned_templates ?? []
  const displayName = profile?.full_name ?? session?.user.email ?? ''

  const allXP =
    allData.financial.character.xp +
    allData.todo.character.xp +
    allData.habit.character.xp

  return (
    <div className="h-full overflow-y-auto p-5 md:p-8 lg:p-12" style={{ background: '#F5F4F2' }}>
      <div className="mb-8 md:mb-10">
        <div className="text-xs text-[#09090F]/40 font-nunito font-bold uppercase tracking-widest mb-3">Dashboard</div>
        <h1
          className="text-[#09090F] leading-none mb-2"
          style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(32px, 6vw, 80px)', fontWeight: 700 }}
        >
          Hey, {displayName}.
        </h1>
        <p className="text-[#09090F]/50 font-nunito text-sm">
          {allXP.toLocaleString()} total XP · {owned.length}/3 templates unlocked
        </p>
      </div>

      <div className="space-y-4">
        {TEMPLATES.map(template => {
          const isOwned = owned.includes(template.id)
          const cs = CARD_STYLES[template.id]
          const charData =
            template.id === 'financial' ? allData.financial.character
            : template.id === 'todo' ? allData.todo.character
            : allData.habit.character

          const stages = STAGES_MAP[template.id]
          const stage = getStageFromXP(stages, charData.xp)
          const nextStage = stages[stage.id + 1]
          const progress = nextStage
            ? Math.min(100, ((charData.xp - stage.xpRequired) / (nextStage.xpRequired - stage.xpRequired)) * 100)
            : 100
          const quickData = getQuickData(template.id, allData)

          return (
            <div
              key={template.id}
              className="rounded-2xl overflow-hidden transition-all cursor-pointer hover:brightness-95"
              style={{ background: cs.bg, border: `1px solid ${cs.border}` }}
              onClick={() => navigate(ROUTES[template.id])}
            >
              <div className="flex items-center gap-3 md:gap-5 p-4 md:p-5">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
                  style={{ background: '#F5F4F2', border: '1px solid #E5E4E2' }}
                >
                  {isOwned ? stage.emoji : '🔒'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-nunito font-bold text-[#09090F] text-base">
                      {template.emoji} {template.name}
                    </h3>
                    {isOwned && (
                      <>
                        <span
                          className="text-xs font-nunito px-2 py-0.5 rounded-full"
                          style={{ background: cs.accent + '20', color: cs.accent }}
                        >
                          {stage.name}
                        </span>
                        {(charData.prestige ?? 0) > 0 && (
                          <span className="text-xs font-nunito font-bold" style={{ color: '#7C3AED' }}>
                            {charData.prestige <= 3 ? '⭐'.repeat(charData.prestige) : `⭐×${charData.prestige}`}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {isOwned && (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: cs.border }}>
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${progress}%`, background: cs.accent }}
                          />
                        </div>
                        <span className="text-xs font-nunito flex-shrink-0" style={{ color: cs.accent }}>
                          {charData.xp} XP
                        </span>
                      </div>
                      <div className="flex gap-3 md:gap-6">
                        {quickData.map(d => (
                          <div key={d.label}>
                            <div className="font-nunito font-bold text-sm" style={{ color: cs.accent }}>{d.value}</div>
                            <div className="text-xs font-nunito text-[#09090F]/50">{d.label}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {!isOwned && (
                    <div className="text-sm text-[#09090F]/50 font-nunito">Tap to unlock · one-time payment</div>
                  )}
                </div>

                {isOwned && (
                  <div className="text-xl flex-shrink-0" style={{ color: cs.accent }}>→</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8 pt-8 border-t" style={{ borderColor: '#E5E4E2' }}>
        <button
          onClick={() => navigate('/studios')}
          className="text-xs text-[#09090F]/50 hover:text-[#09090F] font-nunito transition"
        >
          ← Back to store
        </button>
      </div>
    </div>
  )
}
