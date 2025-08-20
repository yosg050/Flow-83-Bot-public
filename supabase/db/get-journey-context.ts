import { supabase } from "./supabase-client-db.ts";

/**
 * Returns the full context for the current journey day.
 * Missing values are normalized to null or an empty array.
 */
export async function getJourneyContext(
  journeyId: string,
  dayNumber: number
) {
  // ---- Base journey data including experiences (LEFT JOIN) ----
  const { data: journey, error: jErr } = await supabase
    .from('journeys')
    .select(`
      id,
      title,
      description,
      duration,
      route_id,
      journey_experiences(title, experiences)
    `)
    .eq('id', journeyId)
    .maybeSingle();

  if (jErr) throw jErr;
  if (!journey) throw new Error('Journey not found');

  // ---- Current journey day (may be null) ----
  const { data: day, error: dErr } = await supabase
    .from('journey_days')
    .select('title, content, reflection_questions, guidance_text')
    .eq('journey_id', journeyId)
    .eq('day_number', dayNumber)
    .maybeSingle();

  if (dErr) throw dErr;

  // ---- Build a consistent return structure ----
  const { journey_experiences: experiences, ...rest } = journey;

  return {
    ...rest,
    experiences: experiences ?? [],
    day: day ?? {
      title: null,
      content: null,
      reflection_questions: null,
      guidance_text: null
    }
  };
}
