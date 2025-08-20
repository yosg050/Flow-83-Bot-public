
import { createRoot } from 'react-dom/client'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { supabase } from '@/integrations/supabase/client'
import App from './App.tsx'
import './index.css'
import { MyCustomProvider } from './contexts/MyCustomProvider.tsx'

createRoot(document.getElementById("root")!).render(
  <SessionContextProvider
    supabaseClient={supabase}
    initialSession={null}
  >
    <MyCustomProvider>
      <App />
    </MyCustomProvider>
  </SessionContextProvider>
);
