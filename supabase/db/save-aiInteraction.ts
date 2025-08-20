import { supabase } from './supabase-client-db.ts';

export async function saveAiInteraction({
  user_id,
  journey_id,
  message_content,
  ai_response,
  context = {},
}: {
  user_id: string;
  journey_id?: string;
  message_content: string;
  ai_response: string;
  context?: any;
}) {
  const { error } = await supabase
    .from('ai_interactions')
    .insert([{
      user_id,
      journey_id,
      message_content,
      ai_response,
      context,
    }]);

  if (error) {
    console.error(' Failed to save AI interaction:', error.message);
    throw new Error('DB insert failed: ' + error.message);
  }
}
