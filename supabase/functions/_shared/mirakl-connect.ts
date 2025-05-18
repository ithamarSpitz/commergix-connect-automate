// Mirakl API utility functions for async export flow (OF52 → OF53 → OF54)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Gets an OAuth access token from the Mirakl API using a store ID
 * This function fetches the store's API key from the database and extracts the OAuth credentials
 * @param storeId The ID of the store in the database
 * @returns Promise with the access token
 */
export async function getMiraklAccessToken(storeId: string): Promise<string>;

/**
 * Gets an OAuth access token from the Mirakl API
 * @param clientId The OAuth client ID
 * @param clientSecret The OAuth client secret
 * @param audience The company ID / audience value
 * @returns Promise with the access token
 */
export async function getMiraklAccessToken(clientId: string, clientSecret: string, audience: string): Promise<string>;

/**
 * Implementation of the getMiraklAccessToken function
 * @param clientIdOrStoreId Either the client ID or the store ID
 * @param clientSecret Optional client secret (only needed for the 3-param version)
 * @param audience Optional audience (only needed for the 3-param version)
 * @returns Promise with the access token
 */
export async function getMiraklAccessToken(
  clientIdOrStoreId: string, 
  clientSecret?: string, 
  audience?: string
): Promise<string> {
  // If only one parameter is provided, assume it's a store ID and fetch the API key
  if (arguments.length === 1) {
    const storeId = clientIdOrStoreId;
    console.log(`Getting Mirakl OAuth access token for store ID: ${storeId}`);

    // Get environment variables for Supabase connection
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required Supabase environment variables');
    }

    // Create Supabase client
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });

    // Fetch the store record from the database
    const { data: store, error } = await supabaseClient
      .from('stores')
      .select('api_key')
      .eq('id', storeId)
      .single();

    if (error) {
      console.error('Error fetching store:', error);
      throw new Error(`Failed to fetch store with ID ${storeId}: ${error.message}`);
    }

    if (!store || !store.api_key) {
      throw new Error(`Store with ID ${storeId} has no API key`);
    }

    // Parse the API key JSON to extract OAuth credentials
    try {
      const credentials = JSON.parse(store.api_key);
      
      // Recursively call the same function with the extracted credentials
      return await getMiraklAccessToken(
        credentials.client_id,
        credentials.client_secret,
        credentials.audience
      );
    } catch (parseError) {
      console.error('Error parsing API key JSON:', parseError);
      throw new Error('Invalid OAuth credentials format in store API key');
    }
  }
  // Original implementation with three parameters
  console.log('Getting Mirakl OAuth access token using direct credentials');
  
  // Ensure all three parameters are defined if we're using this version
  if (!clientSecret || !audience) {
    throw new Error('Missing required parameters: clientSecret or audience');
  }
  
  const tokenUrl = 'https://auth.mirakl.net/oauth/token';
  
  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'grant_type': 'client_credentials',
        'client_id': clientIdOrStoreId, // Use the clientIdOrStoreId parameter
        'client_secret': clientSecret,
        'audience': audience
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OAuth token request failed: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Failed to obtain OAuth token: ${response.status} ${response.statusText}`);
    }
    
    const tokenData = await response.json();
    
    if (!tokenData.access_token) {
      throw new Error('Access token not found in response');
    }
    
    console.log('Successfully obtained OAuth access token');
    return tokenData.access_token;
  } catch (error) {
    console.error('Error getting Mirakl access token:', error);
    throw error;
  }
}
