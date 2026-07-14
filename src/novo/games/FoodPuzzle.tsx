import { useState, useEffect } from 'react'

interface PuzzlePet {
  emoji: string
  name: string
  likes?: string
  dislikes?: string
  assigned: string | null
}

interface Props {
  onXPEarned: (xp: number) => void
}

const PETS = [
  { emoji: '🐶', name: 'Pup' }, { emoji: '🐱', name: 'Kitty' }, { emoji: '🐰', name: 'Bun' },
  { emoji: '🐹', name: 'Hammy' }, { emoji: '🦜', name: 'Rio' },
]
const FOODS = ['🍖', '🐟', '🥕', '🌰', '🍎', '🥬']

function makeRound(petCount: number): { pets: PuzzlePet[]; foods: string[] } {
  const chosenPets = [...PETS].sort(() => Math.random() - 0.5).slice(0, petCount)
  const chosenFoods = [...FOODS].sort(() => Math.random() - 0.5).slice(0, petCount)
  // A hidden valid assignment guarantees solvability: pet i ↔ food i
  const pets: PuzzlePet[] = chosenPets.map((p, i) => {
    const constraintRoll = Math.random()
    if (constraintRoll < 0.5) {
      // "likes" pins this pet to its own food
      return { ...p, likes: chosenFoods[i], assigned: null }
    }
    // "dislikes" rules out one of the other foods
    const others = chosenFoods.filter((_, j) => j !== i)
    return { ...p, dislikes: others[Math.floor(Math.random() * others.length)], assigned: null }
  })
  return { pets, foods: chosenFoods }
}

