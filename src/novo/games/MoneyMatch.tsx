import { useState, useEffect } from 'react'

const CARD_EMOJIS = ['💰', '🪙', '💎', '💳', '🏦', '📈', '💵', '🏧']

interface Card {
  id: number
  emoji: string
  flipped: boolean
  matched: boolean
}

interface Props {
  onXPEarned: (xp: number) => void
}

export default function MoneyMatch({ onXPEarned }: Props) {
  const [cards, setCards] = useState<Card[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [matches, setMatches] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)
  const [startTime, setStartTime] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [checking, setChecking] = useState(false)

  const initGame = () => {
    const pairs = [...CARD_EMOJIS, ...CARD_EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }))
    setCards(pairs)
    setSelected([])
    setMoves(0)
    setMatches(0)
    setDone(false)
    setStartTime(Date.now())
    setElapsed(0)
    setPlaying(true)
  }

  // Timer
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000)
    return () => clearInterval(interval)
  }, [playing, startTime])

  const flipCard = (id: number) => {
    if (checking) return
    const card = cards.find(c => c.id === id)
    if (!card || card.flipped || card.matched || selected.length >= 2) return

    const newSelected = [...selected, id]
    setCards(prev => prev.map(c => c.id === id ? { ...c, flipped: true } : c))
    setSelected(newSelected)

    if (newSelected.length === 2) {
      setMoves(m => m + 1)
      setChecking(true)
      const [a, b] = newSelected.map(sid => cards.find(c => c.id === sid)!)
      const isMatch = a.emoji === b.emoji

      setTimeout(() => {
        setCards(prev => prev.map(c => {
          if (newSelected.includes(c.id)) {
            return isMatch ? { ...c, matched: true } : { ...c, flipped: false }
          }
          return c
        }))
        if (isMatch) {
          const newMatches = matches + 1
          setMatches(newMatches)
          if (newMatches === CARD_EMOJIS.length) {
            setPlaying(false)
            setDone(true)
          }
        }
        setSelected([])
        setChecking(false)
      }, 700)
    }
  }

  const xpEarned = () => {
    const base = 50
    const speedBonus = Math.max(0, 30 - elapsed) * 2
    const movePenalty = Math.max(0, moves - CARD_EMOJIS.length) * 2
    return Math.max(10, base + speedBonus - movePenalty)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {playing && (
        <div className="flex gap-6 font-fredoka text-base text-gray-600">
          <span>Moves: <span className="text-purple-500 font-bold">{moves}</span></span>
          <span>Pairs: <span className="text-emerald-500 font-bold">{matches}/{CARD_EMOJIS.length}</span></span>
          <span>Time: <span className="text-amber-500 font-bold">{elapsed}s</span></span>
        </div>
      )}

      {!playing && !done && (
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="text-5xl">🃏</div>
          <div className="font-fredoka text-xl text-gray-700">Money Match!</div>
          <p className="text-sm text-gray-500 text-center">Flip cards to find matching pairs. Fewer moves = more XP!</p>
          <button onClick={initGame} className="px-6 py-2 bg-amber-400 hover:bg-amber-500 text-white font-fredoka text-lg rounded-full shadow transition">
            Deal Cards! 🃏
          </button>
        </div>
      )}

      {playing && (
        <div className="grid grid-cols-4 gap-2 w-full max-w-xs">
          {cards.map(card => (
            <button
              key={card.id}
              className={`h-14 rounded-xl text-2xl font-bold transition-all duration-300 border-2 ${
                card.matched
                  ? 'bg-emerald-100 border-emerald-300 scale-95 opacity-60'
                  : card.flipped
                  ? 'bg-amber-50 border-amber-300 shadow-md'
                  : 'bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50 shadow'
              }`}
              onClick={() => flipCard(card.id)}
            >
              {card.flipped || card.matched ? card.emoji : '❓'}
            </button>
          ))}
        </div>
      )}

      {done && (
        <div className="flex flex-col items-center gap-2 py-4">
          <div className="text-5xl">🏆</div>
          <div className="font-fredoka text-2xl text-gray-800">You matched them all!</div>
          <div className="font-nunito text-gray-600">{moves} moves in {elapsed}s</div>
          <div className="font-nunito text-sm text-emerald-600 font-bold">+{xpEarned()} XP earned!</div>
          <div className="flex gap-2 mt-1">
            <button onClick={() => { onXPEarned(xpEarned()); setDone(false) }} className="px-5 py-1.5 bg-emerald-400 text-white font-fredoka rounded-full">Claim XP!</button>
            <button onClick={initGame} className="px-5 py-1.5 bg-gray-200 text-gray-700 font-fredoka rounded-full">Play Again</button>
          </div>
        </div>
      )}
    </div>
  )
}
