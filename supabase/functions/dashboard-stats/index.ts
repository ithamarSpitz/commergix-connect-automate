// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.com/manual/getting_started/javascript_typescript

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface MonthlyStats {
  orderCount: number;
  revenue: number;
  orderCountChange: number;
  revenueChange: number;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Get authorization header from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Create Supabase client with the user's JWT
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get current user info to verify authentication
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get current date
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Calculate first day of current month
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    
    // Calculate first day of previous month
    const startOfPrevMonth = new Date(currentYear, currentMonth - 1, 1);
    
    // Format dates for Supabase query
    const currentMonthStart = startOfMonth.toISOString();
    const prevMonthStart = startOfPrevMonth.toISOString();

    // Fetch current month orders for the user
    const { data: currentMonthData, error: currentMonthError } = await supabaseClient
      .from('orders')
      .select('id, total_amount, currency')
      .eq('owner_user_id', user.id)
      .gte('created_at', currentMonthStart);

    if (currentMonthError) {
      throw new Error(currentMonthError.message);
    }

    // Fetch previous month orders
    const { data: previousMonthData, error: previousMonthError } = await supabaseClient
      .from('orders')
      .select('id, total_amount, currency')
      .eq('owner_user_id', user.id)
      .gte('created_at', prevMonthStart)
      .lt('created_at', currentMonthStart);

    if (previousMonthError) {
      throw new Error(previousMonthError.message);
    }

    // Calculate current month stats
    const currentOrderCount = currentMonthData?.length || 0;
    const currentRevenue = currentMonthData?.reduce((sum, order) => 
      sum + (parseFloat(order.total_amount) || 0), 0) || 0;

    // Calculate previous month stats
    const prevOrderCount = previousMonthData?.length || 0;
    const prevRevenue = previousMonthData?.reduce((sum, order) => 
      sum + (parseFloat(order.total_amount) || 0), 0) || 0;

    // Calculate percentage changes
    const orderCountChange = prevOrderCount === 0 
      ? 0 
      : ((currentOrderCount - prevOrderCount) / prevOrderCount) * 100;
    
    const revenueChange = prevRevenue === 0 
      ? 0 
      : ((currentRevenue - prevRevenue) / prevRevenue) * 100;

    const stats: MonthlyStats = {
      orderCount: currentOrderCount,
      revenue: currentRevenue,
      orderCountChange: parseFloat(orderCountChange.toFixed(1)),
      revenueChange: parseFloat(revenueChange.toFixed(1)),
    };

    return new Response(JSON.stringify({
      stats,
      message: currentOrderCount === 0 && prevOrderCount === 0 
        ? "No order data yet. Dashboard will update automatically when orders are created." 
        : null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error("Error in dashboard/stats function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
})
