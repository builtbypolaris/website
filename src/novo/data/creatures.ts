import type { CreatureStage } from '../types'

export const FINANCIAL_STAGES: CreatureStage[] = [
  { id: 0, emoji: '🪙', name: 'Baby Coin', color: '#FDE68A', glow: '#F59E0B', description: 'A tiny coin just starting to roll', xpRequired: 0 },
  { id: 1, emoji: '🐷', name: 'Lucky Piggy', color: '#FBCFE8', glow: '#EC4899', description: 'A pink pig who saves every penny', xpRequired: 100 },
  { id: 2, emoji: '🦊', name: 'Sly Fox', color: '#FED7AA', glow: '#F97316', description: 'A clever fox who knows good deals', xpRequired: 300 },
  { id: 3, emoji: '🦝', name: 'Rich Raccoon', color: '#D1FAE5', glow: '#10B981', description: 'A savvy raccoon collecting treasures', xpRequired: 600 },
  { id: 4, emoji: '🐻', name: 'Thrifty Bear', color: '#D97706', glow: '#B45309', description: 'A big bear guarding a mountain of savings', xpRequired: 1000 },
  { id: 5, emoji: '🦁', name: 'Pride Lion', color: '#FCD34D', glow: '#EAB308', description: 'A majestic lion ruling the financial savanna', xpRequired: 1600 },
  { id: 6, emoji: '🐉', name: 'Jade Dragon', color: '#6EE7B7', glow: '#059669', description: 'A mystical dragon hoarding golden wisdom', xpRequired: 2400 },
  { id: 7, emoji: '🔮', name: 'Fortune Oracle', color: '#C4B5FD', glow: '#7C3AED', description: 'An all-seeing oracle of wealth', xpRequired: 3400 },
  { id: 8, emoji: '💎', name: 'Crystal Being', color: '#A5F3FC', glow: '#0891B2', description: 'A crystalline entity of pure abundance', xpRequired: 4600 },
  { id: 9, emoji: '🌌', name: 'Cosmic Wealth', color: '#F9A8D4', glow: '#BE185D', description: 'An infinite cosmic being of eternal prosperity', xpRequired: 6000 },
]

export const TODO_STAGES: CreatureStage[] = [
  { id: 0, emoji: '🌱', name: 'Tiny Seed', color: '#BBF7D0', glow: '#16A34A', description: 'A tiny seed with big dreams', xpRequired: 0 },
  { id: 1, emoji: '🌿', name: 'Green Sprout', color: '#6EE7B7', glow: '#059669', description: 'A sprout reaching for the sun', xpRequired: 100 },
  { id: 2, emoji: '🐱', name: 'Curious Kitten', color: '#FBCFE8', glow: '#EC4899', description: 'A curious kitten always exploring', xpRequired: 300 },
  { id: 3, emoji: '🐰', name: 'Busy Bunny', color: '#FEF3C7', glow: '#D97706', description: 'A bunny hopping through tasks at lightning speed', xpRequired: 600 },
  { id: 4, emoji: '🦉', name: 'Wise Owl', color: '#DDD6FE', glow: '#7C3AED', description: 'A wise owl who plans everything perfectly', xpRequired: 1000 },
  { id: 5, emoji: '🦅', name: 'Swift Eagle', color: '#BAE6FD', glow: '#0284C7', description: 'An eagle soaring above all obstacles', xpRequired: 1600 },
  { id: 6, emoji: '🦄', name: 'Magic Unicorn', color: '#FBCFE8', glow: '#DB2777', description: 'A magical unicorn who makes the impossible possible', xpRequired: 2400 },
  { id: 7, emoji: '🐲', name: 'Task Dragon', color: '#6EE7B7', glow: '#047857', description: 'A legendary dragon who conquers all challenges', xpRequired: 3400 },
  { id: 8, emoji: '🌠', name: 'Star Guardian', color: '#FDE68A', glow: '#CA8A04', description: 'A guardian made of shooting stars', xpRequired: 4600 },
  { id: 9, emoji: '🌈', name: 'Rainbow Cosmic', color: '#F9A8D4', glow: '#9333EA', description: 'A transcendent being beyond all tasks', xpRequired: 6000 },
]

