import { supabase } from '../supabase'
import type { Budget, CharacterState, FinancialData, RecurringItem, Transaction } from '../../types'
import { getCharacter, saveCharacter } from './core'

export async function getFinancialData(userId: string): Promise<FinancialData> {
  const [character, { data: txRows }, { data: budgetRows }, { data: recurRows }] = await Promise.all([
    getCharacter(userId, 'financial'),
    supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }),
    supabase.from('financial_budgets').select('*').eq('user_id', userId),
    supabase.from('financial_recurring').select('*, financial_recurring_payments(month, paid_at)').eq('user_id', userId).order('created_at'),
  ])
  const transactions: Transaction[] = (txRows ?? []).map(r => ({
    id: r.id,
    type: r.type,
    amount: r.amount,
    category: r.category,
    description: r.description ?? '',
    date: r.date,
  }))
  const budgets: Budget[] = (budgetRows ?? []).map(r => ({ category: r.category, monthlyLimit: Number(r.monthly_limit) }))
  const recurring: RecurringItem[] = (recurRows ?? []).map(r => ({
    id: r.id,
    name: r.name,
    amount: Number(r.amount),
    type: r.type,
    category: r.category,
    dueDay: r.due_day,
    active: r.active,
    payments: (r.financial_recurring_payments as { month: string; paid_at: string }[])
      .map(p => ({ month: p.month, paidAt: p.paid_at }))
      .sort((a, b) => b.month.localeCompare(a.month)),
  }))
  return { transactions, budgets, recurring, character }
}

export async function addTransaction(userId: string, t: Omit<Transaction, 'id'>): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .insert({ user_id: userId, ...t })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Insert failed')
  return { id: data.id, type: data.type, amount: data.amount, category: data.category, description: data.description ?? '', date: data.date }
}

export async function deleteTransaction(id: string) {
  await supabase.from('transactions').delete().eq('id', id)
}

export async function saveBudget(userId: string, category: string, monthlyLimit: number): Promise<void> {
  await supabase.from('financial_budgets').upsert({ user_id: userId, category, monthly_limit: monthlyLimit })
}

export async function deleteBudget(userId: string, category: string): Promise<void> {
  await supabase.from('financial_budgets').delete().eq('user_id', userId).eq('category', category)
}

export async function addRecurring(
  userId: string,
  r: { name: string; amount: number; type: 'income' | 'expense'; category: string; dueDay: number },
): Promise<RecurringItem> {
  const { data, error } = await supabase
    .from('financial_recurring')
    .insert({ user_id: userId, name: r.name, amount: r.amount, type: r.type, category: r.category, due_day: r.dueDay })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Insert failed')
  return { id: data.id, name: data.name, amount: Number(data.amount), type: data.type, category: data.category, dueDay: data.due_day, active: data.active, payments: [] }
}

export async function deleteRecurring(id: string) {
  await supabase.from('financial_recurring').delete().eq('id', id)
}

export async function setRecurringMonthPaid(recurringId: string, userId: string, month: string, paid: boolean, paidAt: string) {
  if (paid) {
    await supabase.from('financial_recurring_payments').upsert({ recurring_id: recurringId, user_id: userId, month, paid_at: paidAt })
  } else {
    await supabase.from('financial_recurring_payments').delete().eq('recurring_id', recurringId).eq('month', month)
  }
}

export async function saveFinancialCharacter(userId: string, c: CharacterState) {
  await saveCharacter(userId, 'financial', c)
}
