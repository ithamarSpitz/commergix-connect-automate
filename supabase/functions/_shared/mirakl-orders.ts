// Mirakl API utility functions for async export flow (OF52 → OF53 → OF54)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Gets 100 Mirakl orders
 * @param domain Mirakl domain URL
 * @param apiKey Mirakl API key
 * @param offset for pagination
 * @returns with the orders details
 */
export async function get100Orders(domain: string, apiKey: string, offset: string): Promise<any> {
  console.log(`Getting Mirakl orders data`);

  const url = `https://${domain}/api/orders?offset=${offset}&max=100`;
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
 * Gets 900 Mirakl orders uses the 100 orders function to get the data
 * @param domain Mirakl domain URL
 * @param apiKey Mirakl API key
 * @param offset for pagination
 * @returns with the orders details
 */
export async function get900Orders(domain: string, apiKey: string, offset: string): Promise<any> {
  let orders: any[] = [];
  for (let i = 0; i < 9; i++) { 
    try {
      const response = await get100Orders(domain, apiKey, offset);
      
      // Check that the response has an orders array
      if (response && Array.isArray(response.orders)) {
        // Use concat instead of += for array concatenation
        orders = orders.concat(response.orders);
        console.log(`Got ${response.orders.length} orders in this batch, total: ${orders.length}`);
        if (response.orders.length < 100) {
          console.log(`Less than 100 orders received, stopping pagination`);
          break; // Stop if less than 100 orders are received
        }
      } else {
        console.error(`Invalid response format:`, response);
        throw new Error(`Invalid response format: orders array not found`);
      }
      
      offset = (parseInt(offset) + 100).toString();
      await sleep(1000); // Sleep for 1 second between requests
    } catch (error) {
      console.error(`Error in batch ${i}:`, error);
      throw error;
    }
  }   
  return orders;
}

/**
 * Gets amount of orders from Mirakl
 * @param domain Mirakl domain URL
 * @param apiKey Mirakl API key
 * @param offset for pagination
 * @returns with the orders details
 */
export async function getOrdersCount(domain: string, apiKey: string): Promise<any> {
  console.log(`Getting Mirakl orders count`);
  const url = `https://${domain}/api/orders?offset=0&max=1`;
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
    throw new Error(`Failed to fetch orders count: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  if (data && data.total_count) {
    console.log(`Got ${data.total_count} orders`); 
    return data.total_count;
  } else {
    console.error(`Error fetching orders count: ${response.status} ${response.statusText}`);
    throw new Error('Response data is invalid or missing total_count');
  }
}

/**
 * parses the orders data from the Mirakl API into orders table format
 * @param miraklOrders The Mirakl order data to parse
 * @param owner_user_id The user ID of the owner
 * @param store_id The store ID
 * @returns Promise with the orders and customers arrays
 */

export async function parseOrders(miraklOrders: any[], owner_user_id: string, store_id: string ): Promise<[any[], any[]]> {
  const orders: any[] = [];
  const orderItems: any[] = [];
  const customers: any[] = [];
  

  console.log(`Starting to parse ${miraklOrders.length} orders`);
  for (const miraklOrder of miraklOrders) {    const customer = {
      first_name: miraklOrder.customer?.first_name || '',
      last_name: miraklOrder.customer?.last_name || '',
      external_id: miraklOrder.customer?.email || miraklOrder.customer?.customer_id || '',
      country: miraklOrder.customer?.shipping_address?.country_iso_code || 
               miraklOrder.customer?.billing_address?.country_iso_code || '',
      phone_number: miraklOrder.customer?.shipping_address?.phone || 
               miraklOrder.customer?.billing_address?.phone || '0',
      city: miraklOrder.customer?.shipping_address?.city || 
            miraklOrder.customer?.billing_address?.city || '',
    };    customers.push(customer);
    // Safely handle order_lines with optional chaining
    const lineItems = miraklOrder.order_lines?.map((item: any) => ({
      sku: item.sku || '',
      quantity: item.quantity || 0,
      price: item.price || 0,
      total_price: item.total_price || 0,
      order_id: miraklOrder.commercial_id || '',
    })) || [];
    
    // Create order with null checks for all properties
    const order = {
      store_id: store_id,
      commercial_id: miraklOrder.commercial_id,
      provider_order_id : miraklOrder.order_id,
      customer_id: customer.external_id,
      owner_user_id: owner_user_id,
      shipping_address: miraklOrder.customer.shipping_address || "",
      billing_address: miraklOrder.customer.billing_address || "",
      order_date: new Date(miraklOrder.created_date),
      shipping_date: new Date(miraklOrder.shipped_date),
      recieved_date: new Date(miraklOrder.received_date),
      total_amount: miraklOrder.total_price,
      currency: miraklOrder.currency_iso_code,
      commission: miraklOrder.total_commission,
      status: miraklOrder.order_state,
      raw_data: miraklOrder,
    };
    orders.push(order);
  }
  console.log(`Parsed ${orders.length} orders from mirakl orders`);
  return [orders, customers];
}

/**
 * Deduplicates orders array by removing duplicate commercial_ids
 * @param orders The array of orders to deduplicate
 * @returns Deduplicated orders array
 */
function deduplicateOrders(orders: any[]): any[] {
  const commercialIdSet = new Set<string>();
  const commercialIdDuplicates: string[] = [];
  
  // Find duplicate commercial ids
  for (const order of orders) {
    if (commercialIdSet.has(order.commercial_id)) {
      commercialIdDuplicates.push(order.commercial_id);
    } else {
      commercialIdSet.add(order.commercial_id);
    }
  }
  
  if (commercialIdDuplicates.length > 0) {
    console.error(`Found ${commercialIdDuplicates.length} duplicate commercial ids within the orders array`);
    console.log('Duplicate commercial ids:', commercialIdDuplicates);
    
    // Keep only first occurrence of each commercial id
    const uniqueOrders = orders.filter((order, index, self) => 
      index === self.findIndex(p => p.commercial_id === order.commercial_id)
    );
    console.log(`Filtered out ${orders.length - uniqueOrders.length} duplicate orders`);
    return uniqueOrders;
  }
  
  return orders;
}

/**
 * Deduplicates customers array by removing duplicate external_ids
 * @param customers The array of customers to deduplicate
 * @returns Deduplicated customers array
 */
function deduplicateCustomers(customers: any[]): any[] {
  const externalIdSet = new Set<string>();
  const externalIdDuplicates: string[] = [];
  
  // Find duplicate external ids
  for (const customer of customers) {
    if (externalIdSet.has(customer.external_id)) {
      externalIdDuplicates.push(customer.external_id);
    } else {
      externalIdSet.add(customer.external_id);
    }
  }
  
  if (externalIdDuplicates.length > 0) {
    console.error(`Found ${externalIdDuplicates.length} duplicate external ids within the customers array`);
    console.log('Duplicate external ids:', externalIdDuplicates);
    
    // Keep only first occurrence of each external id
    const uniqueCustomers = customers.filter((customer, index, self) => 
      index === self.findIndex(p => p.external_id === customer.external_id)
    );
    console.log(`Filtered out ${customers.length - uniqueCustomers.length} duplicate customers`);
    return uniqueCustomers;
  }
  
  return customers;
}

/**
 * Updates orders in supabase using upsert functionality
 * @param orders The orders data to update 
 * @param customers The customers data to update
 * @returns Promise with the status
 */
export async function updateOrders(orders: any[]): Promise<any> {
  // Get environment variables for Supabase connection
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing required Supabase environment variables');
  }

  if (orders.length === 0) {
    console.log('No orders to update');
    return { count: 0, message: 'No orders to update' };
  }

  console.log(`Preparing to upsert ${orders.length} orders into the database`);
  
  // Create Supabase client
  const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });
  
  // First, remove duplicate commercial ids from the input array
  const uniqueOrders = deduplicateOrders(orders);
  
  // If after deduplication we have no orders, return early
  if (uniqueOrders.length === 0) {
    return { count: 0, message: 'No unique orders to update' };
  }
  
  try {
    // Use upsert with onConflict targeting the owner_user_id and sku columns
    const { data, error } = await supabaseClient
      .from('orders')
      .upsert(uniqueOrders, {
        onConflict: 'store_id,commercial_id', // Specify the constraint columns
        ignoreDuplicates: false // Update existing rows instead of ignoring
      });
    
    if (error) {
      console.error('Error upserting orders:', error);
      throw new Error(`Failed to upsert orders: ${error.message}`);
    }
    
    console.log(`Successfully upserted ${uniqueOrders.length} orders into the database`);
    return { count: uniqueOrders.length };
  } catch (upsertError) {
    console.error('Exception during orders upsert operation:', upsertError);
    throw upsertError;
  }
}

export async function updateCustomers(customers: any[]): Promise<any> {
  // Get environment variables for Supabase connection
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing required Supabase environment variables');
  }
  if (customers.length === 0) {
    console.log('No customers to update');
    return { count: 0, message: 'No customers to update' };
  }

  console.log(`Preparing to upsert ${customers.length} customers into the database`);
  
  // Create Supabase client
  const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });
  
  // First, remove duplicate external_ids from the input array
  const uniqueCustomers = deduplicateCustomers(customers);
  
  // If after deduplication we have no customers, return early
  if (uniqueCustomers.length === 0) {
    return { count: 0, message: 'No unique customers to update' };
  }
  
  try {
    // Use upsert with onConflict targeting the external_id column
    const { data, error } = await supabaseClient
      .from('customers')
      .upsert(uniqueCustomers, {
        onConflict: 'external_id', // Specify the constraint column
        ignoreDuplicates: false // Update existing rows instead of ignoring
      });
      if (error) {
      console.error('Error upserting customers:', error);
      throw new Error(`Failed to upsert customers: ${error.message}`);
    }
    
    console.log(`Successfully upserted ${uniqueCustomers.length} customers into the database`);
    return { count: uniqueCustomers.length };
  } catch (upsertError) {
    console.error('Exception during customers upsert operation:', upsertError);
    throw upsertError;
  }
}

/**
 * handle the proccess from getting the 900 orders to updating the orders
 * @param domain Mirakl domain URL
 * @param apiKey Mirakl API key
 * @param storeId The store ID
 * @param ownerUserId The user ID of the owner
 * @param offset for pagination
 * @returns Promise with the status
 */
export async function handleMiraklProcessFor900Orders(domain: string, apiKey: string, storeId: string, ownerUserId: string, offset: string): Promise<any> {
  try {
    // First step - get the orders
    console.log(`Starting Mirakl process with domain: ${domain}, storeId: ${storeId}, offset: ${offset}`);
    const miraklOrders = await get900Orders(domain, apiKey, offset);
    
    // Safety check
    if (!Array.isArray(miraklOrders)) {
      console.error('Orders is not an array:', typeof miraklOrders);
      throw new Error(`Invalid orders data format: ${typeof miraklOrders}`);
    }
    
    console.log(`Retrieved ${miraklOrders.length} orders from Mirakl`);
    
    // If no orders found, return early
    if (miraklOrders.length === 0) {
      return {
        success: true,
        message: "No orders found to process",
        count: 0
      };
    }
    
    // Second step - parse the orders into orders
    const [supabaseOrders, supabaseCustomers] = await parseOrders(miraklOrders, ownerUserId, storeId);
    
      // Third step - insert orders into the database
    try {
      const customersResult = await updateCustomers(supabaseCustomers);
      const insertedCustomersCount = customersResult?.count || 0;
      console.log(`Successfully processed ${insertedCustomersCount} customers out of ${supabaseCustomers.length} customers`);
      if (insertedCustomersCount === 0) {
        console.log("No customers were created from mirakl orders");
      }
      const result = await updateOrders(supabaseOrders);
      const insertedCount = result?.count || 0;
      console.log(`Successfully processed ${insertedCount} out of ${supabaseOrders.length} orders`);
      return {
        success: true,
        message: `Processed ${insertedCount} orders`,
        totalMiraklOrders: miraklOrders.length,
        totalSupabaseOrders: supabaseOrders.length,
        insertedOrders: insertedCount
      };
    } catch (dbError) {
      if (dbError.message && dbError.message.includes('unique constraint')) {
        console.log('Handling unique constraint violation');
        // The error is already logged in updateOrders
        return {
          success: false,
          message: "Duplicate commercial ids detected",
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