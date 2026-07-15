import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { TEMPLATES, TRACKER_PRICE_IDR } from '../data/templates'
import { getImpactTotals } from '../lib/gamification'
import type { TemplateInfo } from '../types'
import { Constellation } from '../../components/ui/Constellation'
import { en } from '../../i18n/locales/en'

function formatRp(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID')
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

  const demoStages = TEMPLATES[0].stages
  const cur = demoStages[stage]
  const nxt = demoStages[(stage + 1) % 10]

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
        {demoStages.map((_, i) => (
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

/** Generic preview built entirely from registry data — no bespoke mockup per tracker. */
function TrackerPreview({ t }: { t: TemplateInfo }) {
  const previewStages = [0, 3, 6, 9].map(i => t.stages[i])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Pet card */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 12px' }}>
        <span style={{ fontSize: 26 }}>{t.stages[4].emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span className="font-nunito" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10 }}>{t.stages[4].name} · Stage 5</span>
            <span className="font-nunito" style={{ color: t.accent, fontSize: 10 }}>64 XP</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 3, height: 3 }}>
            <div style={{ width: '64%', background: t.accent, height: 3, borderRadius: 3 }} />
          </div>
        </div>
      </div>

      {/* Evolution strip */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
        {previewStages.map((stage, i) => (
          <div key={stage.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22 + i * 7, lineHeight: 1, filter: i === 3 ? `drop-shadow(0 0 10px ${t.accent}99)` : 'none' }}>
                {stage.emoji}
              </div>
              <div className="font-nunito" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 8, marginTop: 5 }}>
                Stage {stage.id}
              </div>
            </div>
            {i < previewStages.length - 1 && (
              <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 12 }}>→</span>
            )}
          </div>
        ))}
      </div>

      {/* Stat chips */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {t.previewStats.map(stat => (
          <div key={stat} style={{ padding: '5px 12px', borderRadius: 20, border: `1px solid ${t.accent}55` }}>
            <span className="font-nunito" style={{ color: t.accent, fontSize: 11 }}>{stat}</span>
          </div>
        ))}
      </div>

      {/* Feature rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {t.features.slice(0, 4).map(f => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
            <span style={{ color: t.accent, fontSize: 11, flexShrink: 0 }}>✓</span>
            <span className="font-nunito" style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11 }}>{f}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TemplateModal({ t, onClose, onBuy, previewLabel, getItLabel }: { t: TemplateInfo; onClose: () => void; onBuy: () => void; previewLabel: string; getItLabel: string }) {
  const border = t.accent + '26'
  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <div
        className="relative w-full overflow-x-hidden overflow-y-auto bounce-in max-h-[85vh] md:max-h-[90vh] my-2 md:my-0"
        style={{ maxWidth: 760, background: '#0B0B14', border: `1px solid ${border}`, borderRadius: 20 }}
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
          <div className="p-6 border-b md:border-b-0 md:border-r" style={{ borderColor: border }}>
            <div className="font-nunito mb-4" style={{ color: 'rgba(255,255,255,0.18)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{previewLabel}</div>
            <TrackerPreview t={t} />
          </div>
          <div className="p-6 flex flex-col">
            <div className="text-5xl mb-4">{t.stages[9].emoji}</div>
            <h2 className="text-white mb-2" style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 22, fontWeight: 700 }}>
              {t.name}
            </h2>
            <p className="text-gray-400 text-sm font-nunito mb-5 leading-relaxed">{t.description}</p>
            <div className="space-y-2 mb-6 flex-1">
              {t.features.map(f => (
                <div key={f} className="flex items-start gap-2 text-sm font-nunito">
                  <span style={{ color: t.accent, flexShrink: 0 }}>→</span>
                  <span className="text-gray-300">{f}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-4" style={{ borderTop: `1px solid ${border}` }}>
              <div className="text-white font-nunito font-bold text-xl">{formatRp(t.price)}</div>
              <button
                onClick={onBuy}
                className="font-nunito font-bold text-sm transition hover:opacity-90"
                style={{ background: t.accent, color: '#000', padding: '10px 24px', borderRadius: 9999 }}
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

interface TrackerCopy { headline1: string; headline2: string; desc: string }

function TemplateCard({ tpl, copy, seeMore, onClick, index }: { tpl: TemplateInfo; copy: TrackerCopy; seeMore: string; onClick: () => void; index: number }) {
  const featured = !!tpl.featured
  const border = tpl.accent + '40'
  const borderHover = tpl.accent + '80'
  // Each card gets its own richly tinted night-sky: a glowing accent corner
  // behind the creature + an accent-washed body. Corner position alternates
  // so neighboring cards don't look stamped from the same mold.
  const glowRight = index % 2 === 0
  const bg = [
    `radial-gradient(130% 95% at ${glowRight ? '85% 8%' : '12% 10%'}, color-mix(in srgb, ${tpl.accent} 42%, #0A0A12) 0%, transparent 58%)`,
    `linear-gradient(${glowRight ? '160deg' : '205deg'}, color-mix(in srgb, ${tpl.accent} 20%, #0A0A12) 0%, #0A0A12 80%)`,
  ].join(', ')
  return (
    <div
      className={`cursor-pointer overflow-hidden relative ${featured ? 'md:col-span-2 md:row-span-2 min-h-[380px]' : 'min-h-[200px]'}`}
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 16,
        transition: 'border-color 0.25s, box-shadow 0.25s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = borderHover
        e.currentTarget.style.boxShadow = `0 10px 40px ${tpl.accent}30`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = border
        e.currentTarget.style.boxShadow = 'none'
      }}
      onClick={onClick}
    >
      <div style={{
        position: 'absolute',
        top: featured ? 44 : 20,
        right: featured ? 48 : 24,
        fontSize: featured ? 96 : 64,
        lineHeight: 1,
        userSelect: 'none',
        filter: `drop-shadow(0 8px 28px ${tpl.accent}90)`,
        animation: 'float 3s ease-in-out infinite',
      }}>
        {tpl.stages[9].emoji}
      </div>
      <div style={{
        position: 'absolute',
        bottom: featured ? 44 : 24,
        left: featured ? 44 : 24,
        right: featured ? 44 : 24,
      }}>
        <h3 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: featured ? 'clamp(34px, 4.5vw, 56px)' : 20,
          fontWeight: 700,
          color: 'white',
          lineHeight: featured ? 1.05 : 1.2,
          letterSpacing: featured ? '-0.025em' : '-0.01em',
        }}>
          {copy.headline1}<br />{copy.headline2}
        </h3>
        {featured && (
          <p className="font-nunito" style={{ color: 'rgba(255,255,255,0.28)', fontSize: 13, marginTop: 10, lineHeight: 1.6 }}>
            {copy.desc}
          </p>
        )}
        <div className="font-nunito" style={{ color: tpl.accent + 'A6', fontSize: featured ? 13 : 12, marginTop: featured ? 16 : 10 }}>
          {seeMore}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [modal, setModal] = useState<TemplateInfo | null>(null)
  const [impact, setImpact] = useState<{ social: number; environment: number } | null>(null)
  // Novo is an English-only product — always use the English copy,
  // regardless of the main site's language switcher.
  const s = en.studios

  useEffect(() => {
    getImpactTotals().then(setImpact).catch(() => setImpact({ social: 0, environment: 0 }))
  }, [])

  const go = () => navigate(session ? '/studios/dashboard' : '/studios/login')

  const trackerCount = TEMPLATES.length
  const heroSubtitle = s.hero.subtitle
    .replace('{trackers}', String(trackerCount))
    .replace('{games}', String(trackerCount * 3))
  const stagesCaption = s.evo.stagesCaption
    .replace('{stages}', String(trackerCount * 10))
    .replace('{trackers}', String(trackerCount))
  const templatesTitle = s.templates.titleLine1.replace('{count}', String(trackerCount))

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
                {heroSubtitle}
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
          {stagesCaption}
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
                {TEMPLATES.map(tpl => (
                  <div key={`${copy}-${tpl.id}`} className="flex items-end gap-5 flex-shrink-0">
                    {tpl.stages.map((stage, i) => (
                      <span key={`${copy}-${tpl.id}-${stage.id}`} className="flex-shrink-0 block" style={{
                        fontSize: 18 + i * 4, lineHeight: 1,
                        opacity: 0.45 + i * 0.06,
                        userSelect: 'none',
                        filter: i >= 7 ? `drop-shadow(0 0 10px ${tpl.accent}99)` : 'none',
                      }}>{stage.emoji}</span>
                    ))}
                    <span className="flex-shrink-0 mx-4 self-center" style={{ color: 'rgba(167,139,250,0.2)', fontSize: 24 }}>·</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACT — every completed pet cycle plants or helps */}
      <section className="py-16 md:py-24 px-6 md:px-12" style={{ background: '#09090F' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <span
              className="inline-block font-nunito font-bold uppercase tracking-[0.2em] mb-5 text-[10px] px-3 py-1.5 rounded-full"
              style={{ color: '#F59E0B', border: '1px solid rgba(245,158,11,0.35)', background: 'rgba(245,158,11,0.08)' }}
            >
              👑 {s.impact.sticker}
            </span>
            <h2
              className="text-white mb-4"
              style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: 'clamp(36px, 5.5vw, 72px)',
                fontWeight: 700,
                letterSpacing: '-0.025em',
                lineHeight: 1.0,
              }}
            >
              {s.impact.titleLine1} <em style={{ color: '#4ADE80' }}>{s.impact.titleLine2Em}</em>
            </h2>
            <p className="font-nunito text-gray-400 text-base max-w-md mx-auto leading-relaxed">
              {s.impact.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10">
            {[
              { emoji: '🌱', title: s.impact.envTitle, line: s.impact.envLine, stat: s.impact.envStat, accent: '#4ADE80', count: impact?.environment },
              { emoji: '💛', title: s.impact.socialTitle, line: s.impact.socialLine, stat: s.impact.socialStat, accent: '#F472B6', count: impact?.social },
            ].map(c => (
              <div
                key={c.title}
                className="rounded-2xl p-6 text-center"
                style={{
                  background: `linear-gradient(180deg, color-mix(in srgb, ${c.accent} 14%, #0A0A12) 0%, #0A0A12 90%)`,
                  border: `1px solid ${c.accent}45`,
                }}
              >
                <div style={{ fontSize: 44 }} className="mb-2">{c.emoji}</div>
                <div className="font-nunito font-bold uppercase tracking-wide text-white text-sm mb-1">{c.title}</div>
                <div className="font-nunito font-semibold text-xs mb-4" style={{ color: c.accent }}>{c.line}</div>
                <div className="font-nunito font-bold text-white leading-none" style={{ fontSize: 40 }}>
                  {c.count === undefined ? '—' : c.count.toLocaleString()}
                </div>
                <div className="font-nunito text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{c.stat}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5">
            {[s.impact.how1, s.impact.how2, s.impact.how3].map((step, i) => (
              <div key={step} className="flex items-center gap-3 md:gap-5">
                <span
                  className="font-nunito font-semibold text-sm px-4 py-2 rounded-full"
                  style={{ color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)' }}
                >
                  {step}
                </span>
                {i < 2 && <span style={{ color: 'rgba(255,255,255,0.25)' }}>→</span>}
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
              {templatesTitle}<br />
              <em style={{ fontStyle: 'italic', color: '#7C3AED' }}>{s.templates.titleLine2Em}</em> {s.templates.titleLine3}
            </h2>
            <p className="font-nunito text-gray-400 text-sm hidden md:block" style={{ maxWidth: 180, textAlign: 'right' }}>
              {formatRp(TRACKER_PRICE_IDR)} {s.templates.priceEach}<br />{s.templates.oneTimePurchase}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-3" style={{ gridAutoRows: 'minmax(200px, auto)' }}>
            {TEMPLATES.map((tpl, i) => (
              <TemplateCard
                key={tpl.id}
                tpl={tpl}
                index={i}
                copy={s.templates.trackers[tpl.id]}
                seeMore={s.templates.seeMore}
                onClick={() => setModal(tpl)}
              />
            ))}
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
