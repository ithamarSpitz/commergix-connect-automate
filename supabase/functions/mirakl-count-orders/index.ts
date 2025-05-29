// Mirakl Count Orders Edge Function
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { getOrdersCount } from '../_shared/mirakl-orders.ts';
import { getUserIdDomainAndApiKey } from '../_shared/stores.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

console.log("Mirakl Count Orders Edge Function starting with URL:", SUPABASE_URL);

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (jsonError) {
      console.error('Error parsing JSON request body:', jsonError);
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract request parameters
    const { storeId } = requestBody;
    
    if (!storeId) {
      console.log("Missing required param: storeId");
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required parameter: storeId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing order count request for store ID: ${storeId}`);
    
    // Create Supabase client
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });

    // Get store info (user ID, domain and API key)
    const userIdAndApiKey = await getUserIdDomainAndApiKey(storeId, supabaseClient);
    if (!userIdAndApiKey) {
      return new Response(
        JSON.stringify({ success: false, message: 'Store not found or missing API credentials' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { userId, domain, apiKey } = userIdAndApiKey;    // Get an OAuth access token using the store ID
    console.log("Got OAuth token from credentials");
    
    // Call the getOrdersCount function to get the number of orders in Mirakl
    const count = await getOrdersCount(domain, apiKey);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        count: count,
        message: `Found ${count} orders in Mirakl`
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in Edge Function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message || 'Internal Server Error',
        error: error.toString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}, {
  onError: (error) => {
    console.error('Error in Edge Function:', error);
  },
});
