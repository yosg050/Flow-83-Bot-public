import { supabase } from "./supabase-client-db.ts";

/**
 * מחזיר עד 20 אינטראקציות אחרונות של משתמש במסע מסוים,
 * מסודרות מהחדשה לישנה.
 */
export async function fetchLastInteractions(
  userId: string,
  journeyId: string
) {
  const { data, error } = await supabase
    .from('ai_interactions')
    .select('message_content, ai_response, created_at')
    .eq('user_id', userId)
    .eq('journey_id', journeyId)
    .order('created_at', { ascending: false }) // newest → oldest
    .limit(20);                          

  if (error) throw error;
  return data;
}
