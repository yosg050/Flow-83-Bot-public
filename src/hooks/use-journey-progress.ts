
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
//dev-DB
/**
 * Hook to manage journey progress state
 */
export const useJourneyProgress = (journeyId: string | undefined, journeyDuration?: number) => {
  const { toast } = useToast();
  const [completed, setCompleted] = useState(false);
  const [currentDay, setCurrentDay] = useState(1); // Always start at day 1 after purchase
  const [savedProgress, setSavedProgress] = useState<number[]>([]); // Days completed
  
  const handleComplete = async () => {
    // Add the current day to saved progress if not already saved
    if (!savedProgress.includes(currentDay)) {
      setSavedProgress(prev => [...prev, currentDay]);
      
      // Update progress in the database if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && journeyId) {
        // Update user journey progress
        await supabase
          .from('user_journey_progress')
          .upsert({
            user_id: user.id,
            journey_id: journeyId,
            completed_days: [...savedProgress, currentDay],
            current_day: currentDay,
            last_interaction_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,journey_id'
          });
      }
      console.log("22", `Day ${currentDay} completed and saved to progress`); //dev-testing
      
    }
    
    setCompleted(true);
    toast("Great job! Your reflections have been saved and you've completed today's practice.");
  };

  const handleNextDay = async () => {
    // Only allow moving to the next day if we haven't reached the end of the journey
    if (journeyDuration && currentDay < journeyDuration) {
      const nextDay = currentDay + 1;
      // Move to the next day
      setCurrentDay(nextDay);
      setCompleted(false); // Reset completed state for the new day
      
      // Update in database if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && journeyId) {
        await supabase
          .from('user_journey_progress')
          .upsert({
            user_id: user.id,
            journey_id: journeyId,
            current_day: nextDay,
            last_interaction_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,journey_id'
          });
      }
      console.log("33", `Moved to Day ${nextDay} of the journey`); //dev-testing
      
      toast(`You're now on Day ${nextDay} of your journey. Keep up the great work!`);
    } else if (journeyDuration && currentDay >= journeyDuration) {
      // If we've reached the end of the journey, show a completion message
      toast(`Congratulations! You've completed all ${journeyDuration} days of this journey.`);
    }
  };

  // Load user progress on component mount if authenticated
  useEffect(() => {
    const loadUserProgress = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && journeyId) {
        const { data: progressData } = await supabase
          .from('user_journey_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('journey_id', journeyId)
          .single();
        
        if (progressData) {
          setCurrentDay(progressData.current_day || 1);
          setSavedProgress(progressData.completed_days || []);
          setCompleted(progressData.completed_days?.includes(progressData.current_day) || false);
        }
      }
      console.log("44", `User progress loaded for journey ${journeyId}`); //dev-testing
    };
    
    loadUserProgress();
  }, [journeyId]);

  return {
    currentDay,
    completed,
    savedProgress,
    handleComplete,
    handleNextDay,
  };
};
