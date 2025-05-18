/**
 * get the user id, domain and api key from the store id
 * @param storeId The store ID
 * @param supabaseClient The supabase client
 * @returns Promise with the user id and api key
 *  */
export async function getUserIdDomainAndApiKey(storeId: string, supabaseClient: any): Promise<{ userId: string, apiKey: string, domain: string }> {
  // Fetch the store record from the database
  const { data: store, error } = await supabaseClient
    .from('stores')
    .select('api_key, user_id, domain')
    .eq('id', storeId)
    .single();

  if (error) {
    console.error('Error fetching store:', error);
    throw new Error(`Failed to fetch store with ID ${storeId}: ${error.message}`);
  }
  if (!store || !store.api_key || !store.user_id || !store.domain) {
    throw new Error(`Store with ID ${storeId} has no API key, user ID, or domain`);
  }

  return { userId: store.user_id, apiKey: store.api_key, domain: store.domain };
} 