
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

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
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user ID from JWT
    const jwt = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(jwt);
    
    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: "Invalid user token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Default stats with zeros
    let statsData = {
      totalProducts: 0,
      totalOrders: 0,
      revenue: 0,
      pendingOrders: 0
    };

    try {
      // Fetch products data
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('owner_user_id', userData.user.id);
      
      // We would fetch orders from an orders table if it existed
      const orders = [];
      
      // Update stats only if we have valid data
      if (products) {
        statsData.totalProducts = products.length;
        statsData.totalOrders = orders.length;
        statsData.revenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        statsData.pendingOrders = orders.filter(order => order.status === 'processing').length;
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }

    return new Response(
      JSON.stringify(statsData),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
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
});
