import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getProfile, createProfile, isUsernameTaken } from '../lib/storage'
import { NovoLogo } from '../components/NovoLogo'

// After Google OAuth, Supabase redirects here. We check if the user already
// has a profile; if not, we show the onboarding form.

const INDONESIA_PROVINCES = [
  'Aceh','Bali','Banten','Bengkulu','DI Yogyakarta','DKI Jakarta','Gorontalo',
  'Jambi','Jawa Barat','Jawa Tengah','Jawa Timur','Kalimantan Barat',
  'Kalimantan Selatan','Kalimantan Tengah','Kalimantan Timur','Kalimantan Utara',
  'Kepulauan Bangka Belitung','Kepulauan Riau','Lampung','Maluku','Maluku Utara',
  'Nusa Tenggara Barat','Nusa Tenggara Timur','Papua','Papua Barat',
  'Papua Barat Daya','Papua Pegunungan','Papua Selatan','Papua Tengah',
  'Riau','Sulawesi Barat','Sulawesi Selatan','Sulawesi Tengah',
  'Sulawesi Tenggara','Sulawesi Utara','Sumatera Barat','Sumatera Selatan',
  'Sumatera Utara',
]

function OnboardingForm({ userId, onDone }: { userId: string; onDone: () => void }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [age, setAge] = useState('')
  const [location, setLocation] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const inputCls = "w-full px-0 py-3 bg-transparent border-b-2 border-gray-300 font-nunito text-gray-900 outline-none transition text-base"
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.currentTarget.style.borderBottomColor = '#7C3AED')
  const onBlur  = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.currentTarget.style.borderBottomColor = '#D1D5DB')
  const labelCls = "block text-xs font-nunito font-bold text-gray-400 uppercase tracking-widest mb-2"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!firstName.trim() || !lastName.trim()) return
    setLoading(true)

    const base = (firstName + lastName).toLowerCase().replace(/[^a-z0-9]/g, '')
    let username = base
    if (await isUsernameTaken(username)) {
      username = base + Math.floor(Math.random() * 9000 + 1000)
    }

    const { error: err } = await createProfile(
      userId,
      username,
      `${firstName.trim()} ${lastName.trim()}`,
      age ? parseInt(age) : null,
      location,
    )
    if (err) { setError(err); setLoading(false); return }
    onDone()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#F5F4F2' }}>
      <div className="w-full max-w-sm">
        <div className="mb-2"><NovoLogo size={26} withName /></div>
        <div className="mb-8 mt-8">
          <h2 className="font-display text-gray-900 mb-2" style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}>
            Almost there.
          </h2>
          <p className="text-gray-400 font-nunito text-sm">Tell us a little about yourself to get started.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={labelCls}>First name <span className="text-purple-500">*</span></label>
            <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required
              placeholder="e.g. Stevia" className={inputCls} onFocus={onFocus} onBlur={onBlur} />
          </div>
          <div>
            <label className={labelCls}>Last name <span className="text-purple-500">*</span></label>
            <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required
              placeholder="e.g. Putri" className={inputCls} onFocus={onFocus} onBlur={onBlur} />
          </div>
          <div>
            <label className={labelCls}>Age</label>
            <input type="number" value={age} onChange={e => setAge(e.target.value)}
              min="1" max="120" step="1"
              onKeyDown={e => ['e','E','+','-','.'].includes(e.key) && e.preventDefault()}
              placeholder="Optional" className={inputCls} onFocus={onFocus} onBlur={onBlur} />
          </div>
          <div>
            <label className={labelCls}>Province</label>
            <select value={location} onChange={e => setLocation(e.target.value)}
              className={inputCls + ' appearance-none cursor-pointer'}
              onFocus={onFocus} onBlur={onBlur}
            >
              <option value="">Select province (optional)</option>
              {INDONESIA_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {error && <p className="text-sm font-nunito text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading || !firstName.trim() || !lastName.trim()}
            className="w-full py-4 text-white font-nunito font-bold text-sm rounded-xl transition hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: '#7C3AED' }}
          >
            {loading ? 'Setting up...' : 'Start playing →'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AuthCallback() {
  const navigate = useNavigate()
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        navigate('/studios/login')
        return
      }
      const profile = await getProfile(session.user.id)
      if (profile) {
        navigate('/studios/dashboard')
      } else {
        setUserId(session.user.id)
      }
    })
  }, [navigate])

  if (userId) {
    return <OnboardingForm userId={userId} onDone={() => navigate('/studios/dashboard')} />
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#09090F' }}>
      <div className="text-center">
        <NovoLogo size={32} withName dark />
        <p className="mt-6 font-nunito text-gray-500 text-sm">Signing you in…</p>
      </div>
    </div>
  )
}