export const HABIT_STAGES: CreatureStage[] = [
  { id: 0, emoji: '💧', name: 'Water Drop', color: '#BAE6FD', glow: '#0284C7', description: 'A single drop that starts an ocean', xpRequired: 0 },
  { id: 1, emoji: '🐸', name: 'Little Frog', color: '#BBF7D0', glow: '#16A34A', description: 'A little frog building daily jumps', xpRequired: 100 },
  { id: 2, emoji: '🐢', name: 'Patient Turtle', color: '#6EE7B7', glow: '#047857', description: 'Slow and steady wins the race', xpRequired: 300 },
  { id: 3, emoji: '🐼', name: 'Panda Bear', color: '#E5E7EB', glow: '#6B7280', description: 'A calm panda who practices every day', xpRequired: 600 },
  { id: 4, emoji: '🐺', name: 'Lone Wolf', color: '#D1D5DB', glow: '#4B5563', description: 'A disciplined wolf running solo', xpRequired: 1000 },
  { id: 5, emoji: '🐯', name: 'Striped Tiger', color: '#FDE68A', glow: '#CA8A04', description: 'A fierce tiger with unstoppable momentum', xpRequired: 1600 },
  { id: 6, emoji: '🦁', name: 'Habit Lion', color: '#FCD34D', glow: '#B45309', description: 'A lion whose habits make it king', xpRequired: 2400 },
  { id: 7, emoji: '🔥', name: 'Fire Spirit', color: '#FCA5A5', glow: '#DC2626', description: 'A blazing spirit of pure consistency', xpRequired: 3400 },
  { id: 8, emoji: '🦋', name: 'Soul Butterfly', color: '#DDD6FE', glow: '#7C3AED', description: 'A beautiful butterfly of transformation', xpRequired: 4600 },
  { id: 9, emoji: '⭐', name: 'Eternal Star', color: '#FDE68A', glow: '#EAB308', description: 'A star that shines with eternal discipline', xpRequired: 6000 },
]

export const SAVINGS_STAGES: CreatureStage[] = [
  { id: 0, emoji: '🌰', name: 'Little Acorn', color: '#FED7AA', glow: '#EA580C', description: 'A tiny acorn saved for a rainy day', xpRequired: 0 },
  { id: 1, emoji: '🐿️', name: 'Thrifty Squirrel', color: '#FDE68A', glow: '#D97706', description: 'A squirrel stashing every nut it finds', xpRequired: 100 },
  { id: 2, emoji: '🐚', name: 'Pearl Keeper', color: '#FBCFE8', glow: '#DB2777', description: 'A shell hiding a slowly growing pearl', xpRequired: 300 },
  { id: 3, emoji: '🦫', name: 'Builder Beaver', color: '#D6D3D1', glow: '#78716C', description: 'A beaver building its dream dam plank by plank', xpRequired: 600 },
  { id: 4, emoji: '🐪', name: 'Steady Camel', color: '#FEF3C7', glow: '#CA8A04', description: 'Crosses any desert on what it saved', xpRequired: 1000 },
  { id: 5, emoji: '🧞', name: 'Wish Genie', color: '#A5F3FC', glow: '#0891B2', description: 'Grants wishes to those who save for them', xpRequired: 1600 },
  { id: 6, emoji: '🦚', name: 'Royal Peacock', color: '#99F6E4', glow: '#0D9488', description: 'Wealth worn with quiet pride', xpRequired: 2400 },
  { id: 7, emoji: '👑', name: 'Crown Jewel', color: '#FDE68A', glow: '#EAB308', description: 'A crown earned coin by coin', xpRequired: 3400 },
  { id: 8, emoji: '🏰', name: 'Dream Castle', color: '#DDD6FE', glow: '#7C3AED', description: 'The castle your savings built', xpRequired: 4600 },
  { id: 9, emoji: '🪐', name: 'Cosmic Vault', color: '#C7D2FE', glow: '#4F46E5', description: 'A planet-sized vault of infinite abundance', xpRequired: 6000 },
]

