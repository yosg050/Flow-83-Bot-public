// Deno runtime on Supabase Edge Functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  // Handle CORS pre-flight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" },
    });
  }

  try {
    const { journeyId, category } = await req.json();

    // 1) try exact row
    const { data, error } = await supabase
      .from("journey_experiences")
      .select("title, experiences")
      .eq("journey_id", journeyId)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      return Response.json(data, { headers: { "Access-Control-Allow-Origin": "*" } });
    }

    // 2) fallback – pull default by category (optional table)
    const { data: fallback } = await supabase
      .from("category_experiences")         
      .select("title, experiences")
      .eq("category", category)
      .maybeSingle();

    return Response.json(
      fallback ?? { title: "General Experiences", experiences: [] },
      { headers: { "Access-Control-Allow-Origin": "*" } }
    );
  } catch (err) {
    console.error(err);
    return new Response("Server error", { status: 500 });
  }
});
