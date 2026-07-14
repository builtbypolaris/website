import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  signInWithEmail, signUpWithEmail,
  mountGoogleButton, createProfile, isUsernameTaken, getProfile,
} from '../lib/storage'
import { supabase } from '../lib/supabase'
import { FINANCIAL_STAGES, TODO_STAGES, HABIT_STAGES } from '../data/creatures'
import { NovoLogo } from '../components/NovoLogo'

type Mode = 'signin' | 'signup'

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

// ── Onboarding form (shown after first sign-up) ────────────────────────────
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
        <div className="mb-2">
          <NovoLogo size={26} withName />
        </div>
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

// ── Main Login / Sign-up page ─────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [onboardingUserId, setOnboardingUserId] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    if (mode === 'signin') {
      const { data, error: err } = await signInWithEmail(email.trim(), password)
      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }
      // Users who confirmed their email but never finished onboarding land here
      const profile = data.user ? await getProfile(data.user.id) : null
      if (profile) navigate('/studios/dashboard')
      else if (data.user) setOnboardingUserId(data.user.id)
    } else {
      const { data, error: err } = await signUpWithEmail(email.trim(), password)
      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }
      // Only proceed to onboarding with a live session — without one the
      // profile insert would run unauthenticated and be rejected by RLS.
      if (data.session && data.user) {
        const profile = await getProfile(data.user.id)
        if (profile) {
          navigate('/studios/dashboard')
        } else {
          setOnboardingUserId(data.user.id)
        }
      } else if (data.user && data.user.identities?.length === 0) {
        // signUp with an already-registered email returns a stub user with no
        // identities (Supabase hides account existence) — send them to sign in
        setMode('signin')
        setError('This email is already registered — sign in with your password below.')
        setLoading(false)
      } else {
        // Email confirmation required (signUp returns a user but no session)
        setError('Check your email to confirm your account, then sign in.')
        setLoading(false)
      }
    }
  }

  const googleDivRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (onboardingUserId) return
    const el = googleDivRef.current
    if (!el) return
    const setup = () => {
      if (window.google?.accounts?.id) {
        mountGoogleButton(el, async (err) => {
          if (err) { setError(err.message); return }
          const { data: { session } } = await supabase.auth.getSession()
          if (!session?.user) return
          const profile = await getProfile(session.user.id)
          if (profile) navigate('/studios/dashboard')
          else setOnboardingUserId(session.user.id)
        })
      } else {
        setTimeout(setup, 300)
      }
    }
    setup()
  }, [onboardingUserId, navigate])

  if (onboardingUserId) {
    return (
      <OnboardingForm
        userId={onboardingUserId}
        onDone={() => navigate('/studios/dashboard')}
      />
    )
  }

  const inputCls = "w-full px-0 py-3 bg-transparent border-b-2 border-gray-300 font-nunito text-gray-900 outline-none transition text-base"
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderBottomColor = '#7C3AED')
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderBottomColor = '#D1D5DB')
  const labelCls = "block text-xs font-nunito font-bold text-gray-400 uppercase tracking-widest mb-2"

  return (
    <div className="min-h-screen flex" style={{ background: '#09090F' }}>
      {/* LEFT: brand panel */}
      <div
        className="hidden md:flex flex-col justify-between w-2/5 p-10"
        style={{ background: '#09090F', borderRight: '1px solid #1C1C28' }}
      >
        <NovoLogo size={28} withName withTagline dark />

        <div>
          <h1 className="font-display text-white leading-tight mb-5" style={{ fontSize: 'clamp(40px, 5vw, 64px)' }}>
            Track.<br />
            Play.<br />
            <span style={{ color: '#A78BFA' }}>Evolve.</span>
          </h1>
          <p className="text-gray-500 font-nunito text-sm leading-relaxed max-w-xs">
            Three productivity trackers, nine mini-games, and creatures that grow with your habits.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { emoji: FINANCIAL_STAGES[4].emoji, name: FINANCIAL_STAGES[4].name, label: 'Financial Pet', accent: '#F59E0B' },
              { emoji: TODO_STAGES[6].emoji, name: TODO_STAGES[6].name, label: 'Task Pet', accent: '#4ADE80' },
              { emoji: HABIT_STAGES[5].emoji, name: HABIT_STAGES[5].name, label: 'Habit Pet', accent: '#60A5FA' },
            ].map(c => (
              <div key={c.label} className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: c.accent + '18', border: `1px solid ${c.accent}35` }}
                >
                  {c.emoji}
                </div>
                <div>
                  <div className="text-white font-nunito text-sm font-semibold">{c.label}</div>
                  <div className="font-nunito text-xs" style={{ color: c.accent }}>{c.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs font-nunito" style={{ color: '#252535' }}>Novo · built by Polaris Studio</div>
      </div>

      {/* RIGHT: form */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16" style={{ background: '#F5F4F2' }}>
        <div className="md:hidden mb-8">
          <NovoLogo size={26} withName />
        </div>

        <div className="max-w-sm w-full mx-auto md:mx-0">
          <div className="mb-8">
            <h2 className="font-display text-gray-900 mb-2" style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}>
              {mode === 'signin' ? 'Welcome back.' : 'Join Novo.'}
            </h2>
            <p className="text-gray-400 font-nunito text-sm">
              {mode === 'signin' ? 'Your creatures missed you.' : 'Create an account to start tracking.'}
            </p>
          </div>

          {/* Google button — our visual layer on top, Google's real button underneath */}
          <div className="relative mb-6" style={{ minHeight: '44px' }}>
            <div ref={googleDivRef} className="overflow-hidden rounded-xl" />
            <div
              className="absolute inset-0 flex items-center justify-center gap-3 rounded-xl border font-nunito font-semibold text-sm text-gray-700"
              style={{ borderColor: '#D1D5DB', background: 'white', pointerEvents: 'none' }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs font-nunito text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={labelCls}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={inputCls}
                onFocus={onFocus}
                onBlur={onBlur}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label className={labelCls}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={inputCls}
                onFocus={onFocus}
                onBlur={onBlur}
                placeholder="Min 6 characters"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                required
              />
            </div>
            {mode === 'signup' && (
              <div>
                <label className={labelCls}>Confirm password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className={inputCls}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  required
                />
              </div>
            )}

            {error && <p className="text-sm font-nunito text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-4 text-white font-nunito font-bold text-sm rounded-xl transition hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: '#7C3AED' }}
            >
              {loading
                ? (mode === 'signin' ? 'Signing in...' : 'Creating account...')
                : (mode === 'signin' ? 'Sign in' : 'Create account')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm font-nunito text-gray-400">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }}
              className="text-purple-600 font-semibold hover:text-purple-800 transition"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          <button
            onClick={() => navigate('/studios')}
            className="mt-4 text-xs font-nunito text-gray-400 hover:text-gray-700 transition block text-center w-full"
          >
            ← Back to store
          </button>
        </div>
      </div>
    </div>
  )
}
