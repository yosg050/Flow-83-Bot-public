import "https://deno.land/x/xhr@0.1.0/mod.ts";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set in environment");
}

export async function callChatCompletion(messages: ChatMessage[]) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages,
      temperature: 0.8,
      max_tokens: 300,
    }),
  });

  if (!res.ok) {
    const errTxt = await res.text();
    throw new Error(`OpenAI request failed: ${res.status} ${res.statusText} – ${errTxt}`);
  }

  return await res.json();
}
