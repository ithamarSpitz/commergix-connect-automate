import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
// Use the Service Role Key for elevated privileges
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Helper function for retrying async operations
const retryAsync = async <T>(fn: () => Promise<T>, retries = 2, delay = 500): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    await new Promise(resolve => setTimeout(resolve, delay));
    console.log(`Retrying database operation... (${retries} retries left)`)
    return retryAsync(fn, retries - 1, delay);
  }
};

// This edge function validates Mirakl API credentials and updates the store
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
    const miraklApiUrlBase = apiUrl.trim().replace(/\/$/, ''); // Ensure no trailing slash
    console.log('Using Mirakl API Base URL:', miraklApiUrlBase);
    
    // Construct a specific endpoint URL for validation
    const validationUrl = `${miraklApiUrlBase}/api/orders?limit=1`; // Example: fetch first order
    console.log('Attempting validation with URL:', validationUrl);

    // Validate the API credentials by making a test call to the Mirakl API
    try {
      // Using the exact format from the working example
      console.log('Testing Mirakl API with a specific endpoint...');
      
      const response = await fetch(validationUrl, { // Use the specific validation URL
        headers: {
          'Authorization': apiKey,
          'Accept': 'application/json' // Often required by Mirakl APIs
        },
        // No body needed for a simple GET request like orders
      });
      
      console.log('Mirakl API validation response status:', response.status);
      
      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text(); // Try to get the response body
        } catch (e) {
          errorText = 'Could not read error response body.';
        }
        // Log the detailed error
        console.error(`Mirakl API validation failed. Status: ${response.status}, StatusText: ${response.statusText}, Body: ${errorText}`);
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
      // Add the URL tried in the error message
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Failed to validate Mirakl API credentials at ${validationUrl}. Please check URL and API Key. Error: ${apiError.message}` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get the store from the database, with retries
    try {
      const getStore = async () => {
        console.log(`Attempting to find store with ID: ${storeId}`);
        const { data: storeData, error: storeError } = await supabaseClient
          .from('stores')
          .select('*')
          .eq('id', storeId)
          .single();

        if (storeError) {
          // Throw specific error if not found, otherwise log and throw generic
          if (storeError.code === 'PGRST116') { // PostgREST code for "exact one row expected, 0 rows returned"
             console.warn(`Store with ID ${storeId} not found on this attempt.`);
             throw new Error(`Store not found (ID: ${storeId}) - will retry if possible.`);
          } else {
            console.error('Error finding store:', storeError);
            throw new Error(`Error finding store: ${storeError.message}`);
          }
        }
        if (!storeData) { // Should be covered by PGRST116, but double-check
          console.warn(`Store data is null for ID ${storeId} on this attempt.`);
          throw new Error(`Store not found (ID: ${storeId}) - will retry if possible.`);
        }
        return storeData;
      };

      const storeData = await retryAsync(getStore);
      
      console.log('Found store after potentially retrying:', storeData.id);
      
      // Update the store with the Mirakl credentials and set status to active
      const { error: updateError } = await supabaseClient
        .from('stores')
        .update({
          domain: miraklApiUrlBase, // Store the base URL
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
      console.error('Database operation error (final attempt):', dbError);
      // Make error message more specific if it's the store not found error
      const finalMessage = dbError.message.includes('Store not found') 
        ? `Store with ID ${storeId} could not be found after retries.`
        : `Database error: ${dbError.message}`;

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: finalMessage 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } } // Use 500 for internal errors like DB issues
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