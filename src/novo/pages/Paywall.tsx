import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { createPaymentOrder } from '../lib/storage'

declare global {
  interface Window {
    snap?: {
      pay(token: string, options: {
        onSuccess?: (r: unknown) => void
        onPending?: (r: unknown) => void
        onError?: (r: unknown) => void
        onClose?: () => void
      }): void
    }
  }
}

const TRACKER_META: Record<string, { name: string; emoji: string; color: string }> = {
  financial: { name: 'Financial', emoji: '💰', color: '#B45309' },
  todo:      { name: 'Todo',      emoji: '✅', color: '#16A34A' },
  habit:     { name: 'Habit',     emoji: '🌿', color: '#1D4ED8' },
}

export function PaywallGuard({ trackerId, children }: { trackerId: string; children: React.ReactNode }) {
  const { profile } = useAuth()
  const owned = profile?.owned_templates ?? []
  if (owned.includes(trackerId)) return <>{children}</>
  return <PaywallUI trackerId={trackerId} />
}

function PaywallUI({ trackerId }: { trackerId: string }) {
  const { session, refreshProfile } = useAuth()
  const [loading, setLoading] = useState<'single' | 'bundle' | null>(null)
  const [error, setError] = useState('')

  const meta = TRACKER_META[trackerId] ?? { name: trackerId, emoji: '🔒', color: '#7C3AED' }

  const handleBuy = async (plan: '1tracker' | '3trackers') => {
    if (!session) return
    setLoading(plan === '1tracker' ? 'single' : 'bundle')
    setError('')
    try {
      const { token } = await createPaymentOrder(
        session.access_token,
        plan,
        plan === '1tracker' ? trackerId : undefined,
      )
      window.snap?.pay(token, {
        onSuccess: async () => {
          await refreshProfile()
          setLoading(null)
        },
        onPending: () => setLoading(null),
        onError: () => {
          setError('Payment failed. Please try again.')
          setLoading(null)
        },
        onClose: () => setLoading(null),
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start payment. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8 h-full">
      <div className="max-w-sm w-full">
        <div className="text-5xl text-center mb-4">{meta.emoji}</div>
        <h2 className="font-display text-3xl text-center text-[#09090F] mb-2">
          {meta.name} Tracker
        </h2>
        <p className="text-center text-[#09090F]/50 font-nunito text-sm mb-8">
          Unlock this tracker to start using it. One-time payment, yours forever.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => handleBuy('1tracker')}
            disabled={!!loading}
            className="w-full p-5 rounded-2xl border-2 text-left transition hover:border-purple-400 disabled:opacity-50"
            style={{ borderColor: '#E5E4E2', background: 'white' }}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-nunito font-bold text-[#09090F]">This tracker only</div>
                <div className="font-nunito text-xs text-[#09090F]/40 mt-0.5">One-time payment</div>
              </div>
              <div className="font-nunito font-bold text-xl" style={{ color: '#7C3AED' }}>
                Rp 29,999
              </div>
            </div>
          </button>

          <button
            onClick={() => handleBuy('3trackers')}
            disabled={!!loading}
            className="w-full p-5 rounded-2xl text-left transition disabled:opacity-50"
            style={{ background: '#7C3AED' }}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-nunito font-bold text-white">All 3 trackers</div>
                  <span className="text-xs font-nunito font-bold bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full">
                    Best value
                  </span>
                </div>
                <div className="font-nunito text-xs text-purple-200 mt-0.5">Financial · Todo · Habit</div>
              </div>
              <div className="text-right ml-3 flex-shrink-0">
                <div className="font-nunito font-bold text-xl text-white">Rp 59,999</div>
                <div className="font-nunito text-xs text-purple-200">Save Rp 29,998</div>
              </div>
            </div>
          </button>
        </div>

        {loading && (
          <p className="mt-4 text-center text-sm font-nunito text-[#09090F]/50">
            Opening payment…
          </p>
        )}
        {error && (
          <p className="mt-4 text-center text-sm font-nunito text-red-500">{error}</p>
        )}

        <p className="mt-6 text-center text-xs font-nunito text-[#09090F]/30">
          Secured by Midtrans · GoPay, QRIS, bank transfer & more
        </p>
      </div>
    </div>
  )
}
