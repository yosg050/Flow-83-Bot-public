import { supabase } from './supabase-client-db.ts';

export interface ProgressResult {
  progress: any;            // the row from user_journey_progress
  welcome_intentions: boolean; // true if day changed / first insert / reset
}

/**
 * Inserts a row when first encounter or bumps `current_day`
 * if a calendar day has passed since `started_at`.
 * Returns the progress row **and** whether welcome_intentions should be triggered.
 */
export async function upsertAndSyncProgress(
  user_id: string,
  journey_id: string
): Promise<ProgressResult> {
  let dayChanged = false; // will be set to true if we insert or update the day

  const { data: rows, error } = await supabase
    .from('user_journey_progress')
    .select('*')
    .eq('user_id', user_id)
    .eq('journey_id', journey_id)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // real error

  if (!rows) {
    const { data, error: insErr } = await supabase
      .from('user_journey_progress')
      .insert({
        user_id,
        journey_id,
        current_day: 1,
        completed_days: []
      })
      .select()
      .single();
    if (insErr) throw insErr;

    dayChanged = true; // inserted day 1
    return { progress: data, welcome_intentions: dayChanged };
  }

  const start = new Date(rows.started_at);
  const today = new Date();
  const daysPassed =
    Math.floor((today.getTime() - start.getTime()) / 86_400_000) + 1; 

  const { data: journey, error: journeyErr } = await supabase
    .from('journeys')
    .select('duration')
    .eq('id', journey_id)
    .single();
  if (journeyErr) throw journeyErr;

  if (daysPassed > rows.current_day && daysPassed <= journey.duration) {
    const { data, error: updErr } = await supabase
      .from('user_journey_progress')
      .update({ current_day: daysPassed })
      .eq('id', rows.id)
      .select()
      .single();
    if (updErr) throw updErr;

    dayChanged = true;
    return { progress: data, welcome_intentions: dayChanged };
  }

  if (daysPassed > journey.duration) {
    const { data, error: updErr } = await supabase
      .from('user_journey_progress')
      .update({
        current_day: 1,
        completed_days: [],
        started_at: new Date().toISOString()
      })
      .eq('id', rows.id)
      .select()
      .single();
    if (updErr) throw updErr;

    dayChanged = true;
    return { progress: data, welcome_intentions: dayChanged };
  }

  return { progress: rows, welcome_intentions: dayChanged };
}


