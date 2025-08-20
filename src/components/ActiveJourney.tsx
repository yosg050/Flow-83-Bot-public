import React from "react";
import { useParams } from "react-router-dom";
import JourneyHeader from "./journey/JourneyHeader";
import JourneyProgress from "./journey/JourneyProgress";
import JourneyExplanations from "./journey/JourneyExplanations";
import JourneyPurchase from "./journey/JourneyPurchase";
import MobileChatView from "./journey/MobileChatView";
import JourneyChatSection from "./journey/JourneyChatSection";
import { useJourneyState } from "@/hooks/use-journey-state";
import { useMyContext } from "@/contexts/MyCustomProvider";

const ActiveJourney: React.FC = () => {
  // get journey id from the URL
  const { id } = useParams<{ id: string }>();

  // global context with journeys list
  const { journeysDB, categoriesDB, isLoading } = useMyContext();

  // still loading? show spinner / placeholder
  if (isLoading) {
    return <div className="container mx-auto py-20 text-center">Loading…</div>;
  }

  // find the requested journey
  const journey = journeysDB.find((j) => j.id === id);

  // if not found – render a dedicated “Not Found” state
  if (!journey) {
    return (
      <div className="container mx-auto py-20 text-center">
        Journey not found.
      </div>
    );
  }

  // hook that manages all journey-specific state
  const {
    currentDay,
    completed,
    isPurchased,
    showExplanations,
    showChatOnMobile,
    price,
    isMobile,
    lastMessage,
    savedProgress,
    handleComplete,
    handleNextDay,
    handlePurchase,
    handleContinueJourney,
    handleDismissExplanations,
    updateLastMessage,
    toggleMobileChat,
  } = useJourneyState(journey);

  /* ---------- mobile chat-only view ---------- */
  if (isMobile && showChatOnMobile && isPurchased) {
    return (
      <MobileChatView
        currentDay={currentDay}
        completed={completed}
        onComplete={handleComplete}
        onBack={() => toggleMobileChat()}
        lastUserMessage={lastMessage}
        onUpdateLastMessage={updateLastMessage}
        journeyCategory={journey.category}
        completedDays={savedProgress}
      />
    );
  }

  /* ---------- “regular” view ---------- */
  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="flex flex-col gap-8">
        <JourneyHeader journey={journey} />

        {/* explanations shown only before purchase */}
        {!isPurchased && (
          <JourneyExplanations
            journey={journey}
            showExplanations={showExplanations}
            onDismiss={handleDismissExplanations}
          />
        )}

        {isPurchased ? (
          <>
            <div className="mb-6">
              <JourneyProgress
                currentDay={currentDay}
                duration={journey.duration}
                onContinue={handleContinueJourney}
                completed={completed}
                onNext={handleNextDay}
              />
            </div>

            <div className="grid grid-cols-1 gap-6">
              <JourneyChatSection
                currentDay={currentDay}
                completed={completed}
                onComplete={handleComplete}
                isMobile={isMobile}
                onToggleChat={toggleMobileChat}
                lastUserMessage={lastMessage}
                onUpdateLastMessage={updateLastMessage}
                journeyCategory={journey.category}
                completedDays={savedProgress}
              />
            </div>
          </>
        ) : (
          <JourneyPurchase
            price={price}
            journeyTitle={journey.title}
            duration={journey.duration}
            isPurchased={isPurchased}
            onPurchase={handlePurchase}
            category={journey.category}
            journeyId={journey.id}
          />
        )}
      </div>
    </div>
  );
};

export default ActiveJourney;
