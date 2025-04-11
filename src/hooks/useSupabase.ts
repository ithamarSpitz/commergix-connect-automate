
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export function useSupabase() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if supabase client is initialized
    if (supabase) {
      setIsReady(true);
    }
  }, []);

  return { supabase, isReady };
}

// Export the supabaseClient for backward compatibility
// This will be used by existing code that imports supabaseClient directly
export const supabaseClient = supabase;
