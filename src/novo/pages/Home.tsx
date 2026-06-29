import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { TEMPLATES } from '../data/templates'
import { FINANCIAL_STAGES, TODO_STAGES, HABIT_STAGES } from '../data/creatures'
import type { TemplateInfo } from '../types'
import { Constellation } from '../../components/ui/Constellation'
import { useT } from '../../i18n'

function formatRp(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

const CARD_STYLES = {
  financial: { bg: '#0E0A00', accent: '#F59E0B', border: '#2A1E00' },
  todo:      { bg: '#000E06', accent: '#4ADE80', border: '#00280F' },
  habit:     { bg: '#00050F', accent: '#60A5FA', border: '#001030' },
}

function EvoDemo({ stageLabel, evolvingLabel }: { stageLabel: string; evolvingLabel: string }) {
  const [stage, setStage] = useState(0)
  const [xp, setXp] = useState(0)
  const [evolving, setEvolving] = useState(false)
  const busyRef = useRef(false)

  useEffect(() => {
    const timer = setInterval(() => {
      if (busyRef.current) return
      setXp(prev => Math.min(100, prev + 3))
    }, 70)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (xp < 100 || busyRef.current) return
    busyRef.current = true
    setEvolving(true)
    const t = setTimeout(() => {
      setStage(s => (s + 1) % 10)
      setXp(0)
      setEvolving(false)
      busyRef.current = false
    }, 900)
    return () => clearTimeout(t)
  }, [xp])

  const cur = FINANCIAL_STAGES[stage]
  const nxt = FINANCIAL_STAGES[(stage + 1) % 10]

  return (
    <div className="flex flex-col items-center w-full">
      <div
        className="relative w-40 h-40 flex items-center justify-center mb-5 rounded-3xl"
        style={{
          background: 'radial-gradient(circle at 40% 40%, #1C1030, #09090F)',
          boxShadow: evolving
            ? '0 0 60px 20px rgba(167,139,250,0.4), inset 0 0 40px rgba(124,58,237,0.2)'
            : '0 0 30px 6px rgba(124,58,237,0.12), inset 0 0 20px rgba(124,58,237,0.05)',
          transition: 'box-shadow 0.3s',
          border: '1px solid #1C1C30',
        }}
      >
        {evolving && (
          <div
            className="absolute inset-0 rounded-3xl evolution-flash"
            style={{ background: 'rgba(167,139,250,0.1)' }}
          />
        )}
        <div
          style={{
            fontSize: 88,
            animation: 'float 3s ease-in-out infinite',
            filter: evolving ? 'brightness(2) saturate(1.5)' : 'none',
            transition: 'filter 0.3s',
          }}
        >
          {cur.emoji}
        </div>
      </div>

      <div className="text-white font-nunito font-semibold text-sm mb-0.5">{cur.name}</div>
      <div className="text-gray-600 font-nunito text-xs mb-5">{stageLabel} {stage + 1} / 10</div>

      <div className="w-full max-w-[200px]">
        <div className="flex justify-between text-xs font-nunito mb-1.5">
          <span className="text-gray-600">XP</span>
          <span style={{ color: xp >= 80 ? '#A78BFA' : '#4B4B6A' }}>{xp}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#16122A' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${xp}%`,
              background: 'linear-gradient(90deg, #6D28D9, #A78BFA)',
              transition: 'width 0.07s linear',
            }}
          />
        </div>
      </div>

      {xp >= 80 && !evolving && (
        <div className="mt-3 text-xs font-nunito" style={{ color: '#7C5CCC' }}>
          {evolvingLabel} {nxt.name}...
        </div>
      )}

      <div className="flex gap-1.5 mt-5">
        {FINANCIAL_STAGES.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-500"
            style={{
              width: i === stage ? 20 : 5,
              height: 5,
              background: i < stage ? '#5B21B6' : i === stage ? '#A78BFA' : '#1A1830',
            }}
          />
        ))}
      </div>
    </div>
  )
}


