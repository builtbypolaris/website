import { supabase } from '../supabase'
import type { CharacterState, Client, FreelanceData, Project, WorkLog } from '../../types'
import { getCharacter, saveCharacter } from './core'

export async function getFreelanceData(userId: string): Promise<FreelanceData> {
  const [character, { data: clientRows }, { data: projectRows }, { data: logRows }] = await Promise.all([
    getCharacter(userId, 'freelance'),
    supabase.from('clients').select('*').eq('user_id', userId).order('created_at'),
    supabase.from('projects').select('*').eq('user_id', userId).order('created_at'),
    supabase.from('work_logs').select('*').eq('user_id', userId).order('date', { ascending: false }),
  ])
  const clients: Client[] = (clientRows ?? []).map(r => ({
    id: r.id, name: r.name, contact: r.contact ?? '', createdAt: r.created_at,
  }))
  const projects: Project[] = (projectRows ?? []).map(r => ({
    id: r.id, clientId: r.client_id, name: r.name, deadline: r.deadline ?? undefined,
    rateType: r.rate_type, rate: Number(r.rate), status: r.status, createdAt: r.created_at,
  }))
  const workLogs: WorkLog[] = (logRows ?? []).map(r => ({
    id: r.id, projectId: r.project_id, hours: r.hours != null ? Number(r.hours) : undefined,
    amount: Number(r.amount), note: r.note ?? '', date: r.date,
  }))
  return { clients, projects, workLogs, character }
}

export async function addClient(userId: string, c: { name: string; contact: string }): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .insert({ user_id: userId, name: c.name, contact: c.contact })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Insert failed')
  return { id: data.id, name: data.name, contact: data.contact ?? '', createdAt: data.created_at }
}

export async function deleteClient(id: string) {
  await supabase.from('clients').delete().eq('id', id)
}

export async function addProject(
  userId: string,
  p: { clientId: string; name: string; deadline?: string; rateType: string; rate: number },
): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert({ user_id: userId, client_id: p.clientId, name: p.name, deadline: p.deadline ?? null, rate_type: p.rateType, rate: p.rate })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Insert failed')
  return {
    id: data.id, clientId: data.client_id, name: data.name, deadline: data.deadline ?? undefined,
    rateType: data.rate_type, rate: Number(data.rate), status: data.status, createdAt: data.created_at,
  }
}

export async function updateProjectStatus(id: string, status: 'active' | 'done') {
  await supabase.from('projects').update({ status }).eq('id', id)
}

export async function deleteProject(id: string) {
  await supabase.from('projects').delete().eq('id', id)
}

export async function addWorkLog(
  userId: string,
  w: { projectId: string; hours?: number; amount: number; note: string; date: string },
): Promise<WorkLog> {
  const { data, error } = await supabase
    .from('work_logs')
    .insert({ user_id: userId, project_id: w.projectId, hours: w.hours ?? null, amount: w.amount, note: w.note, date: w.date })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Insert failed')
  return {
    id: data.id, projectId: data.project_id, hours: data.hours != null ? Number(data.hours) : undefined,
    amount: Number(data.amount), note: data.note ?? '', date: data.date,
  }
}

export async function deleteWorkLog(id: string) {
  await supabase.from('work_logs').delete().eq('id', id)
}

export async function saveFreelanceCharacter(userId: string, c: CharacterState) {
  await saveCharacter(userId, 'freelance', c)
}
