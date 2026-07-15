import { useState, useEffect, useRef } from 'react'

type MailKind = 'offer' | 'spam' | 'scam'

interface Mail {
  id: number
  kind: MailKind
  expiresAt?: number
}

interface Props {
  onXPEarned: (xp: number) => void
}

const MAIL_META: Record<MailKind, { emoji: string; label: string }> = {
  offer: { emoji: '💌', label: 'Client offer' },
  spam:  { emoji: '📧', label: 'Spam' },
  scam:  { emoji: '💸', label: '"Get rich quick!!"' },
}

const STACK_CAP = 8

export default function InboxZero({ onXPEarned }: Props) {
  const [mails, setMails] = useState<Mail[]>([])
  const [score, setScore] = useState(0)
  const [jammed, setJammed] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)
  const mailId = useRef(0)
  const jammedRef = useRef(false)
  jammedRef.current = jammed

  const start = () => {
    setMails([])
    setScore(0)
    setJammed(false)
    setTimeLeft(30)
    setDone(false)
    setPlaying(true)
  }

  // New mail arrives faster as time runs down; scams auto-expire
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      const r = Math.random()
      const kind: MailKind = r < 0.45 ? 'offer' : r < 0.75 ? 'spam' : 'scam'
      setMails(prev => {
        const next: Mail[] = [
          { id: mailId.current++, kind, expiresAt: kind === 'scam' ? Date.now() + 3000 : undefined },
          ...prev,
        ]
        if (next.length >= STACK_CAP) {
          // Inbox overflow: jam input briefly and lose the oldest half
          setJammed(true)
          setScore(s => Math.max(0, s - 10))
          setTimeout(() => setJammed(false), 1500)
          return next.slice(0, Math.floor(STACK_CAP / 2))
        }
        return next
      })
    }, Math.max(450, 800 - (30 - timeLeft) * 10))
    return () => clearInterval(interval)
  }, [playing, timeLeft])

  // Expire scams on their own (that's the safe outcome)
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      const now = Date.now()
      setMails(prev => prev.filter(m => !m.expiresAt || m.expiresAt > now))
    }, 250)
    return () => clearInterval(interval)
  }, [playing])

  // Timer
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setPlaying(false)
          setDone(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [playing])

  const open = (m: Mail) => {
    if (jammedRef.current) return
    setMails(prev => prev.filter(x => x.id !== m.id))
    if (m.kind === 'offer') setScore(s => s + 10)
    else if (m.kind === 'spam') setScore(s => s + 5)
    else setScore(s => Math.max(0, s - 15))
  }

  const handleClaim = () => {
    onXPEarned(Math.floor(score / 10))
    setDone(false)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full max-w-sm px-1">
        <div className="font-fredoka text-lg text-gray-700">Score: <span className="text-sky-500">{score}</span></div>
        <div className="font-fredoka text-sm text-gray-500">Inbox {mails.length}/{STACK_CAP}</div>
        <div className="font-fredoka text-lg text-gray-700">Time: <span className={timeLeft <= 5 ? 'text-red-500' : 'text-emerald-500'}>{timeLeft}s</span></div>
      </div>

      <div
        className="relative w-full max-w-sm rounded-2xl border-2 border-sky-200 overflow-hidden select-none"
        style={{ height: 220, background: 'linear-gradient(to bottom, #F0F9FF, #E0F2FE)' }}
      >
        {!playing && !done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
            <div className="text-5xl">📥</div>
            <div className="font-fredoka text-xl text-gray-700">Inbox Zero!</div>
            <p className="text-sm text-gray-500 text-center px-4">Open client offers, trash the spam. Never touch the scams!</p>
            <button onClick={start} className="px-6 py-2 bg-sky-400 hover:bg-sky-500 text-white font-fredoka text-lg rounded-full shadow transition">
              Play! 🎮
            </button>
          </div>
        )}

        {playing && (
          <div className="absolute inset-0 p-2 flex flex-col gap-1 overflow-hidden" style={{ filter: jammed ? 'grayscale(1)' : 'none' }}>
            {jammed && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
                <span className="font-fredoka text-xl text-red-500">📛 INBOX OVERFLOW!</span>
              </div>
            )}
            {mails.map(m => (
              <button
                key={m.id}
                onClick={() => open(m)}
                className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white border border-sky-100 text-left hover:border-sky-400 active:scale-[0.98] transition bounce-in"
              >
                <span className="text-lg">{MAIL_META[m.kind].emoji}</span>
                <span className="font-nunito text-xs text-gray-600 flex-1 truncate">{MAIL_META[m.kind].label}</span>
                {m.kind === 'scam' && <span className="font-nunito text-[10px] text-red-400">suspicious…</span>}
              </button>
            ))}
          </div>
        )}

        {done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur z-10">
            <div className="text-4xl">🏝️</div>
            <div className="font-fredoka text-2xl text-gray-800">Inbox zero!</div>
            <div className="font-nunito text-lg text-gray-600">Score: <span className="font-bold text-sky-500">{score}</span></div>
            <div className="font-nunito text-sm text-emerald-600">+{Math.floor(score / 10)} XP earned!</div>
            <div className="flex gap-2 mt-1">
              <button onClick={handleClaim} className="px-5 py-1.5 bg-emerald-400 text-white font-fredoka text-base rounded-full">Claim XP!</button>
              <button onClick={start} className="px-5 py-1.5 bg-gray-200 text-gray-700 font-fredoka text-base rounded-full">Retry</button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 font-nunito">
        💌 +10 · 📧 +5 · 💸 −15 (let scams expire!) · Overflow −10 & jam | Every 10 pts = 1 XP
      </p>
    </div>
  )
}
