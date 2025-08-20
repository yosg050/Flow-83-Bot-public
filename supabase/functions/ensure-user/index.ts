// deno run --allow-env --allow-net ensure-user.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase env vars");
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
};

async function fetchJourneysAndCategories() {
  // 1. Journeys with their category (one row per journey-category link)
  const { data: journeysRaw, error: journeysErr } = await supabase
    .from("journey_categories")
    .select(`
      journey_id,
      categories ( id, name ),
      journeys (
        id,
        route_id,
        title,
        description,
        duration,
        image_url,
        status
      )
    `);
  if (journeysErr) throw journeysErr;

  const journeys = (journeysRaw ?? []).map((row) => ({
    id_UUID: row.journeys!.id,
    id: row.journeys!.route_id,
    title: row.journeys!.title,
    description: row.journeys!.description ?? "",
    duration: row.journeys!.duration,
    category_id: row.categories!.id,
    category: row.categories!.name,
    image_url: row.journeys!.image_url ?? "",
    status: row.journeys!.status,
  }));

  // 2. Distinct list of categories
  const { data: categories, error: categoriesErr } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");
  if (categoriesErr) throw categoriesErr;

  return { journeys, categories: categories ?? [] };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, name, profile_image_url } = await req.json();

    // -------- Validate email --------
    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid email" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    // -------- Ensure user exists --------
    let userId: string;

    const { data: existingUser, error: fetchErr } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (fetchErr && !fetchErr.message.includes("No rows")) throw fetchErr;

    if (existingUser) {
      userId = existingUser.id;
    } else {
      const { data: newUser, error: insertErr } = await supabase
        .from("users")
        .insert({
          email,
          name: name ?? null,
          profile_image_url: profile_image_url ?? null,
          created_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (insertErr) throw insertErr;
      userId = newUser.id;
    }

    // -------- Fetch journeys and categories --------
    const { journeys, categories } = await fetchJourneysAndCategories();

    // -------- Success response --------
    return new Response(
      JSON.stringify({ user_id: userId, journeys, categories }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (error) {
    console.error("Error in ensure-user:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
});

