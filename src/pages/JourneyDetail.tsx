import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJourneyLessonTopics } from '@/data/journeys/lesson-topics';
import { getJourneyExperienceContent } from '@/data/journeys/journey-experiences';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from 'lucide-react';
import { getJourneyPrice } from '@/utils/journey-pricing';
import { toast } from "@/hooks/use-toast";
import JourneyDetailHero from '@/components/journey/JourneyDetailHero';
import JourneyPurchaseCard from '@/components/journey/JourneyPurchaseCard';
import { JourneyOverviewContent, JourneyPlanContent, JourneyTeacherContent } from '@/components/journey/JourneyTabsContent';
import JourneyMobilePurchaseBar from '@/components/journey/JourneyMobilePurchaseBar';
import { getMentorImage } from '@/components/journey/JourneyMentorHelper';
import { useMyContext } from '@/contexts/MyCustomProvider';

const JourneyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [mentorImage, setMentorImage] = useState<string>('');

  const { journeysDB, isLoading } = useMyContext();

  // מציג מסך טעינה בזמן שהנתונים נטענים
  if (isLoading) {
    return <div className="container mx-auto py-20 text-center">Loading...</div>;
  }

  const journey = journeysDB.find(j => j.id === id);

  if (!journey) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-2xl font-medium mb-4">Journey not found</h2>
        <Button onClick={() => navigate('/journeys')}>Back to Journeys</Button>
      </div>
    );
  }

  const lessonTopics = getJourneyLessonTopics(journey.id, journey.category, journey.duration);
  const experienceContent = getJourneyExperienceContent(journey.id, journey.category);
  const price = getJourneyPrice(journey.duration);

  useEffect(() => {
    if (!journey.teacher || !journey.id) return;
    const image = getMentorImage(journey.teacher, journey.id);
    setMentorImage(image);
  }, [journey.teacher, journey.id]);

  // רכישת מסע
  const handlePurchaseJourney = () => {
    toast({
      description: `You've successfully purchased "${journey.title}"`,
      variant: "default",
    });
    navigate(`/active-journey/${journey.id}`);
  };

  return (
    <main className="bg-gradient-to-b from-earth-50/30 to-spirit-50/30 min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Back button */}
        <Button
          variant="ghost"
          className="mb-6 group flex items-center gap-2 hover:bg-white/80"
          onClick={() => navigate('/journeys')}
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          <span>Back to Journeys</span>
        </Button>

        {/* Hero section */}
        <JourneyDetailHero journey={journey} />

        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <div className="flex-1">
            <Tabs
              defaultValue="overview"
              onValueChange={setActiveTab}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <div className="border-b border-spirit-100">
                <TabsList className="h-14 w-full bg-transparent rounded-none">
                  <TabsTrigger
                    value="overview"
                    className={`text-base h-14 data-[state=active]:border-b-2 border-spirit-600 rounded-none ${activeTab === 'overview' ? 'text-spirit-700 font-medium' : 'text-earth-600'}`}
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="journey-plan"
                    className={`text-base h-14 data-[state=active]:border-b-2 border-spirit-600 rounded-none ${activeTab === 'journey-plan' ? 'text-spirit-700 font-medium' : 'text-earth-600'}`}
                  >
                    Journey Plan
                  </TabsTrigger>
                  <TabsTrigger
                    value="about-teacher"
                    className={`text-base h-14 data-[state=active]:border-b-2 border-spirit-600 rounded-none ${activeTab === 'about-teacher' ? 'text-spirit-700 font-medium' : 'text-earth-600'}`}
                  >
                    About Mentor
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6 md:p-8">
                <JourneyOverviewContent experienceContent={experienceContent} />
                <JourneyPlanContent lessonTopics={lessonTopics} />
                <JourneyTeacherContent
                  teacher={journey.teacher}
                  duration={journey.duration}
                  mentorImage={mentorImage}
                />
              </div>
            </Tabs>
          </div>

          {/* Purchase Card - Desktop */}
          <div className="hidden md:block">
            <JourneyPurchaseCard
              price={price}
              duration={journey.duration}
              onPurchase={handlePurchaseJourney}
            />
          </div>
        </div>

        {/* Mobile purchase button */}
        <JourneyMobilePurchaseBar
          price={price}
          duration={journey.duration}
          onPurchase={handlePurchaseJourney}
        />
      </div>
    </main>
  );
};

export default JourneyDetail;
