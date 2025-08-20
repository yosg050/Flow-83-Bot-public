// src/hooks/useMessageManagement.ts
// Handles chat state and communicates with the Supabase Edge Function
// that generates the opening AI message. All wording logic lives in the backend.

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useMyContext } from "@/contexts/MyCustomProvider";
import { Message } from "../types";

interface UseMessageManagementProps {
  currentJourney?: { id_UUID?: string };
  updateLastActivity: () => void;
  setWaitingForResponse: (waiting: boolean) => void;
  onUpdateLastMessage?: (message: string) => void;
}

export const useMessageManagement = ({
  currentJourney,
  updateLastActivity,
  setWaitingForResponse,
  onUpdateLastMessage,
}: UseMessageManagementProps) => {
  const supabase = useSupabaseClient();
  const { dbUserId } = useMyContext();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [welcomeRequested, setWelcomeRequested] = useState(false);

  /** Request the welcome message once, immediately after mount */
  useEffect(() => {
    if (!currentJourney?.id_UUID || !dbUserId || welcomeRequested) return;

    const fetchWelcome = async () => {
      const payload = {
        kind: "event",
        user_id: dbUserId,
        journey_id: currentJourney.id_UUID,
        event_type: "welcome_intentions",
      };

      const { data, error } = await supabase.functions.invoke(
        "generate-ai-response",
        { body: payload },
      );

      if (error) {
        console.error("Network / server error:", error);
        return;
      }

      if (data?.message) {
        // 200 OK + message
        const aiMessage: Message = {
          id: `welcome-${Date.now()}`, // unique key for React
          content: data.message,
          sender: "ai",
          timestamp: new Date(),
        };

        setMessages([aiMessage]);
        setWaitingForResponse(true);
      } else {
        // 204 No Content (or 200 without message)
        setWaitingForResponse(false);
      }

      updateLastActivity();
      setWelcomeRequested(true);  // block further requests
    };

    fetchWelcome();
  }, [
    currentJourney?.id_UUID,
    dbUserId,
    welcomeRequested,
    supabase,
    setWaitingForResponse,
    updateLastActivity,
  ]);

  /** Add a user message to the conversation */
  const addUserMessage = (content: string): void => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date(),
    };

    if (onUpdateLastMessage) onUpdateLastMessage(content);

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setWaitingForResponse(false);
    updateLastActivity();
  };

  /** Add an AI message to the conversation (used after backend calls) */
  const addAIMessage = (content: string): void => {
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content,
      sender: "ai",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);
    setWaitingForResponse(true);
    updateLastActivity();
  };

  /** Typing indicator helpers */
  const startTyping = () => setIsTyping(true);
  const stopTyping = () => setIsTyping(false);

  return {
    messages,
    setMessages,
    input,
    setInput,
    isTyping,
    addUserMessage,
    addAIMessage,
    startTyping,
    stopTyping,
  };
};
