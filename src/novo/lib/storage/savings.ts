import { supabase } from '../supabase'
import type { CharacterState, Installment, SavingsData, SavingsGoal } from '../../types'
import { getCharacter, saveCharacter } from './core'

export async function getSavingsData(userId: string): Promise<SavingsData> {
  const [character, { data: goalRows }, { data: instRows }] = await Promise.all([
    getCharacter(userId, 'savings'),
    supabase.from('savings_goals').select('*, savings_deposits(id, amount, note, date)').eq('user_id', userId).order('created_at'),
    supabase.from('installments').select('*, installment_payments(month, paid_at)').eq('user_id', userId).order('created_at'),
  ])
  const goals: SavingsGoal[] = (goalRows ?? []).map(r => ({
    id: r.id,
    name: r.name,
    emoji: r.emoji ?? '🎯',
    targetAmount: Number(r.target_amount),
    createdAt: r.created_at,
    deposits: (r.savings_deposits as { id: string; amount: number; note: string | null; date: string }[])
      .map(d => ({ id: d.id, amount: Number(d.amount), note: d.note ?? '', date: d.date }))
      .sort((a, b) => b.date.localeCompare(a.date)),
  }))
  const installments: Installment[] = (instRows ?? []).map(r => ({
    id: r.id,
    itemName: r.item_name,
    totalAmount: Number(r.total_amount),
    monthlyAmount: Number(r.monthly_amount),
    dueDay: r.due_day,
    createdAt: r.created_at,
    payments: (r.installment_payments as { month: string; paid_at: string }[])
      .map(p => ({ month: p.month, paidAt: p.paid_at }))
      .sort((a, b) => b.month.localeCompare(a.month)),
  }))
  return { goals, installments, character }
}

export async function addSavingsGoal(
  userId: string,
  g: { name: string; emoji: string; targetAmount: number },
): Promise<SavingsGoal> {
  const { data, error } = await supabase
    .from('savings_goals')
    .insert({ user_id: userId, name: g.name, emoji: g.emoji, target_amount: g.targetAmount })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Insert failed')
  return { id: data.id, name: data.name, emoji: data.emoji ?? '🎯', targetAmount: Number(data.target_amount), createdAt: data.created_at, deposits: [] }
}

export async function deleteSavingsGoal(id: string) {
  await supabase.from('savings_goals').delete().eq('id', id)
}

export async function addDeposit(
  userId: string,
  goalId: string,
  d: { amount: number; note: string; date: string },
): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('savings_deposits')
    .insert({ user_id: userId, goal_id: goalId, amount: d.amount, note: d.note, date: d.date })
    .select('id')
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Insert failed')
  return { id: data.id }
}

export async function addInstallment(
  userId: string,
  i: { itemName: string; totalAmount: number; monthlyAmount: number; dueDay: number },
): Promise<Installment> {
  const { data, error } = await supabase
    .from('installments')
    .insert({ user_id: userId, item_name: i.itemName, total_amount: i.totalAmount, monthly_amount: i.monthlyAmount, due_day: i.dueDay })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Insert failed')
  return { id: data.id, itemName: data.item_name, totalAmount: Number(data.total_amount), monthlyAmount: Number(data.monthly_amount), dueDay: data.due_day, createdAt: data.created_at, payments: [] }
}

export async function deleteInstallment(id: string) {
  await supabase.from('installments').delete().eq('id', id)
}

export async function setInstallmentMonthPaid(installmentId: string, userId: string, month: string, paid: boolean, paidAt: string) {
  if (paid) {
    await supabase.from('installment_payments').upsert({ installment_id: installmentId, user_id: userId, month, paid_at: paidAt })
  } else {
    await supabase.from('installment_payments').delete().eq('installment_id', installmentId).eq('month', month)
  }
}

export async function saveSavingsCharacter(userId: string, c: CharacterState) {
  await saveCharacter(userId, 'savings', c)
}
