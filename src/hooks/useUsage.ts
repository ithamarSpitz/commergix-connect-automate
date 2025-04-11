
import { useQuery } from '@tanstack/react-query';
import { supabaseClient } from './useSupabase';
import { useAuth } from '@/context/AuthContext';
import { PlanType } from '@/types';

interface UsageData {
  currentUsage: number;
  limit: number;
  percentUsed: number;
  isLimited: boolean;
}

export function useUsage() {
  const { user, userDetails } = useAuth();
  const planType = userDetails?.planType || 'free';

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['usage', user?.id],
    queryFn: async (): Promise<UsageData> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get current date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];

      try {
        // Fetch usage from database
        const { data, error } = await supabaseClient
          .from('usage_log')
          .select('action_count')
          .eq('user_id', user.id)
          .eq('date', today)
          .single();

        if (error && error.code !== 'PGRST116') {
          // PGRST116 means no rows returned
          console.error('Error fetching usage:', error);
          throw error;
        }

        const currentUsage = data?.action_count || 0;

        // Define limits based on plan type
        let limit = 0;
        let isLimited = true;

        switch (planType as PlanType) {
          case 'free':
            limit = 100;
            break;
          case 'paygo':
            limit = Infinity;
            isLimited = false;
            break;
          case 'pro':
            limit = Infinity;
            isLimited = false;
            break;
          default:
            limit = 100;
        }

        return {
          currentUsage,
          limit,
          percentUsed: limit === Infinity ? 0 : Math.min(100, (currentUsage / limit) * 100),
          isLimited,
        };
      } catch (error) {
        console.error('Error in useUsage:', error);
        // Return default values if there's an error
        return {
          currentUsage: 0,
          limit: planType === 'free' ? 100 : Infinity,
          percentUsed: 0,
          isLimited: planType === 'free',
        };
      }
    },
    enabled: !!user,
  });

  return {
    usage: data || { currentUsage: 0, limit: 0, percentUsed: 0, isLimited: true },
    isLoading,
    error,
    refetch,
  };
}
