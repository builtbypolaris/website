import { supabase } from '../supabase'
import type { CharacterState, FinancialData, Transaction } from '../../types'
import { getCharacter, saveCharacter } from './core'

export async function getFinancialData(userId: string): Promise<FinancialData> {
  const [character, { data: rows }] = await Promise.all([
    getCharacter(userId, 'financial'),
    supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }),
  ])
  const transactions: Transaction[] = (rows ?? []).map(r => ({
    id: r.id,
    type: r.type,
    amount: r.amount,
    category: r.category,
    description: r.description ?? '',
    date: r.date,
  }))
  return { transactions, character }
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

export async function saveFinancialCharacter(userId: string, c: CharacterState) {
  await saveCharacter(userId, 'financial', c)
}
