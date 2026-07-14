import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getAllCharacters, DEFAULT_CHARACTER } from '../lib/storage'
import { getStageFromXP } from '../data/creatures'
import { TEMPLATES } from '../data/templates'
import { QUICK_STATS, type QuickStat } from '../data/quickStats'
import type { TemplateId, CharacterState } from '../types'

export default function Dashboard() {
  const navigate = useNavigate()
  const { session, profile } = useAuth()
  const [characters, setCharacters] = useState<Partial<Record<TemplateId, CharacterState>> | null>(null)
  const [quickStats, setQuickStats] = useState<Partial<Record<TemplateId, QuickStat[]>>>({})

  const owned = profile?.owned_templates ?? []

  useEffect(() => {
    if (!session?.user) return
    const uid = session.user.id
    getAllCharacters(uid).then(setCharacters)
    const ownedIds = TEMPLATES.filter(t => owned.includes(t.id)).map(t => t.id)
    Promise.all(ownedIds.map(id => QUICK_STATS[id](uid).then(stats => [id, stats] as const)))
      .then(entries => setQuickStats(Object.fromEntries(entries)))
  }, [session, profile])

  if (!characters) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: '#F5F4F2' }}>
        <div className="text-[#09090F]/40 font-nunito text-sm">Loading…</div>
      </div>
    )
  }

  const displayName = profile?.full_name ?? session?.user.email ?? ''

  const allXP = TEMPLATES.reduce((sum, t) => sum + (characters[t.id]?.xp ?? 0), 0)

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
          {allXP.toLocaleString()} total XP · {owned.length}/{TEMPLATES.length} templates unlocked
        </p>
      </div>

      <div className="space-y-4">
        {TEMPLATES.map(template => {
          const isOwned = owned.includes(template.id)
          const charData = characters[template.id] ?? DEFAULT_CHARACTER

          const stages = template.stages
          const stage = getStageFromXP(stages, charData.xp)
          const nextStage = stages[stage.id + 1]
          const progress = nextStage
            ? Math.min(100, ((charData.xp - stage.xpRequired) / (nextStage.xpRequired - stage.xpRequired)) * 100)
            : 100
          const stats = quickStats[template.id] ?? []

          return (
            <div
              key={template.id}
              className="rounded-2xl overflow-hidden transition-all cursor-pointer hover:brightness-95"
              style={{ background: template.cardStyle.bg, border: `1px solid ${template.cardStyle.border}` }}
              onClick={() => navigate(template.route)}
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
                          style={{ background: template.accent + '20', color: template.accent }}
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
                        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: template.cardStyle.border }}>
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${progress}%`, background: template.accent }}
                          />
                        </div>
                        <span className="text-xs font-nunito flex-shrink-0" style={{ color: template.accent }}>
                          {charData.xp} XP
                        </span>
                      </div>
                      <div className="flex gap-3 md:gap-6">
                        {stats.map(d => (
                          <div key={d.label}>
                            <div className="font-nunito font-bold text-sm" style={{ color: template.accent }}>{d.value}</div>
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
                  <div className="text-xl flex-shrink-0" style={{ color: template.accent }}>→</div>
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
