import { AIPersonality } from "./types";

// Define personalities for different journey categories with more intimate, personal and mentor-like tone
export const journeyPersonalities: Record<string, AIPersonality> = {};

// Default personality for fallback with more personal tone
export const defaultPersonality: AIPersonality = {
  name: "Teacher",
  tone: "Warm, Intuitive, Nurturing",
  specialties: ["Spreading Positive Light"],
  boundaries: {
    refusesTopics: ["Anything off topic"],
    refusalMessage:
      "I feel there is a deeper abundance journey calling to you. Let's explore paths that honor your authentic growth",
  },
};

// Get personality based on journey category
export const getPersonality = (journeyCategory?: string): AIPersonality => {
  if (!journeyCategory) return defaultPersonality;

  return journeyPersonalities[journeyCategory] || defaultPersonality;
};
