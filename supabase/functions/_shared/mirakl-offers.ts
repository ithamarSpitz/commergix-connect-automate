// Mirakl API utility functions for async export flow (OF52 → OF53 → OF54)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Gets 100 Mirakl offers
 * @param domain Mirakl domain URL
 * @param apiKey Mirakl API key
 * @param offset for pagination
 * @returns with the offers details
 */
export async function get100Offers(domain: string, apiKey: string, offset: string): Promise<any> {
  console.log(`Getting Mirakl offers data`);

  const url = `https://${domain}/api/offers?offset=${offset}&max=100`;
  const method = 'GET';
  console.log(`Attempting to ${method} to ${url}`);
  
  let response = await fetch(url, {
    method: method,
    headers: {
      'Authorization': `${apiKey}`,
      'Accept': 'application/json'
    }
  });

  // Maximum number of retry attempts
  const maxRetries = 3;
  let retryCount = 0;

  while (!response.ok && retryCount < maxRetries) {
    // Check specifically for 429 Too Many Requests error
    if (response.status === 429) {
      retryCount++;
      if (retryCount >= maxRetries) {
        const errorText = await response.text();
        console.error(`Mirakl data fetch failed after ${maxRetries} attempts: ${response.status} ${response.statusText} from ${method} ${url}`, errorText);
        throw new Error(`Invalid response format: { status: 429, message: "Too Many Requests" }`);
      }
      
      console.log(`Mirakl API returned 429 Too Many Requests, retrying in 60 seconds... (Attempt ${retryCount} of ${maxRetries})`);
      await sleep(60000); // Wait for 60 seconds before retrying
      
      response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `${apiKey}`,
          'Accept': 'application/json'
        }
      });
    } else {
      // For other errors, just try once more as before
      console.log(`Mirakl API returned ${response.status}, retrying in 1 minute...`);
      await sleep(60000);
      response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `${apiKey}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Mirakl data fetch failed: ${response.status} ${response.statusText} from ${method} ${url}`, errorText);
        throw new Error(`Failed to fetch export data: ${response.status} ${response.statusText}`);
      }
      break;
    }
  }

  // Check the actual content type returned by the server
  const contentType = response.headers.get('content-type');
  console.log(`Received response with Content-Type: ${contentType}`);

  try {
    // Parse the JSON response
    const data = await response.json();
    console.log(`Parsed response data successfully`);
    return data;
  } catch (err) {
    console.error(`Error parsing response data:`, err);
    throw new Error(`Failed to parse response data: ${err.message}`);
  }
}

/**
 * Gets 900 Mirakl offers uses the 100 offers function to get the data
 * @param domain Mirakl domain URL
 * @param apiKey Mirakl API key
 * @param offset for pagination
 * @returns with the offers details
 */
export async function get900Offers(domain: string, apiKey: string, offset: string): Promise<any> {
  let offers: any[] = [];
  for (let i = 0; i < 9; i++) { 
    try {
      const response = await get100Offers(domain, apiKey, offset);
      
      // Check that the response has an offers array
      if (response && Array.isArray(response.offers)) {
        // Use concat instead of += for array concatenation
        offers = offers.concat(response.offers);
        console.log(`Got ${response.offers.length} offers in this batch, total: ${offers.length}`);
        if (response.offers.length < 100) {
          console.log(`Less than 100 offers received, stopping pagination`);
          break; // Stop if less than 100 offers are received
        }
      } else {
        console.error(`Invalid response format:`, response);
        throw new Error(`Invalid response format: offers array not found`);
      }
      
      offset = (parseInt(offset) + 100).toString();
      await sleep(1000); // Sleep for 1 second between requests
    } catch (error) {
      console.error(`Error in batch ${i}:`, error);
      throw error;
    }
  }   
  return offers;
}

/**
 * Gets amount of offers from Mirakl
 * @param domain Mirakl domain URL
 * @param apiKey Mirakl API key
 * @param offset for pagination
 * @returns with the offers details
 */