function TrackerPreview({ id }: { id: 'financial' | 'todo' | 'habit' }) {
  const cs = CARD_STYLES[id]

  if (id === 'financial') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 12px' }}>
          <span style={{ fontSize: 26 }}>{FINANCIAL_STAGES[4].emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span className="font-nunito" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10 }}>{FINANCIAL_STAGES[4].name} · Stage 5</span>
              <span className="font-nunito" style={{ color: cs.accent, fontSize: 10 }}>64 XP</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 3, height: 3 }}>
              <div style={{ width: '64%', background: cs.accent, height: 3, borderRadius: 3 }} />
            </div>
          </div>
        </div>
        <div style={{ padding: '4px 2px' }}>
          <div className="font-nunito" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, marginBottom: 3 }}>Balance this month</div>
          <div className="font-nunito" style={{ color: 'white', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Rp 2.050.000</div>
        </div>
        {[
          { label: 'Gaji', amount: '+3.000.000', pos: true },
          { label: 'Kos', amount: '−1.500.000', pos: false },
          { label: 'Groceries', amount: '−250.000', pos: false },
          { label: 'Freelance', amount: '+800.000', pos: true },
        ].map((e, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
            <span className="font-nunito" style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12 }}>{e.label}</span>
            <span className="font-nunito" style={{ color: e.pos ? '#4ADE80' : '#F87171', fontSize: 12, fontWeight: 600 }}>{e.amount}</span>
          </div>
        ))}
      </div>
    )
  }

  if (id === 'todo') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 12px' }}>
          <span style={{ fontSize: 26 }}>{TODO_STAGES[5].emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span className="font-nunito" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10 }}>{TODO_STAGES[5].name} · Stage 6</span>
              <span className="font-nunito" style={{ color: cs.accent, fontSize: 10 }}>82 XP</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 3, height: 3 }}>
              <div style={{ width: '82%', background: cs.accent, height: 3, borderRadius: 3 }} />
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { col: 'To Do', tasks: ['Landing page', 'Client call'], active: false },
            { col: 'Doing', tasks: ['Design sys', 'API setup'], active: true },
            { col: 'Done', tasks: ['Deploy v1', 'Write docs'], active: false },
          ].map(({ col, tasks, active }) => (
            <div key={col}>
              <div className="font-nunito" style={{ color: active ? cs.accent : 'rgba(255,255,255,0.22)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{col}</div>
              {tasks.map(task => (
                <div key={task} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '6px 7px', marginBottom: 4 }}>
                  <span className="font-nunito" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, lineHeight: 1.3, display: 'block' }}>{task}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { label: '4 tasks', color: 'rgba(255,255,255,0.18)' },
            { label: '2 in progress', color: cs.accent },
            { label: '2 done ✓', color: 'rgba(74,222,128,0.45)' },
          ].map(b => (
            <div key={b.label} style={{ padding: '3px 10px', borderRadius: 20, border: `1px solid ${b.color}` }}>
              <span className="font-nunito" style={{ color: b.color, fontSize: 10 }}>{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 12px' }}>
        <span style={{ fontSize: 26 }}>{HABIT_STAGES[6].emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span className="font-nunito" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10 }}>{HABIT_STAGES[6].name} · Stage 7</span>
            <span className="font-nunito" style={{ color: cs.accent, fontSize: 10 }}>71 XP</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 3, height: 3 }}>
            <div style={{ width: '71%', background: cs.accent, height: 3, borderRadius: 3 }} />
          </div>
        </div>
      </div>
      {[
        { emoji: '💧', name: 'Drink water', checks: [1,1,1,1,1,1,0] },
        { emoji: '📚', name: 'Read 30 min', checks: [1,1,0,1,1,0,0] },
        { emoji: '🏃', name: 'Morning run', checks: [1,0,1,1,1,0,0] },
        { emoji: '🧘', name: 'Meditate', checks: [0,1,1,1,0,1,0] },
      ].map(h => (
        <div key={h.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
          <span style={{ fontSize: 13, flexShrink: 0 }}>{h.emoji}</span>
          <span className="font-nunito" style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.name}</span>
          <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
            {h.checks.map((c, i) => (
              <div key={i} style={{ width: 13, height: 13, borderRadius: 3, background: c ? cs.accent : 'rgba(255,255,255,0.06)' }} />
            ))}
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
        <span style={{ fontSize: 14 }}>🔥</span>
        <span className="font-nunito" style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12 }}>6-day streak</span>
        <span className="font-nunito font-bold" style={{ color: '#F59E0B', fontSize: 12, marginLeft: 'auto' }}>Best: 14</span>
      </div>
    </div>
  )
}

function TemplateModal({ t, onClose, onBuy, previewLabel, getItLabel }: { t: TemplateInfo; onClose: () => void; onBuy: () => void; previewLabel: string; getItLabel: string }) {
  const cs = CARD_STYLES[t.id]
  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <div
        className="relative w-full overflow-x-hidden overflow-y-auto bounce-in max-h-[85vh] md:max-h-[90vh] my-2 md:my-0"
        style={{ maxWidth: 760, background: cs.bg, border: `1px solid ${cs.border}`, borderRadius: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-7 h-7 flex items-center justify-center rounded-full text-gray-500 hover:text-white transition"
          style={{ background: '#1A1A28' }}
        >
          ✕
        </button>
        <div className="grid md:grid-cols-2">
          <div className="p-6 border-b md:border-b-0 md:border-r" style={{ borderColor: cs.border }}>
            <div className="font-nunito mb-4" style={{ color: 'rgba(255,255,255,0.18)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{previewLabel}</div>
            <TrackerPreview id={t.id} />
          </div>
          <div className="p-6 flex flex-col">
            <div className="text-5xl mb-4">
              {t.id === 'financial' ? FINANCIAL_STAGES[9].emoji
                : t.id === 'todo' ? TODO_STAGES[9].emoji
                : HABIT_STAGES[9].emoji}
            </div>
            <h2 className="text-white mb-2" style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 22, fontWeight: 700 }}>
              {t.name}
            </h2>
            <p className="text-gray-400 text-sm font-nunito mb-5 leading-relaxed">{t.description}</p>
            <div className="space-y-2 mb-6 flex-1">
              {t.features.map(f => (
                <div key={f} className="flex items-start gap-2 text-sm font-nunito">
                  <span style={{ color: cs.accent, flexShrink: 0 }}>→</span>
                  <span className="text-gray-300">{f}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-4" style={{ borderTop: `1px solid ${cs.border}` }}>
              <div className="text-white font-nunito font-bold text-xl">{formatRp(t.price)}</div>
              <button
                onClick={onBuy}
                className="font-nunito font-bold text-sm transition hover:opacity-90"
                style={{ background: cs.accent, color: '#000', padding: '10px 24px', borderRadius: 9999 }}
              >
                {getItLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [modal, setModal] = useState<TemplateInfo | null>(null)
  const t = useT()
  const s = t.studios

  const go = () => navigate(session ? '/studios/dashboard' : '/studios/login')

  return (
    <div style={{ background: '#09090F' }}>
      {/* HERO */}
      <section className="min-h-screen flex items-center pt-16 relative overflow-hidden" style={{ background: '#09090F' }}>
        <Constellation />
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full py-14 md:py-24">
          <div className="grid md:grid-cols-5 gap-8 md:gap-16 items-center">
            <div className="md:col-span-3">
              <h1
                style={{
                  fontFamily: 'Playfair Display, Georgia, serif',
                  fontSize: 'clamp(40px, 9vw, 114px)',
                  fontWeight: 900,
                  lineHeight: 0.95,
                  letterSpacing: '-0.03em',
                  color: 'white',
                  marginBottom: 32,
                }}
              >
                {s.hero.titleLine1}<br />
                <em style={{ color: '#7C3AED', fontStyle: 'italic', fontWeight: 700, fontFamily: "'Nunito', Arial, sans-serif" }}>{s.hero.titleLine2Em}</em><br />
                {s.hero.titleLine3}
              </h1>

              <p className="font-nunito text-gray-400 text-lg mb-8 md:mb-12 leading-relaxed" style={{ maxWidth: 420 }}>
                {s.hero.subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-4 md:gap-8">
                <button
                  onClick={go}
                  className="font-nunito font-bold text-sm transition hover:opacity-90 active:scale-95"
                  style={{ background: '#7C3AED', color: 'white', padding: '14px 36px', borderRadius: 9999 }}
                >
                  {session ? s.hero.ctaDashboard : s.hero.ctaGet}
                </button>
                {!session && (
                  <button
                    onClick={() => navigate('/studios/login')}
                    className="font-nunito text-sm transition hover:text-white"
                    style={{ color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', padding: 0 }}
                  >
                    {s.hero.ctaSignIn}
                  </button>
                )}
              </div>
            </div>

            {/* Right: floating EvoDemo — no containing box */}
            <div className="md:col-span-2 flex justify-center py-8">
              <EvoDemo stageLabel={s.evo.stageLabel} evolvingLabel={s.evo.evolving} />
            </div>
          </div>
        </div>
      </section>

      {/* EVOLUTION CHAIN — auto-scrolling marquee */}
      <section style={{
        background: 'linear-gradient(180deg, #0F0B22 0%, #1E1245 50%, #0F0B22 100%)',
        borderTop: '1px solid rgba(167,139,250,0.10)',
        borderBottom: '1px solid rgba(167,139,250,0.10)',
      }}>
        <p className="text-center pt-7 pb-4 text-[10px] font-nunito uppercase tracking-[0.25em]" style={{ color: 'rgba(167,139,250,0.45)' }}>
          {s.evo.stagesCaption}
        </p>
        {/* Edge-fade mask + overflow clip */}
        <div
          className="overflow-hidden pb-8"
          style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)' }}
        >
          {/* marquee-track: duplicated content for seamless loop */}
          <div className="marquee-track flex items-end gap-5" style={{ width: 'max-content' }}>
            {[1, 2].map(copy => (
              <div key={copy} className="flex items-end gap-5 flex-shrink-0">
                {FINANCIAL_STAGES.map((s, i) => (
                  <span key={`f${copy}-${s.id}`} className="flex-shrink-0 block" style={{
                    fontSize: 18 + i * 4, lineHeight: 1,
                    opacity: 0.45 + i * 0.06,
                    userSelect: 'none',
                    filter: i >= 7 ? 'drop-shadow(0 0 10px rgba(167,139,250,0.6))' : 'none',
                  }}>{s.emoji}</span>
                ))}
                <span className="flex-shrink-0 mx-4 self-center" style={{ color: 'rgba(167,139,250,0.2)', fontSize: 24 }}>·</span>
                {TODO_STAGES.map((s, i) => (
                  <span key={`t${copy}-${s.id}`} className="flex-shrink-0 block" style={{
                    fontSize: 18 + i * 4, lineHeight: 1,
                    opacity: 0.45 + i * 0.06,
                    userSelect: 'none',
                    filter: i >= 7 ? 'drop-shadow(0 0 10px rgba(74,222,128,0.5))' : 'none',
                  }}>{s.emoji}</span>
                ))}
                <span className="flex-shrink-0 mx-4 self-center" style={{ color: 'rgba(167,139,250,0.2)', fontSize: 24 }}>·</span>
                {HABIT_STAGES.map((s, i) => (
                  <span key={`h${copy}-${s.id}`} className="flex-shrink-0 block" style={{
                    fontSize: 18 + i * 4, lineHeight: 1,
                    opacity: 0.45 + i * 0.06,
                    userSelect: 'none',
                    filter: i >= 7 ? 'drop-shadow(0 0 10px rgba(96,165,250,0.5))' : 'none',
                  }}>{s.emoji}</span>
                ))}
                <span className="flex-shrink-0 mx-6 self-center" style={{ color: 'rgba(167,139,250,0.15)', fontSize: 24 }}>·</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEMPLATES */}
      <section className="py-16 md:py-28 px-6 md:px-12" style={{ background: '#F5F4F2' }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 md:mb-16 flex items-end justify-between">
            <h2
              style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: 'clamp(32px, 4vw, 52px)',
                fontWeight: 700,
                letterSpacing: '-0.025em',
                lineHeight: 1.0,
                color: '#0D0D0D',
              }}
            >
              {s.templates.titleLine1}<br />
              <em style={{ fontStyle: 'italic', color: '#7C3AED' }}>{s.templates.titleLine2Em}</em> {s.templates.titleLine3}
            </h2>
            <p className="font-nunito text-gray-400 text-sm hidden md:block" style={{ maxWidth: 180, textAlign: 'right' }}>
              {formatRp(25000)} {s.templates.priceEach}<br />{s.templates.oneTimePurchase}
            </p>
          </div>

          <div className="grid md:grid-cols-3 md:grid-rows-2 gap-3" style={{ minHeight: 560 }}>

            {/* FINANCIAL */}
            <div
              className="md:col-span-2 md:row-span-2 cursor-pointer overflow-hidden relative min-h-[380px]"
              style={{
                background: 'linear-gradient(145deg, #1C1000 0%, #0E0A00 100%)',
                border: `1px solid ${CARD_STYLES.financial.border}`,
                borderRadius: 16,
                transition: 'border-color 0.25s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = CARD_STYLES.financial.border)}
              onClick={() => setModal(TEMPLATES[0])}
            >
              <div style={{
                position: 'absolute',
                top: 44,
                right: 48,
                fontSize: 96,
                lineHeight: 1,
                userSelect: 'none',
                filter: 'drop-shadow(0 8px 32px rgba(245,158,11,0.38))',
                animation: 'float 3s ease-in-out infinite',
              }}>
                {FINANCIAL_STAGES[9].emoji}
              </div>
              <div style={{ position: 'absolute', bottom: 44, left: 44, right: 44 }}>
                <h3 style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: 'clamp(34px, 4.5vw, 56px)',
                  fontWeight: 700,
                  color: 'white',
                  lineHeight: 1.05,
                  letterSpacing: '-0.025em',
                }}>
                  {s.templates.financial.headline1}<br />{s.templates.financial.headline2}
                </h3>
                <p className="font-nunito" style={{ color: 'rgba(255,255,255,0.28)', fontSize: 13, marginTop: 10, lineHeight: 1.6 }}>
                  {s.templates.financial.desc}
                </p>
                <div className="font-nunito" style={{ color: 'rgba(245,158,11,0.65)', fontSize: 13, marginTop: 16, letterSpacing: '0.01em' }}>
                  {s.templates.seeMore}
                </div>
              </div>
            </div>

            {/* TO-DO */}
            <div
              className="cursor-pointer overflow-hidden relative"
              style={{
                background: 'linear-gradient(to bottom right, #001A08, #000E06)',
                border: `1px solid ${CARD_STYLES.todo.border}`,
                borderRadius: 24,
                minHeight: 200,
                transition: 'border-color 0.25s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(74,222,128,0.25)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = CARD_STYLES.todo.border)}
              onClick={() => setModal(TEMPLATES[1])}
            >
              <div style={{
                position: 'absolute',
                left: 20,
                top: '50%',
                transform: 'translateY(-55%)',
                fontSize: 72,
                lineHeight: 1,
                userSelect: 'none',
                filter: 'drop-shadow(0 6px 20px rgba(74,222,128,0.28))',
                animation: 'float 3.2s ease-in-out infinite 0.4s',
              }}>
                {TODO_STAGES[9].emoji}
              </div>
              <div style={{ position: 'absolute', bottom: 28, left: 116, right: 20 }}>
                <h3 style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: 20,
                  fontWeight: 700,
                  color: 'white',
                  lineHeight: 1.2,
                  letterSpacing: '-0.01em',
                }}>
                  {s.templates.todo.headline1}<br />{s.templates.todo.headline2}
                </h3>
                <div className="font-nunito" style={{ color: 'rgba(74,222,128,0.6)', fontSize: 12, marginTop: 10 }}>
                  {s.templates.seeMore}
                </div>
              </div>
            </div>

            {/* HABIT */}
            <div
              className="cursor-pointer overflow-hidden relative"
              style={{
                background: 'radial-gradient(ellipse at top right, #001030 0%, #00050F 70%)',
                border: `1px solid ${CARD_STYLES.habit.border}`,
                borderRadius: 12,
                minHeight: 200,
                transition: 'border-color 0.25s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(96,165,250,0.25)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = CARD_STYLES.habit.border)}
              onClick={() => setModal(TEMPLATES[2])}
            >
              <div style={{
                position: 'absolute',
                top: 20,
                right: 24,
                fontSize: 72,
                lineHeight: 1,
                userSelect: 'none',
                filter: 'drop-shadow(0 6px 20px rgba(96,165,250,0.28))',
                animation: 'float 2.8s ease-in-out infinite 0.8s',
              }}>
                {HABIT_STAGES[9].emoji}
              </div>
              <div style={{ position: 'absolute', bottom: 28, left: 24, right: 90 }}>
                <h3 style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: 20,
                  fontWeight: 700,
                  color: 'white',
                  lineHeight: 1.2,
                  letterSpacing: '-0.01em',
                }}>
                  {s.templates.habit.headline1}<br />{s.templates.habit.headline2}
                </h3>
                <div className="font-nunito" style={{ color: 'rgba(96,165,250,0.6)', fontSize: 12, marginTop: 10 }}>
                  {s.templates.seeMore}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section
        className="py-16 md:py-28 px-6 text-center"
        style={{ background: '#09090F', borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        <h2
          className="text-white mb-5"
          style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(36px, 5vw, 60px)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          {s.cta.title}
        </h2>
        <p className="text-gray-500 font-nunito text-base mb-10 max-w-xs mx-auto leading-relaxed">
          {s.cta.subtitle}
        </p>
        <button
          onClick={go}
          className="font-nunito font-bold text-sm transition hover:opacity-90"
          style={{ background: '#7C3AED', color: 'white', padding: '14px 44px', borderRadius: 9999 }}
        >
          {session ? s.cta.ctaDashboard : s.cta.ctaStart}
        </button>
      </section>

      {modal && <TemplateModal t={modal} onClose={() => setModal(null)} onBuy={go} previewLabel={s.modal.preview} getItLabel={s.modal.getIt} />}
    </div>
  )
}
