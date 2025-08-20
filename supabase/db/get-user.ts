// file: user-profile.ts
import { supabase } from './supabase-client-db.ts'

/** 
 * Fetches the entire users row for a given user_id. 
 * You can destructure the fields you actually need in the caller.
 */
export async function getUser(
  user_id: string,
): Promise<Record<string, any>> {           
  const { data, error } = await supabase
    .from('users')                       
    .select('*')                         
    .eq('id', user_id)               
    .single()

  if (error) throw error
  return data
}