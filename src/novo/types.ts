export type TemplateId =
  | 'financial' | 'todo' | 'habit'
  | 'savings' | 'study' | 'mood'
  | 'freelance' | 'health' | 'cycle' | 'travel' | 'baby' | 'pet'

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

export interface Budget {
  category: string
  monthlyLimit: number
}

export interface RecurringPayment {
  month: string  // 'YYYY-MM'
  paidAt: string
}

export interface RecurringItem {
  id: string
  name: string
  amount: number
  type: 'income' | 'expense'
  category: string
  dueDay: number
  active: boolean
  payments: RecurringPayment[]
}

export interface FinancialData {
  transactions: Transaction[]
  budgets: Budget[]
  recurring: RecurringItem[]
  character: CharacterState
}

// Todo
export type Priority = 'low' | 'medium' | 'high'

export type TaskStatus = 'todo' | 'in_progress' | 'done'

export interface Task {
  id: string
  title: string
  completed: boolean
  priority: Priority
  status: TaskStatus
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

// Freelance
export type RateType = 'hourly' | 'fixed'

export interface Client {
  id: string
  name: string
  contact: string
  createdAt: string
}

export interface Project {
  id: string
  clientId: string
  name: string
  deadline?: string
  rateType: RateType
  rate: number
  status: 'active' | 'done'
  createdAt: string
}

export interface WorkLog {
  id: string
  projectId: string
  hours?: number
  amount: number
  note: string
  date: string
}

export interface FreelanceData {
  clients: Client[]
  projects: Project[]
  workLogs: WorkLog[]
  character: CharacterState
}

// Health
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface Meal {
  id: string
  mealType: MealType
  food: string
  calories?: number
  date: string
}

export interface WeightLog {
  id: string
  weightKg: number
  date: string
}

export interface HealthGoals {
  calorieTarget: number
  waterTarget: number
}

export interface HealthData {
  meals: Meal[]
  waterByDate: Record<string, number>
  weights: WeightLog[]
  goals: HealthGoals
  character: CharacterState
}

// Cycle
export interface Period {
  id: string
  startDate: string
  endDate?: string
}

export interface CycleLog {
  date: string
  flow: number  // 0-3
  symptoms: string[]
  note: string
}

export interface CycleData {
  periods: Period[]
  logs: CycleLog[]
  character: CharacterState
}

// Travel
export interface Trip {
  id: string
  destination: string
  emoji: string
  startDate: string
  endDate: string
  budget: number
  createdAt: string
}

export interface ItineraryItem {
  id: string
  tripId: string
  day: string
  time?: string
  title: string
  location: string
}

export interface TripExpense {
  id: string
  tripId: string
  amount: number
  category: string
  note: string
  date: string
}

export interface TravelData {
  trips: Trip[]
  items: ItineraryItem[]
  expenses: TripExpense[]
  character: CharacterState
}

// Baby
export type BabyEventType = 'feeding' | 'sleep_start' | 'sleep_end' | 'diaper' | 'pumping'

export interface Baby {
  id: string
  name: string
  emoji: string
  birthdate: string
}

export interface BabyEvent {
  id: string
  babyId: string
  eventType: BabyEventType
  eventAt: string
  note: string
}

export interface GrowthEntry {
  id: string
  babyId: string
  date: string
  weightKg?: number
  heightCm?: number
}

export interface Milestone {
  id: string
  babyId: string
  title: string
  date: string
}

export interface BabyData {
  babies: Baby[]
  events: BabyEvent[]
  growth: GrowthEntry[]
  milestones: Milestone[]
  character: CharacterState
}

// Pet
export type PetEventType = 'feeding' | 'walk' | 'grooming' | 'vet' | 'medication' | 'play'

export interface Pet {
  id: string
  name: string
  species: string
  emoji: string
  birthdate?: string
}

export interface PetEvent {
  id: string
  petId: string
  eventType: PetEventType
  eventAt: string
  note: string
}

export interface PetCareItem {
  id: string
  petId: string
  title: string
  dueDate: string
  done: boolean
}

export interface PetWeight {
  id: string
  petId: string
  date: string
  weightKg: number
}

export interface PetData {
  pets: Pet[]
  events: PetEvent[]
  careItems: PetCareItem[]
  weights: PetWeight[]
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
