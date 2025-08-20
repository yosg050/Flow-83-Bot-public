import { supabase } from "./supabase-client-db.ts";


export async function getJourneyDayTemplates(days: number[]) {
    const { data, error } = await supabase
        .from('journey_day_templates')
        .select('day, instructions, questions')
        .in('day', days)
        .order('day', { ascending: true });

    if (error) throw error;
    return data;
}