import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

// This edge function validates Mirakl API credentials and updates the store
serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Create a Supabase client
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Extract request data
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request received:', { 
        apiKey: requestBody.apiKey ? '***hidden***' : 'missing', 
        apiUrl: requestBody.apiUrl || 'missing', 
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
    
    const { apiKey, apiUrl, storeId, nonce } = requestBody;
    
    if (!apiKey || !apiUrl || !storeId) {
      console.log('Missing parameters:', { 
        apiKey: !!apiKey, 
        apiUrl: !!apiUrl, 
        storeId: !!storeId 
      });
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Missing required parameters' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Use the API URL exactly as provided in the request
    const miraklApiUrl = apiUrl.trim();
    console.log('Using Mirakl API URL:', miraklApiUrl);
    
    // Validate the API credentials by making a test call to the Mirakl API
    try {
      // Using the exact format from the working example
      console.log('Testing Mirakl API with exact implementation from working example...');
      
      const response = await fetch(miraklApiUrl, {
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json'
        },
        // Using params in the actual URL query string since we don't need them for the test
        // This just verifies the connection works
      });
      
      console.log('Mirakl API response status:', response.status);
      
      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (e) {
          // Ignore error reading response body
        }
        
        throw new Error(`API validation failed with status: ${response.status}. Response: ${errorText}`);
      }
      
      // Try to parse the response
      try {
        const responseData = await response.json();
        console.log('Got valid Mirakl API response');
      } catch (e) {
        console.warn('Could not parse response as JSON, but connection was successful');
      }
      
      console.log('Mirakl API validation successful');
      
    } catch (apiError) {
      console.error('API validation error:', apiError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Failed to validate Mirakl API credentials: ${apiError.message}` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get the store from the database to verify it exists
    try {
      const { data: storeData, error: storeError } = await supabaseClient
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .single();
      
      if (storeError) {
        console.error('Error finding store:', storeError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `Error finding store: ${storeError.message}` 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (!storeData) {
        console.error('Store not found:', storeId);
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Store not found' 
          }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log('Found store:', storeData.id);
      
      // Update the store with the Mirakl credentials and set status to active
      const { error: updateError } = await supabaseClient
        .from('stores')
        .update({
          domain: miraklApiUrl,
          api_key: apiKey,
          status: 'active',
        })
        .eq('id', storeId);
      
      if (updateError) {
        console.error('Error updating store:', updateError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `Error updating store: ${updateError.message}` 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log('Store updated successfully');
      
      // Return success response
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Mirakl store connected successfully' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (dbError) {
      console.error('Database operation error:', dbError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Database error: ${dbError.message}` 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
  } catch (error) {
    console.error('Mirakl connection error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: `An error occurred: ${error.message}` 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});