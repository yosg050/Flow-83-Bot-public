import { supabase } from "./supabase-client-db.ts";


const DEFAULT_MEANING = "Starting your journey with presence and intention";

/**
 * Fetch welcome message and journey metadata by journey_id
 * Returns default meaning if none found, but preserves real title/content from DB
 */
export async function getWelcomeIntentionsByJourney(journey_id: string) {
  const { data, error } = await supabase
    .from("journeys")
    .select("id, title, duration, journey_experiences(welcome)")
    .eq("id", journey_id)
    .single();

  if (error) {
    console.error("Failed to fetch journey with welcome:", error);
    throw error;
  }

  const meaning =
    data?.journey_experiences?.welcome?.trim() || DEFAULT_MEANING;

  return {
    title: data.title,
    duration: data.duration,
    meaning,
  };
}
