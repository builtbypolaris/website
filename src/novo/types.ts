export type TemplateId = 'financial' | 'todo' | 'habit' | 'savings' | 'study' | 'mood'

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

// Savings (nabung & cicilan)
export interface SavingsDeposit {
  id: string
  amount: number
  note: string
  date: string
}

export interface SavingsGoal {
  id: string
  name: string
  emoji: string
  targetAmount: number
  deposits: SavingsDeposit[]
  createdAt: string
}

export interface InstallmentPayment {
  month: string  // 'YYYY-MM'
  paidAt: string
}

export interface Installment {
  id: string
  itemName: string
  totalAmount: number
  monthlyAmount: number
  dueDay: number
  payments: InstallmentPayment[]
  createdAt: string
}

export interface SavingsData {
  goals: SavingsGoal[]
  installments: Installment[]
  character: CharacterState
}

// Study
export interface Subject {
  id: string
  name: string
  color: string
  examDate?: string
  createdAt: string
}

export interface StudySession {
  id: string
  subjectId: string
  durationMinutes: number
  notes: string
  date: string
}

export interface StudyData {
  subjects: Subject[]
  sessions: StudySession[]
  character: CharacterState
}

// Mood
export type MoodLevel = 1 | 2 | 3 | 4 | 5

export interface MoodEntry {
  id: string
  mood: MoodLevel
  tags: string[]
  note: string
  entryAt: string
}

export interface MoodData {
  entries: MoodEntry[]
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

export type TemplateCategory = 'money' | 'productivity' | 'wellness' | 'life'

export interface TemplateInfo {
  id: TemplateId
  name: string
  shortName: string
  emoji: string
  description: string
  features: string[]
  color: string
  gradient: string
  price: number
  route: string
  accent: string
  cardStyle: { bg: string; border: string }
  stages: CreatureStage[]
  petMessages: string[]
  category: TemplateCategory
  previewStats: string[]
  featured?: boolean
  lynkUrl?: string  // per-tracker Lynk.id product page; falls back to LYNK_STORE_URL
}