export const STUDY_STAGES: CreatureStage[] = [
  { id: 0, emoji: '🐛', name: 'Bookworm', color: '#BBF7D0', glow: '#16A34A', description: 'A little worm with a big appetite for pages', xpRequired: 0 },
  { id: 1, emoji: '📖', name: 'Page Sprite', color: '#FEF3C7', glow: '#D97706', description: 'A sprite born from an open book', xpRequired: 100 },
  { id: 2, emoji: '🦜', name: 'Recite Parrot', color: '#FCA5A5', glow: '#DC2626', description: 'Repeats every lesson until it sticks', xpRequired: 300 },
  { id: 3, emoji: '🐙', name: 'Multitask Octopus', color: '#FBCFE8', glow: '#DB2777', description: 'Eight arms, eight subjects, zero panic', xpRequired: 600 },
  { id: 4, emoji: '🦉', name: 'Night Scholar', color: '#DDD6FE', glow: '#7C3AED', description: 'Studies while the rest of the world sleeps', xpRequired: 1000 },
  { id: 5, emoji: '🐬', name: 'Clever Dolphin', color: '#BAE6FD', glow: '#0284C7', description: "The ocean's quickest learner", xpRequired: 1600 },
  { id: 6, emoji: '🧙', name: 'Spell Scholar', color: '#C4B5FD', glow: '#6D28D9', description: 'Turns knowledge into pure magic', xpRequired: 2400 },
  { id: 7, emoji: '🔭', name: 'Star Gazer', color: '#A5F3FC', glow: '#0891B2', description: 'Sees answers written in the stars', xpRequired: 3400 },
  { id: 8, emoji: '🧠', name: 'Mind Palace', color: '#FBCFE8', glow: '#BE185D', description: 'A living library of everything learned', xpRequired: 4600 },
  { id: 9, emoji: '🌌', name: 'Cosmic Sage', color: '#C7D2FE', glow: '#4338CA', description: 'One with all the knowledge in the universe', xpRequired: 6000 },
]

export const MOOD_STAGES: CreatureStage[] = [
  { id: 0, emoji: '🌫️', name: 'Misty Wisp', color: '#E5E7EB', glow: '#6B7280', description: 'A soft mist still finding its shape', xpRequired: 0 },
  { id: 1, emoji: '🌧️', name: 'Drizzle Sprite', color: '#BAE6FD', glow: '#0284C7', description: 'Even rainy days water something good', xpRequired: 100 },
  { id: 2, emoji: '⛅', name: 'Cloud Pup', color: '#E0F2FE', glow: '#0369A1', description: 'A fluffy cloud learning to drift', xpRequired: 300 },
  { id: 3, emoji: '🐤', name: 'Sunny Chick', color: '#FDE68A', glow: '#EAB308', description: 'A little sunshine on two feet', xpRequired: 600 },
  { id: 4, emoji: '🌻', name: 'Sunflower Spirit', color: '#FEF3C7', glow: '#CA8A04', description: 'Always turns toward the light', xpRequired: 1000 },
  { id: 5, emoji: '🕊️', name: 'Peace Dove', color: '#F3F4F6', glow: '#9CA3AF', description: 'Calm carried on white wings', xpRequired: 1600 },
  { id: 6, emoji: '🌈', name: 'Rainbow Being', color: '#FBCFE8', glow: '#DB2777', description: 'Every feeling, all in color', xpRequired: 2400 },
  { id: 7, emoji: '🌙', name: 'Moon Guardian', color: '#DDD6FE', glow: '#7C3AED', description: 'Watches gently over your nights', xpRequired: 3400 },
  { id: 8, emoji: '☀️', name: 'Radiant Sun', color: '#FDE68A', glow: '#F59E0B', description: 'Warmth that never wavers', xpRequired: 4600 },
  { id: 9, emoji: '✨', name: 'Aurora Spirit', color: '#A5F3FC', glow: '#06B6D4', description: 'The whole sky dancing with serenity', xpRequired: 6000 },
]

export function getStageFromXP(stages: CreatureStage[], xp: number): CreatureStage {
  let current = stages[0]
  for (const stage of stages) {
    if (xp >= stage.xpRequired) current = stage
  }
  return current
}

export function getNextStage(stages: CreatureStage[], currentId: number): CreatureStage | null {
  return stages.find(s => s.id === currentId + 1) ?? null
}
