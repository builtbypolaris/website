import type { TemplateId } from '../types'
import {
  getFinancialData, getTodoData, getHabitData,
  getSavingsData, getStudyData, getMoodData,
  getFreelanceData, getHealthData, getCycleData,
  getTravelData, getBabyData, getPetData,
  todayStr,
} from '../lib/storage'

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
      { label: 'Installments', value: String(active) },
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
  freelance: async userId => {
    const { clients, projects, workLogs } = await getFreelanceData(userId)
    const month = todayStr().slice(0, 7)
    const earned = workLogs.filter(w => w.date.startsWith(month)).reduce((s, w) => s + w.amount, 0)
    const active = projects.filter(p => p.status === 'active').length
    return [
      { label: 'This month', value: `${(earned / 1000).toFixed(0)}K` },
      { label: 'Projects', value: String(active) },
      { label: 'Clients', value: String(clients.length) },
    ]
  },
  health: async userId => {
    const { meals, waterByDate, weights, goals } = await getHealthData(userId)
    const today = todayStr()
    const kcal = meals.filter(m => m.date === today).reduce((s, m) => s + (m.calories ?? 0), 0)
    const latest = weights[weights.length - 1]
    return [
      { label: 'Kcal today', value: String(kcal) },
      { label: 'Water', value: `${waterByDate[today] ?? 0}/${goals.waterTarget}` },
      { label: 'Weight', value: latest ? `${latest.weightKg}kg` : '—' },
    ]
  },
  cycle: async userId => {
    const { periods } = await getCycleData(userId)
    const today = todayStr()
    const starts = periods.map(p => p.startDate).sort()
    const lastStart = starts[starts.length - 1]
    const cycleDay = lastStart
      ? Math.floor((new Date(today).getTime() - new Date(lastStart).getTime()) / 86400000) + 1
      : null
    let avgCycle = 28
    if (starts.length >= 2) {
      const recent = starts.slice(-6)
      const gaps = recent.slice(1).map((s, i) =>
        Math.round((new Date(s).getTime() - new Date(recent[i]).getTime()) / 86400000))
      avgCycle = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length)
    }
    const nextIn = lastStart && cycleDay !== null ? Math.max(0, avgCycle - cycleDay + 1) : null
    return [
      { label: 'Cycle day', value: cycleDay !== null ? String(cycleDay) : '—' },
      { label: 'Next in', value: nextIn !== null ? `${nextIn}d` : '—' },
      { label: 'Avg cycle', value: `${avgCycle}d` },
    ]
  },
  travel: async userId => {
    const { trips, expenses } = await getTravelData(userId)
    const today = todayStr()
    const upcoming = trips.filter(t => t.endDate >= today).sort((a, b) => a.startDate.localeCompare(b.startDate))[0]
    const spent = upcoming ? expenses.filter(e => e.tripId === upcoming.id).reduce((s, e) => s + e.amount, 0) : 0
    const daysTo = upcoming ? Math.max(0, Math.ceil((new Date(upcoming.startDate).getTime() - new Date(today).getTime()) / 86400000)) : null
    return [
      { label: 'Next trip', value: daysTo !== null ? (daysTo === 0 ? 'Now!' : `${daysTo}d`) : '—' },
      { label: 'Spent', value: upcoming && upcoming.budget > 0 ? `${Math.round((spent / upcoming.budget) * 100)}%` : '—' },
      { label: 'Trips', value: String(trips.length) },
    ]
  },
  baby: async userId => {
    const { events } = await getBabyData(userId)
    const today = todayStr()
    const todays = events.filter(e => e.eventAt.startsWith(today))
    const feeds = todays.filter(e => e.eventType === 'feeding').length
    const diapers = todays.filter(e => e.eventType === 'diaper').length
    // Sum completed sleep intervals that started today
    const sorted = [...events].sort((a, b) => a.eventAt.localeCompare(b.eventAt))
    let sleepMs = 0
    let sleepStart: string | null = null
    for (const e of sorted) {
      if (e.eventType === 'sleep_start') sleepStart = e.eventAt
      if (e.eventType === 'sleep_end' && sleepStart) {
        if (sleepStart.startsWith(today) || e.eventAt.startsWith(today)) {
          sleepMs += new Date(e.eventAt).getTime() - new Date(sleepStart).getTime()
        }
        sleepStart = null
      }
    }
    return [
      { label: 'Feeds', value: String(feeds) },
      { label: 'Sleep', value: `${(sleepMs / 3600000).toFixed(1)}h` },
      { label: 'Diapers', value: String(diapers) },
    ]
  },
  pet: async userId => {
    const { pets, events, careItems } = await getPetData(userId)
    const today = todayStr()
    const todays = events.filter(e => e.eventAt.startsWith(today)).length
    const next = careItems.filter(i => !i.done && i.dueDate >= today).sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0]
    const nextIn = next ? Math.ceil((new Date(next.dueDate).getTime() - new Date(today).getTime()) / 86400000) : null
    return [
      { label: 'Pets', value: String(pets.length) },
      { label: 'Care today', value: String(todays) },
      { label: 'Next due', value: nextIn !== null ? `${nextIn}d` : '—' },
    ]
  },
}
