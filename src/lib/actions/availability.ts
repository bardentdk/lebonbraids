'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  blockedSlotSchema,
  timeOffSchema,
  type BlockedSlotInput,
  type TimeOffInput,
} from '@/lib/validators/booking';

async function ensureStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin' && profile?.role !== 'staff') {
    throw new Error('Accès refusé');
  }
  return { supabase, user };
}

export async function listBusinessHours() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('business_hours')
    .select('*')
    .order('day_of_week');
  if (error) throw new Error(error.message);
  return data;
}

export async function listTimeOff() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('time_off')
    .select('*')
    .gte('end_date', new Date().toISOString().split('T')[0])
    .order('start_date');
  if (error) throw new Error(error.message);
  return data;
}

export async function listBlockedSlots(opts?: { from?: string; to?: string }) {
  const supabase = await createClient();
  let req = supabase.from('blocked_slots').select('*').order('start_at');
  if (opts?.from) req = req.gte('start_at', opts.from);
  if (opts?.to) req = req.lte('end_at', opts.to);
  const { data, error } = await req;
  if (error) throw new Error(error.message);
  return data;
}

export async function createBlockedSlot(input: BlockedSlotInput) {
  const { supabase, user } = await ensureStaff();
  const parsed = blockedSlotSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: 'Données invalides' };
  }
  const { error } = await supabase.from('blocked_slots').insert({
    start_at: parsed.data.start_at,
    end_at: parsed.data.end_at,
    reason: parsed.data.reason || null,
    created_by: user.id,
  });
  if (error) return { success: false as const, error: error.message };
  revalidatePath('/admin/planning');
  return { success: true as const };
}

export async function deleteBlockedSlot(id: string) {
  const { supabase } = await ensureStaff();
  const { error } = await supabase.from('blocked_slots').delete().eq('id', id);
  if (error) return { success: false as const, error: error.message };
  revalidatePath('/admin/planning');
  return { success: true as const };
}

export async function createTimeOff(input: TimeOffInput) {
  const { supabase } = await ensureStaff();
  const parsed = timeOffSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: 'Données invalides' };
  }
  const { error } = await supabase.from('time_off').insert({
    start_date: parsed.data.start_date,
    end_date: parsed.data.end_date,
    reason: parsed.data.reason || null,
    is_all_day: parsed.data.is_all_day,
    start_time: parsed.data.start_time || null,
    end_time: parsed.data.end_time || null,
  });
  if (error) return { success: false as const, error: error.message };
  revalidatePath('/admin/planning');
  return { success: true as const };
}

export async function deleteTimeOff(id: string) {
  const { supabase } = await ensureStaff();
  const { error } = await supabase.from('time_off').delete().eq('id', id);
  if (error) return { success: false as const, error: error.message };
  revalidatePath('/admin/planning');
  return { success: true as const };
}