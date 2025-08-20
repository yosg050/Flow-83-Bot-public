import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';

export interface Journey {
  id_UUID: string;
  id: string;
  title: string;
  description: string;
  duration: number;
  category_id: string;
  category: string;
  image_url: string;
  status: string;
  teacher: string;
}

export interface Category {
  id: string;
  name: string;
}

type MyContextType = {
  dbUserId: string | null;
  setDbUserId: (id: string | null) => void;
  journeysDB: Journey[];
  categoriesDB: Category[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  getJourneyById: (id: string) => Journey | undefined;
  getJourneysByCategory: (catId: string) => Journey[];
};

const MyContext = createContext<MyContextType | undefined>(undefined);

export const MyCustomProvider = ({ children }: { children: ReactNode }) => {
  const session = useSession();

  const [dbUserId, setDbUserId] = useState<string | null>(null);
  const [journeysDB, setJourneysDB] = useState<Journey[]>([]);
  const [categoriesDB, setCategoriesDB] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshData = async () => {
    if (!session?.user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ensure-user', {
        body: {
          email: session.user.email,
          name: session.user.user_metadata?.name ?? '',
          profile_image_url: session.user.user_metadata?.avatar_url ?? '',
        },
      });

      if (error) throw error;

      setDbUserId(data.user_id);
      setJourneysDB(data.journeys ?? []);
      setCategoriesDB(data.categories ?? []);
    } catch (err) {
      console.error('MyCustomProvider ➜ refreshData error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) void refreshData();
  }, [session]);

  useEffect(() => {
    console.log('%c[MyCustomProvider] Updated state snapshot:', 'color: cyan; font-weight: bold;');
    console.log({ dbUserId, isLoading, journeyCount: journeysDB.length, categoryCount: categoriesDB.length });
    console.dir({ journeysDB, categoriesDB }, { depth: null });
  }, [dbUserId, journeysDB, categoriesDB, isLoading]);

  const getJourneyById = (id: string) => journeysDB.find(j => j.id === id);
  const getJourneysByCategory = (catId: string) =>
    journeysDB.filter(j => j.category_id === catId);

  return (
    <MyContext.Provider value={{
      dbUserId, setDbUserId,
      journeysDB, categoriesDB,
      isLoading, refreshData,
      getJourneyById, getJourneysByCategory,
    }}>
      {children}
    </MyContext.Provider>
  );
};

export const useMyContext = () => {
  const ctx = useContext(MyContext);
  if (!ctx) throw new Error('useMyContext must be used within MyCustomProvider');
  return ctx;
};
