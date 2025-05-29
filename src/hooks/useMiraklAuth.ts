
import { useState } from 'react';
import { supabaseClient } from './useSupabase';
import { useToast } from "@/hooks/use-toast";

export function useMiraklAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const initiateMiraklConnection = async (apiKey: string, apiUrl: string, storeId: string) => {
    if (!apiKey || !apiUrl) {
      toast({
        title: "Error",
        description: "Please enter all required fields",
        variant: "destructive",
      });
      return { success: false, message: "Missing required fields" };
    }

    try {
      setIsLoading(true);
      console.log('Connecting to Mirakl with API URL:', apiUrl);
      
      // Use the original URL without normalization
      const originalApiUrl = apiUrl.trim();
      
      // Create a nonce for verification
      const nonce = Math.random().toString(36).substring(2, 15);
      
      // Store the storeId in localStorage to retrieve it in the callback
      localStorage.setItem('connecting_store_id', storeId);
      
      // Call Edge Function to validate API credentials and set up the connection
      const response = await supabaseClient.functions.invoke('mirakl-connect', {
        body: { 
          apiKey, 
          apiUrl: originalApiUrl,
          storeId, 
          nonce 
        },
      });

      console.log('Mirakl connection response:', {
        data: response.data,
        error: response.error ? { message: response.error.message, name: response.error.name } : null
      });

      if (response.error) {
        throw new Error(response.error.message || 'Error calling Mirakl connect function');
      }

      if (response.data?.success) {
        toast({
          title: "Connection Successful",
          description: "Your Mirakl store has been connected successfully.",
        });
        return response.data;
      } else {
        throw new Error(response.data?.message || 'Failed to connect to Mirakl');
      }
    } catch (error) {
      console.error('Error connecting to Mirakl:', error);
      
      // More detailed error message
      let errorMessage = error.message;
      if (errorMessage.includes('Edge Function returned a non-2xx status code')) {
        errorMessage = 'Failed to validate Mirakl API credentials. Please check your API key and URL.';
      }
      
      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    initiateMiraklConnection,
    isLoading,
  };
}
