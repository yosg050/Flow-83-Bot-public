
import { supabase } from './supabase-client-db.ts';

export async function fetchCurrentDay(
  user_id: string,
  journey_id: string
): Promise<number | null> {
  const { data, error } = await supabase
    .from('user_journey_progress')
    .select('current_day')
    .eq('user_id', user_id)
    .eq('journey_id', journey_id)
    .single();

  // Ignore not‑found (PGRST116) → return null; otherwise throw.
  if (error && error.code !== 'PGRST116') throw error;
  if (!data) return null;

  return data.current_day as number;
}
