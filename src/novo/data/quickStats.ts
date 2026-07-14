import type { TemplateId } from '../types'
import { getFinancialData, getTodoData, getHabitData, getSavingsData, getStudyData, getMoodData, todayStr } from '../lib/storage'

export interface QuickStat {
  label: string
  value: string
}

// One entry per tracker — fetched on the dashboard only for owned trackers.
export const QUICK_STATS: Record<TemplateId, (userId: string) => Promise<QuickStat[]>> = {
  financial: async userId => {
    const { transactions } = await getFinancialData(userId)
    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    return [
      { label: 'Income', value: `+${(income / 1000).toFixed(0)}K` },
      { label: 'Expenses', value: `-${(expense / 1000).toFixed(0)}K` },
      { label: 'Net', value: `${income - expense >= 0 ? '+' : ''}${((income - expense) / 1000).toFixed(0)}K` },
    ]
  },
  todo: async userId => {
    const { tasks } = await getTodoData(userId)
    const done = tasks.filter(t => t.completed).length
    return [
      { label: 'Total', value: String(tasks.length) },
      { label: 'Done', value: String(done) },
      { label: 'Rate', value: tasks.length ? `${Math.round((done / tasks.length) * 100)}%` : '0%' },
    ]
  },
  habit: async userId => {
    const { habits } = await getHabitData(userId)
    const today = todayStr()
    const done = habits.filter(h => h.completions.includes(today)).length
    return [
      { label: 'Habits', value: String(habits.length) },
      { label: 'Today', value: `${done}/${habits.length}` },
      { label: 'Rate', value: habits.length ? `${Math.round((done / habits.length) * 100)}%` : '0%' },
    ]
  },
  savings: async userId => {
    const { goals, installments } = await getSavingsData(userId)
    const saved = goals.reduce((s, g) => s + g.deposits.reduce((a, d) => a + d.amount, 0), 0)
    const active = installments.filter(i =>
      i.payments.length * i.monthlyAmount < i.totalAmount,
    ).length
    return [
      { label: 'Saved', value: `${(saved / 1000).toFixed(0)}K` },
      { label: 'Goals', value: String(goals.length) },
      { label: 'Cicilan', value: String(active) },
    ]
  },
  study: async userId => {
    const { subjects, sessions } = await getStudyData(userId)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoStr = weekAgo.toISOString().split('T')[0]
    const minutes = sessions.filter(s => s.date >= weekAgoStr).reduce((s, x) => s + x.durationMinutes, 0)
    const today = todayStr()
    const upcoming = subjects
      .filter(s => s.examDate && s.examDate >= today)
      .sort((a, b) => a.examDate!.localeCompare(b.examDate!))[0]
    const daysToExam = upcoming
      ? Math.ceil((new Date(upcoming.examDate!).getTime() - new Date(today).getTime()) / 86400000)
      : null
    return [
      { label: 'This week', value: `${(minutes / 60).toFixed(1)}h` },
      { label: 'Subjects', value: String(subjects.length) },
      { label: 'Next exam', value: daysToExam !== null ? `${daysToExam}d` : '—' },
    ]
  },
  mood: async userId => {
    const { entries } = await getMoodData(userId)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const recent = entries.filter(e => new Date(e.entryAt) >= weekAgo)
    const avg = recent.length ? (recent.reduce((s, e) => s + e.mood, 0) / recent.length).toFixed(1) : '—'
    const today = todayStr()
    const todayCount = entries.filter(e => e.entryAt.startsWith(today)).length
    return [
      { label: 'Avg 7d', value: String(avg) },
      { label: 'Today', value: String(todayCount) },
      { label: 'Entries', value: String(entries.length) },
    ]
  },
}
