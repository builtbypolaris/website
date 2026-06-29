export type TemplateId = 'financial' | 'todo' | 'habit'

export interface User {
  username: string
  password: string
  ownedTemplates: TemplateId[]
}

export interface CharacterState {
  xp: number
  happiness: number
  prestige: number
}

// Financial
export interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: string
}

export interface FinancialData {
  transactions: Transaction[]
  character: CharacterState
}

// Todo
export type Priority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  completed: boolean
  priority: Priority
  dueDate?: string
  createdAt: string
  completedAt?: string
}

export interface TodoData {
  tasks: Task[]
  character: CharacterState
}

// Habit
export interface Habit {
  id: string
  name: string
  icon: string
  frequency: 'daily' | 'weekly'
  completions: string[]
  createdAt: string
}

export interface HabitData {
  habits: Habit[]
  character: CharacterState
}

export interface CreatureStage {
  id: number
  emoji: string
  name: string
  color: string
  glow: string
  description: string
  xpRequired: number
}

export interface TemplateInfo {
  id: TemplateId
  name: string
  emoji: string
  description: string
  features: string[]
  color: string
  gradient: string
  price: number
}
