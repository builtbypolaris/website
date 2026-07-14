import { useState, useEffect } from 'react'

interface Props {
  onXPEarned: (xp: number) => void
}

const WORDS: { word: string; hint: string }[] = [
  { word: 'CAT', hint: '🐱' }, { word: 'DOG', hint: '🐶' }, { word: 'SUN', hint: '☀️' },
  { word: 'BEE', hint: '🐝' }, { word: 'CUP', hint: '🥤' }, { word: 'HAT', hint: '🎩' },
  { word: 'STAR', hint: '⭐' }, { word: 'MOON', hint: '🌙' }, { word: 'FISH', hint: '🐟' },
  { word: 'BEAR', hint: '🐻' }, { word: 'CAKE', hint: '🎂' }, { word: 'DUCK', hint: '🦆' },
  { word: 'APPLE', hint: '🍎' }, { word: 'TRAIN', hint: '🚂' }, { word: 'HORSE', hint: '🐴' },
  { word: 'HEART', hint: '❤️' }, { word: 'CLOUD', hint: '☁️' }, { word: 'TIGER', hint: '🐯' },
]

function shuffle(word: string): string[] {
  const letters = word.split('')
  do {
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[letters[i], letters[j]] = [letters[j], letters[i]]
    }
  } while (letters.join('') === word && word.length > 1)
  return letters
}

export default function BlockStacker({ onXPEarned }: Props) {
  const [wordIdx, setWordIdx] = useState(0)
  const [blocks, setBlocks] = useState<string[]>([])
  const [picked, setPicked] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [solved, setSolved] = useState(0)
  const [shake, setShake] = useState(false)
  const [timeLeft, setTimeLeft] = useState(45)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)

  const currentWord = WORDS[wordIdx]

  const nextWord = (solvedCount: number) => {
    // Words grow with progress: 3-letter → 4 → 5
    const pool = WORDS.filter(w =>
      solvedCount < 3 ? w.word.length === 3 : solvedCount < 6 ? w.word.length === 4 : w.word.length === 5)
    const pick = pool[Math.floor(Math.random() * pool.length)]
    setWordIdx(WORDS.indexOf(pick))
    setBlocks(shuffle(pick.word))
    setPicked([])
  }

  const start = () => {
    setScore(0)
    setSolved(0)
    setTimeLeft(45)
    setDone(false)
    setPlaying(true)
    nextWord(0)
  }

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

  const pick = (i: number) => {
    if (!playing || picked.includes(i)) return
    const expected = currentWord.word[picked.length]
    if (blocks[i] === expected) {
      const nextPicked = [...picked, i]
      if (nextPicked.length === currentWord.word.length) {
        const gained = 20 + (currentWord.word.length - 3) * 10
        setScore(s => s + gained)
        const newSolved = solved + 1
        setSolved(newSolved)
        setTimeLeft(t => t + 5)
        nextWord(newSolved)
      } else {
        setPicked(nextPicked)
      }
    } else {
      setShake(true)
      setScore(s => Math.max(0, s - 3))
      setTimeout(() => setShake(false), 300)
    }
  }

  const handleClaim = () => {
    onXPEarned(Math.floor(score / 10))
    setDone(false)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full max-w-sm px-1">
        <div className="font-fredoka text-lg text-gray-700">Score: <span className="text-fuchsia-600">{score}</span></div>
        <div className="font-fredoka text-sm text-gray-500">{solved} words</div>
        <div className="font-fredoka text-lg text-gray-700">Time: <span className={timeLeft <= 8 ? 'text-red-500' : 'text-emerald-500'}>{timeLeft}s</span></div>
      </div>

      <div
        className="relative w-full max-w-sm rounded-2xl border-2 border-fuchsia-200 overflow-hidden select-none"
        style={{
          height: 220,
          background: 'linear-gradient(to bottom, #FDF4FF, #FAE8FF)',
          animation: shake ? 'shake 0.3s' : undefined,
        }}
      >
        {!playing && !done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
            <div className="text-5xl">🧱</div>
            <div className="font-fredoka text-xl text-gray-700">Block Stacker!</div>
            <p className="text-sm text-gray-500 text-center px-4">Tap the toy blocks in order to spell what you see!</p>
            <button onClick={start} className="px-6 py-2 bg-fuchsia-400 hover:bg-fuchsia-500 text-white font-fredoka text-lg rounded-full shadow transition">
              Play! 🎮
            </button>
          </div>
        )}

        {playing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="text-5xl">{currentWord.hint}</div>

            {/* Answer slots */}
            <div className="flex gap-1.5">
              {currentWord.word.split('').map((_, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-lg flex items-center justify-center font-fredoka text-lg"
                  style={{
                    background: i < picked.length ? '#F0ABFC' : 'white',
                    border: '2px solid #F0ABFC',
                    color: '#701A75',
                  }}
                >
                  {i < picked.length ? blocks[picked[i]] : ''}
                </div>
              ))}
            </div>

            {/* Letter blocks */}
            <div className="flex gap-1.5 flex-wrap justify-center px-4">
              {blocks.map((letter, i) => (
                <button
                  key={i}
                  onClick={() => pick(i)}
                  disabled={picked.includes(i)}
                  className="w-10 h-10 rounded-lg font-fredoka text-xl transition active:scale-90 disabled:opacity-20"
                  style={{
                    background: ['#FDE68A', '#BBF7D0', '#BAE6FD', '#FBCFE8', '#DDD6FE'][i % 5],
                    border: '2px solid rgba(0,0,0,0.08)',
                    color: '#3F3F46',
                  }}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>
        )}

        {done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur z-10">
            <div className="text-4xl">🏗️</div>
            <div className="font-fredoka text-2xl text-gray-800">Playtime's over!</div>
            <div className="font-nunito text-lg text-gray-600">Score: <span className="font-bold text-fuchsia-600">{score}</span> · {solved} words</div>
            <div className="font-nunito text-sm text-emerald-600">+{Math.floor(score / 10)} XP earned!</div>
            <div className="flex gap-2 mt-1">
              <button onClick={handleClaim} className="px-5 py-1.5 bg-emerald-400 text-white font-fredoka text-base rounded-full">Claim XP!</button>
              <button onClick={start} className="px-5 py-1.5 bg-gray-200 text-gray-700 font-fredoka text-base rounded-full">Retry</button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 font-nunito">
        Word = +20 (+10 per extra letter) & +5s · Wrong block −3 | Every 10 pts = 1 XP
      </p>
    </div>
  )
}
