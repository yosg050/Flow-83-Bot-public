import { supabase } from "./supabase-client-db.ts";

export async function updateUserLanguage(user_id: string, language: string) {
  const { error } = await supabase
    .from("users")
    .update({ language })
    .eq("id", user_id);

  if (error) {
    throw new Error(`Failed to update user language: ${error.message}`);
  }
}
