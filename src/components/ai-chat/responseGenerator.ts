import { AIResponseGeneratorProps } from "./types";
import { getPersonality } from "./personalities";

// Generate personalized welcome message based on journey, user name, and current day
export const getWelcomeMessage = (
  currentJourney?: any,
  userName?: string
): string => {
  const personalization = userName ? `${userName}, welcome. ` : "Welcome. ";

  if (!currentJourney) {
    return `${personalization}I'm here to walk alongside you on this journey of growth and transformation. How are you feeling as we begin?`;
  }

  // Get personality based on journey category
  const personality = getPersonality(currentJourney.category);

  // Journey-specific welcome messages with personality in English - more personal and mentor-like
  const welcomeMessages: Record<string, string> = {};

  return (
    welcomeMessages[currentJourney.id] ||
    `${personalization}I'm here to guide you on your ${currentJourney.title} journey. I'll walk beside you through this ${currentJourney.duration}-day transformation. What brings your heart here today?`
  );
};
