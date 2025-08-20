
import { useRef } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { toast } from '@/hooks/use-toast';
import { useMyContext } from '@/contexts/MyCustomProvider';
import { text } from 'stream/consumers';

export const useAIResponseGeneration = () => {
  const userResponses = useRef<string[]>([]);
  const supabase = useSupabaseClient();
  const { dbUserId } = useMyContext();
  if (!dbUserId) {
  console.warn("Waiting for dbUserId before calling generate-ai-response");
  return;
}
  // Generate responses to user messages
  const generateAIResponse = async (
    userInput: string,
    questionIndex: number = -1,
    currentDay: number = 1,
    userLanguage: string = 'en',
    currentJourney?: any,
    previousCompletedDays?: number[],
    userName?: string
  ): Promise<string> => {
    try {

      // Store user response for context
      userResponses.current.push(userInput);
      const payload ={
        kind: "user",
        user_id: dbUserId,
        journey_id: currentJourney?.id_UUID,
        text: userInput,
        userLanguage: userLanguage
      }
      console.log(' Payload to Supabase Function:', payload)

      const { data, error } = await supabase.functions.invoke('generate-ai-response', {
        body: payload
      });

      console.log('AI response data:', data); //dev-testing


      if (error) {
        console.error('Error calling AI function:', error);
        return "I'm reflecting on what you've shared. Please give me a moment to process this.";

      }

      return data.message;
    } catch (error) {
      console.error('Error generating AI response:', error);
      return "Thank you for sharing. I'm taking a moment to reflect on your input.";
    }
  };

  return {
    generateAIResponse
  };
};
