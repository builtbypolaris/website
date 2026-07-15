import { useEffect, useState } from 'react'
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { logout } from '../lib/storage'
import { ensureWeeklyMissions } from '../lib/gamification'
import { useAuth } from '../contexts/AuthContext'
import { TEMPLATES } from '../data/templates'
import { NovoLogo } from './NovoLogo'
import type { TemplateId } from '../types'

export function NovoLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { session, profile, loading } = useAuth()

  // Provision this week's missions once per session so tracker pages can
  // progress them even when the user skips the dashboard.
  useEffect(() => {
    if (!session?.user || !profile) return
    ensureWeeklyMissions(session.user.id, (profile.owned_templates ?? []) as TemplateId[])
  }, [session?.user?.id, profile?.owned_templates?.length])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: '#F5F4F2' }}>
        <NovoLogo size={28} withName />
      </div>
    )
  }

  if (!session) return <Navigate to="/studios/login" replace />

  const owned = profile?.owned_templates ?? []
  const displayName = session.user.email ?? ''

  const handleLogout = async () => {
    await logout()
    navigate('/studios')
  }

  const isActive = (path: string) => location.pathname === path
  const close = () => setDrawerOpen(false)

  function SidebarContent() {
    return (
      <>
        <div className="flex-1 overflow-y-auto p-4 pt-5 space-y-0.5">
          <div className="text-xs text-[#09090F]/40 font-nunito font-bold uppercase tracking-widest mb-3 px-2">
            Your apps
          </div>

          <button
            onClick={() => { navigate('/studios/dashboard'); close() }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition ${isActive('/studios/dashboard') ? 'bg-black/8' : 'hover:bg-black/5'}`}
          >
            <span className="text-base">🏠</span>
            <span className="font-nunito text-sm font-semibold text-[#09090F]">Dashboard</span>
          </button>

          <button
            onClick={() => { navigate('/studios/impact'); close() }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition ${isActive('/studios/impact') ? 'bg-black/8' : 'hover:bg-black/5'}`}
          >
            <span className="text-base">👑</span>
            <div>
              <span className="font-nunito text-sm font-semibold text-[#09090F]">Impact</span>
              {(profile?.crowns ?? 0) > 0 && (
                <span className="ml-2 text-xs font-nunito font-bold" style={{ color: '#7C3AED' }}>{profile?.crowns}</span>
              )}
            </div>
          </button>

          {TEMPLATES.map(t => {
            const isOwned = owned.includes(t.id)
            const active = isActive(t.route)
            return (
              <button
                key={t.id}
                onClick={() => { if (isOwned) { navigate(t.route); close() } }}
                disabled={!isOwned}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition
                  ${active ? 'bg-black/8' : isOwned ? 'hover:bg-black/5' : 'opacity-40 cursor-not-allowed'}`}
              >
                <span className="text-base">{t.emoji}</span>
                <div>
                  <div className="font-nunito text-sm font-semibold text-[#09090F]">{t.name}</div>
                  {isOwned
                    ? <div className="text-xs font-nunito" style={{ color: t.accent }}>Unlocked</div>
                    : <div className="text-xs text-[#09090F]/40 font-nunito">Locked</div>
                  }
                </div>
              </button>
            )
          })}
        </div>

        <div className="p-4 border-t" style={{ borderColor: '#E5E4E2' }}>
          <div className="px-3 py-2.5 mb-2 rounded-lg" style={{ background: '#EDECE9' }}>
            <div className="text-xs text-[#09090F]/50 font-nunito">Logged in as</div>
            <div className="text-[#09090F] font-nunito text-sm font-semibold">{displayName}</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-[#09090F]/50 hover:text-[#09090F] font-nunito text-xs transition"
          >
            Sign out →
          </button>
        </div>
      </>
    )
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: '#F5F4F2' }}>

      {/* Fixed top bar */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4"
        style={{
          height: 56,
          background: 'rgba(245,244,242,0.97)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #E5E4E2',
        }}
      >
        <button
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-black/5 transition text-[#09090F]/70 text-lg"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
        >
          ☰
        </button>
        <div className="hidden md:flex items-center">
          <NovoLogo size={22} withName withTagline />
        </div>
        <div className="md:hidden">
          <NovoLogo size={20} withName withTagline />
        </div>
        <div className="hidden md:block text-xs font-nunito text-[#09090F]/50">{displayName}</div>
        <div className="md:hidden w-9" />
      </header>

      <div className="flex flex-1 overflow-hidden" style={{ paddingTop: 56 }}>
        <aside
          className="hidden md:flex w-56 flex-col h-full"
          style={{ background: '#F5F4F2', borderRight: '1px solid #E5E4E2' }}
        >
          <SidebarContent />
        </aside>
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>

      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={close}
        />
      )}

      <div
        className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col w-64 md:hidden transition-transform duration-300 ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: '#F5F4F2', borderRight: '1px solid #E5E4E2' }}
      >
        <div
          className="flex items-center justify-between px-4 border-b flex-shrink-0"
          style={{ height: 56, borderColor: '#E5E4E2' }}
        >
          <NovoLogo size={22} withName />
          <button
            onClick={close}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 text-[#09090F]/60 transition"
          >
            ✕
          </button>
        </div>
        <SidebarContent />
      </div>

    </div>
  )
}