export async function getOffersCount(domain: string, apiKey: string): Promise<any> {
  console.log(`Getting Mirakl offers count`);
  const url = `https://${domain}/api/offers?offset=0&max=1`;
  const method = 'GET';
  console.log(`Attempting to ${method} to ${url}`);
  const response = await fetch(url, {
    method: method,
    headers: {
      'Authorization': `${apiKey}`,
      'Accept': 'application/json'
    }
  });
  
  if (!response.ok) {   
    const errorText = await response.text();
    console.error(`Mirakl data fetch failed: ${response.status} ${response.statusText} from ${method} ${url}`, errorText);
    throw new Error(`Failed to fetch offers count: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  if (data && data.total_count) {
    console.log(`Got ${data.total_count} offers`); 
    return data.total_count;
  } else {
    console.error(`Error fetching offers count: ${response.status} ${response.statusText}`);
    throw new Error('Response data is invalid or missing total_count');
  }
}

/**
 * parses the offers data from the Mirakl API into product table format
 * @param offers The offer data to update
 * @param owner_user_id The user ID of the owner
 * @param store_id The store ID
 * @returns Promise with the products
 */

export async function parseOffers(offers: any[], owner_user_id: string, store_id: string ): Promise<any[]> {
  const products: any[] = [];
  const skuMap = new Map(); // To track SKUs and detect duplicates
  const duplicateSkus = new Map(); // To store duplicate SKUs and their count
  
  console.log(`Starting to parse ${offers.length} offers`);
  
  for (const offer of offers) {
    const product = {
      shop_sku: offer.shop_sku,
      provider_sku: offer.product_sku,
      title: offer.product_title,
      description: offer.product_description,
      reference: offer.product_references[0]?.reference || '',
      category: offer.category_label,
      brand: offer.product_brand,
      price: offer.total_price,
      currency: offer.currency_iso_code,
      is_shared: false,
      updated_at: new Date(),
      image_url: "",
      inventory: offer.quantity,
      store_id: store_id,
      owner_user_id: owner_user_id
    };    
    products.push(product);
  }
  
  console.log(`Parsed ${products.length} products from offers`);
  
  return products;
}

/**
 * Deduplicates products array by removing duplicate SKUs
 * @param products The array of products to deduplicate
 * @returns Deduplicated products array
 */
function deduplicateProducts(products: any[]): any[] {
  const skuSet = new Set<string>();
  const referenceSet = new Set<string>();
  const referenceDuplicates: string[] = [];
  const skuDuplicates: string[] = [];
  
  // Find duplicate SKUs
  for (const product of products) {
    if (skuSet.has(product.shop_sku)) {
      skuDuplicates.push(product.shop_sku);
    } else {
      skuSet.add(product.shop_sku);
    }
    if (referenceSet.has(product.reference)) {
      referenceDuplicates.push(product.reference);
    } else {
      referenceSet.add(product.reference);
    }
  }
  
  if (skuDuplicates.length > 0) {
    console.error(`Found ${skuDuplicates.length} duplicate SKUs within the products array`);
    console.log('Duplicate SKUs:', skuDuplicates);
  
  if (referenceDuplicates.length > 0) {
    console.error(`Found ${referenceDuplicates.length} duplicate references within the products array`);
    console.log('Duplicate references:', referenceDuplicates);
  }
    
    // Keep only first occurrence of each SKU
    const uniqueProducts = products.filter((product, index, self) => 
      index === self.findIndex(p => p.shop_sku === product.shop_sku)
    );
    console.log(`Filtered out ${products.length - uniqueProducts.length} duplicate products by SKU`);

    //keep only first occurrence of each reference
    const uniqueProductsByReference = uniqueProducts.filter((product, index, self) => 
      index === self.findIndex(p => p.reference === product.reference)
    );
    console.log(`Filtered out ${uniqueProducts.length - uniqueProductsByReference.length} duplicate products by reference`);
    console.log(`Final unique products count: ${uniqueProductsByReference.length}`);
    // Return the unique products
    return uniqueProducts;
  }
  
  return products;
}

/**
 * Updates products in supabase using upsert functionality
 * @param products The product data to update 
 * @returns Promise with the status
 */
export async function updateProducts(products: any[]): Promise<any> {
  // Get environment variables for Supabase connection
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing required Supabase environment variables');
  }

  if (products.length === 0) {
    console.log('No products to update');
    return { count: 0, message: 'No products to update' };
  }

  console.log(`Preparing to upsert ${products.length} products into the database`);
  
  // Create Supabase client
  const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });
  
  // First, remove duplicate SKUs from the input array
  const uniqueProducts = deduplicateProducts(products);
  
  // If after deduplication we have no products, return early
  if (uniqueProducts.length === 0) {
    return { count: 0, message: 'No unique products to update' };
  }
  
  try {
    // Use upsert with onConflict targeting the owner_user_id and sku columns
    const { data, error } = await supabaseClient
      .from('products')
      .upsert(uniqueProducts, {
        onConflict: 'owner_user_id,shop_sku', // Specify the constraint columns
        ignoreDuplicates: false // Update existing rows instead of ignoring
      });
    
    if (error) {
      console.error('Error upserting products:', error);
      throw new Error(`Failed to upsert products: ${error.message}`);
    }
    
    console.log(`Successfully upserted ${uniqueProducts.length} products into the database`);
    return { count: uniqueProducts.length };
  } catch (upsertError) {
    console.error('Exception during product upsert operation:', upsertError);
    throw upsertError;
  }
}

/**
 * handle the proccess from getting the 900 offers to updating the products
 * @param domain Mirakl domain URL
 * @param apiKey Mirakl API key
 * @param storeId The store ID
 * @param ownerUserId The user ID of the owner
 * @param offset for pagination
 * @returns Promise with the status
 */
export async function handleMiraklProcessFor900Products(domain: string, apiKey: string, storeId: string, ownerUserId: string, offset: string): Promise<any> {
  try {
    // First step - get the offers
    console.log(`Starting Mirakl process with domain: ${domain}, storeId: ${storeId}, offset: ${offset}`);
    const offers = await get900Offers(domain, apiKey, offset);
    
    // Safety check
    if (!Array.isArray(offers)) {
      console.error('Offers is not an array:', typeof offers);
      throw new Error(`Invalid offers data format: ${typeof offers}`);
    }
    
    console.log(`Retrieved ${offers.length} offers from Mirakl`);
    
    // If no offers found, return early
    if (offers.length === 0) {
      return {
        success: true,
        message: "No offers found to process",
        count: 0
      };
    }
    
    // Second step - parse the offers into products
    const products = await parseOffers(offers, ownerUserId, storeId);
    
    // If no products were created, return early
    if (products.length === 0) {
      return {
        success: true,
        message: "No products were created from offers",
        count: 0
      };
    }
    
    // Third step - insert products into the database
    try {
      const result = await updateProducts(products);
      const insertedCount = result?.count || 0;
      console.log(`Successfully processed ${insertedCount} out of ${products.length} products`);
      
      return {
        success: true,
        message: `Processed ${insertedCount} products`,
        totalOffers: offers.length,
        totalProducts: products.length,
        insertedProducts: insertedCount
      };
    } catch (dbError) {
      if (dbError.message && dbError.message.includes('unique constraint')) {
        console.log('Handling unique constraint violation');
        // The error is already logged in updateProducts
        return {
          success: false,
          message: "Duplicate SKUs detected",
          error: dbError.message
        };
      } else {
        throw dbError; // Re-throw if it's not a duplicate key error
      }
    }
  } catch (error) {
    console.error('Error in Mirakl process:', error);
    throw error;
  }
}

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