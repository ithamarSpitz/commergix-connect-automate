
import { useState } from 'react';
import { supabaseClient } from './useSupabase';
import { useToast } from "@/hooks/use-toast";

export function useShopifyOAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const initiateOAuth = async (shopDomain: string) => {
    if (!shopDomain) {
      toast({
        title: "Error",
        description: "Please enter a shop domain",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Normalize the shop domain
      let normalizedDomain = shopDomain.trim().toLowerCase();
      if (!normalizedDomain.includes('.')) {
        normalizedDomain = `${normalizedDomain}.myshopify.com`;
      }
      if (!normalizedDomain.startsWith('http')) {
        normalizedDomain = `https://${normalizedDomain}`;
      }

      // Create a nonce to validate the callback
      const nonce = Math.random().toString(36).substring(2, 15);
      
      // Store the nonce in localStorage (will be checked in the callback)
      localStorage.setItem('shopify_oauth_nonce', nonce);

      // Get the callback URL from Supabase Edge Function
      const { data, error } = await supabaseClient.functions.invoke('shopify-oauth-start', {
        body: { shop: normalizedDomain, nonce },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.authUrl) {
        // Redirect to Shopify OAuth
        window.location.href = data.authUrl;
      } else {
        throw new Error('Failed to get Shopify authorization URL');
      }
    } catch (error) {
      console.error('Error initiating Shopify OAuth:', error);
      toast({
        title: "OAuth Error",
        description: error.message || "Failed to connect to Shopify",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    initiateOAuth,
    isLoading,
  };
}
