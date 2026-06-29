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
