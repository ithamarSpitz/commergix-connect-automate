// Mirakl Sync Edge Function - Async Export Implementation
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { handleMiraklProcessFor900Products} from '../_shared/mirakl-offers.ts';
import { getUserIdDomainAndApiKey } from '../_shared/stores.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

console.log("Edge Function starting with URL:", SUPABASE_URL);


serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create a Supabase client using the Service Role Key
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false } // Important for server-side usage
    });

    // Extract request data
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request received:', { 
        storeId: requestBody.storeId || 'missing' 
      });
    } catch (jsonError) {
      console.error('Error parsing JSON request body:', jsonError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Invalid JSON in request body' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { storeId, offset } = requestBody;


    if (!offset) {
      console.log('Missing parameters:', { offset: !!offset });
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!storeId) {
      console.log('Missing parameters:', { storeId: !!storeId });
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }    // Get the user ID and API key from the database
    const userIdAndApiKey = await getUserIdDomainAndApiKey(storeId, supabaseClient);
    if (!userIdAndApiKey) { 
      console.error('User ID and API key not found for storeId:', storeId);
      return new Response(
        JSON.stringify({ success: false, message: 'User ID and API key not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const { userId, apiKey, domain } = userIdAndApiKey;

    // Call the Mirakl process function
    const result = await handleMiraklProcessFor900Products(domain, apiKey, storeId, userId, offset);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in Edge Function:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message || 'Internal Server Error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } 
}
, {
  onError: (error) => {
    console.error('Error in Edge Function:', error);
  },
});