export default function FoodPuzzle({ onXPEarned }: Props) {
  const [pets, setPets] = useState<PuzzlePet[]>([])
  const [foods, setFoods] = useState<string[]>([])
  const [selectedFood, setSelectedFood] = useState<string | null>(null)
  const [petCount, setPetCount] = useState(3)
  const [score, setScore] = useState(0)
  const [solved, setSolved] = useState(0)
  const [shake, setShake] = useState(false)
  const [timeLeft, setTimeLeft] = useState(45)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)

  const newRound = (count: number) => {
    const round = makeRound(count)
    setPets(round.pets)
    setFoods(round.foods)
    setSelectedFood(null)
  }

  const start = () => {
    setPetCount(3)
    newRound(3)
    setScore(0)
    setSolved(0)
    setTimeLeft(45)
    setDone(false)
    setPlaying(true)
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

  const assign = (petIdx: number) => {
    if (!playing || !selectedFood) return
    const pet = pets[petIdx]
    // Check the pet's own constraint immediately
    if (pet.likes && selectedFood !== pet.likes) {
      setScore(s => Math.max(0, s - 5))
      setShake(true)
      setTimeout(() => setShake(false), 300)
      return
    }
    if (pet.dislikes && selectedFood === pet.dislikes) {
      setScore(s => Math.max(0, s - 5))
      setShake(true)
      setTimeout(() => setShake(false), 300)
      return
    }
    const nextPets = pets.map((p, i) => i === petIdx
      ? { ...p, assigned: selectedFood }
      : p.assigned === selectedFood ? { ...p, assigned: null } : p)
    setSelectedFood(null)

    if (nextPets.every(p => p.assigned !== null)) {
      // Everyone fed with no conflicts — round solved
      const gained = 30 + (petCount - 3) * 15
      setScore(s => s + gained)
      const newSolved = solved + 1
      setSolved(newSolved)
      setTimeLeft(t => t + 8)
      const nextCount = Math.min(5, 3 + Math.floor(newSolved / 2))
      setPetCount(nextCount)
      newRound(nextCount)
    } else {
      setPets(nextPets)
    }
  }

  const unassign = (petIdx: number) => {
    if (!playing || selectedFood) return
    setPets(prev => prev.map((p, i) => i === petIdx ? { ...p, assigned: null } : p))
  }

  const handleClaim = () => {
    onXPEarned(Math.floor(score / 10))
    setDone(false)
  }

  const usedFoods = new Set(pets.map(p => p.assigned).filter(Boolean))

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full max-w-sm px-1">
        <div className="font-fredoka text-lg text-gray-700">Score: <span className="text-yellow-600">{score}</span></div>
        <div className="font-fredoka text-sm text-gray-500">{solved} dinners</div>
        <div className="font-fredoka text-lg text-gray-700">Time: <span className={timeLeft <= 8 ? 'text-red-500' : 'text-emerald-500'}>{timeLeft}s</span></div>
      </div>

      <div
        className="relative w-full max-w-sm rounded-2xl border-2 border-yellow-200 overflow-hidden select-none"
        style={{
          minHeight: 220,
          background: 'linear-gradient(to bottom, #FEFCE8, #FEF9C3)',
          animation: shake ? 'shake 0.3s' : undefined,
        }}
      >
        {!playing && !done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
            <div className="text-5xl">🍽️</div>
            <div className="font-fredoka text-xl text-gray-700">Food Puzzle!</div>
            <p className="text-sm text-gray-500 text-center px-4">Pick a bowl, then serve it to a pet — respect every like and dislike!</p>
            <button onClick={start} className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-fredoka text-lg rounded-full shadow transition">
              Play! 🎮
            </button>
          </div>
        )}

        {playing && (
          <div className="p-3 flex flex-col gap-2.5">
            {/* Food bowls */}
            <div className="flex justify-center gap-2">
              {foods.map(f => (
                <button
                  key={f}
                  onClick={() => setSelectedFood(selectedFood === f ? null : f)}
                  disabled={usedFoods.has(f)}
                  className="w-11 h-11 rounded-full text-xl transition active:scale-90 disabled:opacity-25"
                  style={{
                    background: 'white',
                    border: selectedFood === f ? '3px solid #CA8A04' : '2px solid #FDE68A',
                    boxShadow: selectedFood === f ? '0 0 10px rgba(202,138,4,0.4)' : 'none',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="text-center font-nunito text-[10px] text-yellow-600">
              {selectedFood ? 'now tap a pet to serve!' : 'tap a bowl to pick it up · tap a served pet to take it back'}
            </div>

            {/* Pets */}
            <div className="flex flex-col gap-1.5">
              {pets.map((p, i) => (
                <button
                  key={p.name}
                  onClick={() => p.assigned && !selectedFood ? unassign(i) : assign(i)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white border-2 transition active:scale-[0.98]"
                  style={{ borderColor: p.assigned ? '#4ADE80' : '#FDE68A' }}
                >
                  <span className="text-2xl">{p.emoji}</span>
                  <div className="flex-1 text-left">
                    <div className="font-nunito text-xs font-bold text-gray-700">{p.name}</div>
                    <div className="font-nunito text-[10px] text-gray-400">
                      {p.likes && <>only eats {p.likes}</>}
                      {p.dislikes && <>refuses {p.dislikes}</>}
                    </div>
                  </div>
                  <span className="text-xl">{p.assigned ?? '⬜'}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur z-10">
            <div className="text-4xl">🥣</div>
            <div className="font-fredoka text-2xl text-gray-800">Dinner served!</div>
            <div className="font-nunito text-lg text-gray-600">Score: <span className="font-bold text-yellow-600">{score}</span> · {solved} rounds</div>
            <div className="font-nunito text-sm text-emerald-600">+{Math.floor(score / 10)} XP earned!</div>
            <div className="flex gap-2 mt-1">
              <button onClick={handleClaim} className="px-5 py-1.5 bg-emerald-400 text-white font-fredoka text-base rounded-full">Claim XP!</button>
              <button onClick={start} className="px-5 py-1.5 bg-gray-200 text-gray-700 font-fredoka text-base rounded-full">Retry</button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 font-nunito">
        Everyone fed = +30 (+15 per extra pet) & +8s · Wrong serve −5 | Every 10 pts = 1 XP
      </p>
    </div>
  )
}
