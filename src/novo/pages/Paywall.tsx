import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getTemplate, LYNK_STORE_URL, TRACKER_PRICE_IDR } from '../data/templates'
import type { TemplateId } from '../types'

export function PaywallGuard({ trackerId, children }: { trackerId: TemplateId; children: React.ReactNode }) {
  const { profile } = useAuth()
  const owned = profile?.owned_templates ?? []
  if (owned.includes(trackerId)) return <>{children}</>
  return <PaywallUI trackerId={trackerId} />
}

function PaywallUI({ trackerId }: { trackerId: TemplateId }) {
  const { session, refreshProfile } = useAuth()
  const [checking, setChecking] = useState(false)
  const [checked, setChecked] = useState(false)

  const template = getTemplate(trackerId)
  const buyUrl = template.lynkUrl ?? LYNK_STORE_URL
  const email = session?.user.email ?? ''

  const handleBuy = () => {
    window.open(buyUrl, '_blank', 'noopener,noreferrer')
  }

  const handleCheckAgain = async () => {
    setChecking(true)
    await refreshProfile()
    setChecking(false)
    setChecked(true)
    setTimeout(() => setChecked(false), 3000)
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8 h-full">
      <div className="max-w-sm w-full">
        <div className="text-5xl text-center mb-4">{template.emoji}</div>
        <h2 className="font-display text-3xl text-center text-[#09090F] mb-2">
          {template.shortName} Tracker
        </h2>
        <p className="text-center text-[#09090F]/50 font-nunito text-sm mb-8">
          Unlock this tracker to start using it. One-time payment, yours forever.
        </p>

        <button
          onClick={handleBuy}
          className="w-full p-5 rounded-2xl text-left transition hover:brightness-110 active:scale-[0.99]"
          style={{ background: '#7C3AED' }}
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="font-nunito font-bold text-white">Buy on Lynk.id ↗</div>
              <div className="font-nunito text-xs text-purple-200 mt-0.5">One-time payment · yours forever</div>
            </div>
            <div className="font-nunito font-bold text-xl text-white">
              Rp {TRACKER_PRICE_IDR.toLocaleString('id-ID')}
            </div>
          </div>
        </button>

        <div
          className="mt-4 p-4 rounded-xl text-xs font-nunito leading-relaxed"
          style={{ background: '#F0EEE8', border: '1px solid #E5E4E2' }}
        >
          <strong className="text-[#09090F]">How it works:</strong>{' '}
          <span className="text-[#09090F]/60">
            Complete your purchase on Lynk.id and include your Novo account email
            {email && <> (<span className="font-semibold text-[#09090F]">{email}</span>)</>}{' '}
            in the checkout note. Your tracker is unlocked shortly after, usually within a few hours.
          </span>
        </div>

        <button
          onClick={handleCheckAgain}
          disabled={checking}
          className="w-full mt-3 py-2.5 rounded-xl font-nunito text-sm text-[#09090F]/60 hover:text-[#09090F] transition disabled:opacity-50"
          style={{ background: 'transparent', border: '1px solid #E5E4E2' }}
        >
          {checking ? 'Checking…' : checked ? 'Not unlocked yet, check back soon!' : "I've paid, check again"}
        </button>

        <p className="mt-6 text-center text-xs font-nunito text-[#09090F]/30">
          Secured by Lynk.id · QRIS, e-wallets, bank transfer & more
        </p>
      </div>
    </div>
  )
}
