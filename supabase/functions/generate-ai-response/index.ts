import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

import { callChatCompletion, ChatMessage } from "./openai-client.ts";
import { saveAiInteraction } from "../../db/save-aiInteraction.ts";
import { buildPrompt } from "./prompt-templates.ts";
import { eventMessage } from "./event-message.ts";
import { updateUserLanguage } from "../../db/user_language.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
  "authorization, x-client-info, apikey, content-type",
};

// Types

interface UserBody {
  kind: "user";
  user_id: string;
  journey_id: string;
  text: string;
  userLanguage?: string;
}

interface EventBody {
  kind: "event";
  user_id: string;
  journey_id: string;
  event_type: string; // e.g. "welcome_intentions"
  payload?: Record<string, unknown>;
}

type ReqBody = UserBody | EventBody;

// Helpers

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorResponse(err: unknown): Response {
  console.error("generate-ai-response error:", err);
  const message = err instanceof Error ? err.message : String(err);
  return jsonResponse({ error: message, success: false }, 500);
}

// Flow: USER MESSAGE
async function handleUserMessage(body: UserBody): Promise<Response> {
  const { user_id, journey_id, text, userLanguage } = body;

  await updateUserLanguage(user_id, userLanguage || "en"); // Update user language preference

  const { base_system_prompt, journeyUserInfo } = await buildPrompt({
    user_id,
    journey_id,
    userLanguage,
  });
  const messages: ChatMessage[] = [
    { role: "system", content: base_system_prompt },
    { role: "system", content: journeyUserInfo },
    { role: "user", content: text || "" },
  ];
  const data = await callChatCompletion(messages);
  await saveAiInteraction({
    user_id,
    journey_id,
    message_content: text,
    ai_response: data.choices[0].message.content,
  });
  return jsonResponse({ message: data.choices[0].message.content, success: true });
}

// Flow: INTERNAL EVENT
async function handleEvent(body: EventBody): Promise<Response> {
  const { user_id, journey_id, event_type } = body;

  switch (event_type) {
    case "welcome_intentions": {
      const result = await eventMessage({
        user_id,
        journey_id,
      });
      if (!result) {
        return new Response(null, { status: 204, headers: corsHeaders });
      }
      const { message: generatedWelcome } = result;
      const messages: ChatMessage[] = [
        { role: "system", content: generatedWelcome },
      ];
      const data  = await callChatCompletion(messages);

      await saveAiInteraction({
        user_id,
        journey_id,
        message_content: "[event: welcome_intentions]",
        ai_response: data.choices[0].message.content,
      });

      return jsonResponse({
        message: data.choices[0].message.content,
        success: true,
      });
    }

    default:
      throw new Error(`Unknown event_type: ${event_type}`);
  }
}


// Main entrypoint

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const body = (await req.json()) as ReqBody;
    if (body.kind === "user") return await handleUserMessage(body);
    if (body.kind === "event") return await handleEvent(body);
    console.log(body);
    
    throw new Error("Unsupported kind value");
  } catch (err) {
    return errorResponse(err);
  }
});
