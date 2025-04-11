
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";

// This workaround helps handle redirects properly
export function useSupabase() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check for auth redirect with access_token
    const handleRedirectResult = async () => {
      const hashParams = new URLSearchParams(
        window.location.hash.substring(1) // Remove the '#' character
      );
      
      // Handle redirect with hash parameters (from email confirmation)
      if (hashParams.has('access_token')) {
        try {
          // Process the hash URL that contains the access token after email confirmation
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("Error processing auth redirect:", error);
          }
          
          // Clean up the URL by removing the hash parameters
          window.history.replaceState(null, '', window.location.pathname);
        } catch (error) {
          console.error("Failed to process auth redirect:", error);
        }
      }
      
      // Set isReady to true after handling any redirects
      setIsReady(true);
    };
    
    // Handle auth redirects and initialize
    handleRedirectResult();
  }, []);

  return { supabase, isReady };
}

// Export the supabaseClient for backward compatibility
// This will be used by existing code that imports supabaseClient directly
export const supabaseClient = supabase;
