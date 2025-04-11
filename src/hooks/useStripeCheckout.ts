
import { useState } from 'react';
import { supabaseClient } from './useSupabase';
import { useToast } from "@/hooks/use-toast";

type PriceType = 'paygo' | 'pro';

export function useStripeCheckout() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const initiateCheckout = async (priceType: PriceType) => {
    try {
      setIsLoading(true);

      const { data, error } = await supabaseClient.functions.invoke('create-checkout', {
        body: { priceType },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error initiating Stripe checkout:', error);
      toast({
        title: "Checkout Error",
        description: error.message || "Failed to start checkout process",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    initiateCheckout,
    isLoading,
  };
}
