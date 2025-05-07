// Mirakl Sync Edge Function - Async Export Implementation
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { 
  launchExport, 
  pollExport, 
  downloadExportFiles,
  streamJSONLines,
  fetchProductDetails
} from '../_shared/mirakl.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

console.log("Edge Function starting with URL:", SUPABASE_URL);

const BATCH_SIZE = 100; // Max items to upsert in a single database operation

serve(async (req) => {
  console.log("Received request:", req.method, req.url);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS request with CORS headers");
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authorization = req.headers.get('authorization');
    const apiKey = req.headers.get('apikey');
    
    if (!authorization?.includes(SUPABASE_ANON_KEY) && apiKey !== SUPABASE_ANON_KEY) {
      console.log("Authentication failed");
      return new Response(
        JSON.stringify({ success: false, message: 'Unauthorized: Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Authentication successful");
    
    // Create Supabase client
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });

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

    // Extract request parameters - only storeId is required now
    const { storeId } = requestBody;
    
    console.log(`Processing request for storeId=${storeId}`);

    if (!storeId) {
      console.log("Missing required param: storeId");
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required parameter: storeId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get store info from database
    const { data: store, error: storeError } = await supabaseClient
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .single();

    if (storeError || !store) {
      console.error('Error finding store or store not found:', storeError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: storeError ? `Store query failed: ${storeError.message}` : 'Store not found' 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Found store:", store.id, store.store_name);

    if (!store.api_key || !store.domain) {
      console.error('Store missing credentials:', { hasApiKey: !!store.api_key, hasDomain: !!store.domain });
      return new Response(
        JSON.stringify({ success: false, message: 'Store is missing API credentials' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Start the background sync job and return accepted response immediately
    const syncPromise = syncMiraklProducts(store, supabaseClient);
    Deno.env.get('EDGE_RUNTIME') && globalThis.EdgeRuntime && EdgeRuntime.waitUntil(syncPromise);

    return new Response(
      JSON.stringify({ 
        accepted: true,
        message: 'Product sync job started' 
      }),
      { status: 202, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Unhandled error:', error);
    return new Response(
      JSON.stringify({ success: false, message: `An unexpected error occurred: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Main sync job function that runs in the background
async function syncMiraklProducts(store: any, supabaseClient: any): Promise<void> {
  const startTime = Date.now();
  console.log(`Starting async Mirakl product sync for store ${store.id}`);
  
  try {
    const baseUrl = store.domain.replace(/\/$/, '');
    let totalProcessed = 0;
    
    // Get direct CSV data stream instead of launching async export
    const csvDataStream = await launchExport(baseUrl, store.api_key);
    console.log('Received CSV data stream, processing...');
    
    // Process the CSV data
    totalProcessed = await processCSVStream(csvDataStream, store, supabaseClient);
    
    // Log completion summary
    const duration = (Date.now() - startTime) / 1000;
    console.log(`Sync completed in ${duration.toFixed(2)}s. Total products processed: ${totalProcessed}`);
    
  } catch (error) {
    console.error('Error in syncMiraklProducts:', error);
    throw error; // Re-throw to ensure the error is logged in the Supabase function logs
  }
}

// Process CSV data stream and convert to products
async function processCSVStream(stream: ReadableStream<Uint8Array>, store: any, supabaseClient: any): Promise<number> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let isHeader = true;
  let headers: string[] = [];
  let batch: any[] = [];
  let totalProcessed = 0;
  const BATCH_SIZE = 100;
  
  try {
    console.log('Starting CSV processing');
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        // Process any remaining items in the batch
        if (batch.length > 0) {
          const result = await processProductItems(batch, store, store.id, supabaseClient);
          totalProcessed += result.processedCount;
          console.log(`Final batch processed with ${result.processedCount} items. Total: ${totalProcessed}`);
        }
        break;
      }
      
      // Add new chunk to buffer
      buffer += decoder.decode(value, { stream: true });
      
      // Process lines
      const lines = buffer.split('\n');
      const lastLine = lines.pop() || ''; // Last line might be incomplete
      
      for (const line of lines) {
        if (!line.trim()) continue; // Skip empty lines
        
        if (isHeader) {
          // Process header row
          headers = line.split(';').map(h => h.trim());
          console.log(`CSV headers found: ${headers.join(', ')}`);
          isHeader = false;
          continue;
        }
        
        // Process data row
        const values = parseCSVLine(line);
        if (values.length === headers.length) {
          // Map CSV values to object using headers
          const product: any = {};
          headers.forEach((header, index) => {
            // Convert header like "product-sku" to "product_sku" for compatibility
            const key = header.replace(/-/g, '_');
            product[key] = values[index];
          });
          
          // Log complete raw data of the first product for debugging
          if (batch.length === 0 && totalProcessed === 0) {
            console.log('-------------------- FIRST RAW MIRAKL PRODUCT DATA --------------------');
            console.log('HEADERS:', headers);
            console.log('RAW VALUES:', values);
            console.log('MAPPED FIELDS:');
            Object.entries(product).forEach(([key, value]) => {
              console.log(`${key}: "${value}"`);
            });
            console.log('--------------------------------------------------------------------');
          }
          
          batch.push(product);
          
          // Process in batches
          if (batch.length >= BATCH_SIZE) {
            const result = await processProductItems(batch, store, store.id, supabaseClient);
            totalProcessed += result.processedCount;
            console.log(`Batch processed with ${result.processedCount} items. Total so far: ${totalProcessed}`);
            batch = [];
          }
        } else {
          console.warn(`Invalid CSV line: values count (${values.length}) doesn't match headers count (${headers.length})`);
        }
      }
      
      // Keep the potentially incomplete last line for the next iteration
      buffer = lastLine;
    }
    
    return totalProcessed;
  } finally {
    reader.releaseLock();
  }
}

// Helper function to parse CSV lines properly handling quoted fields
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let currentValue = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      // Toggle quote state
      inQuotes = !inQuotes;
    } else if (char === ';' && !inQuotes) {
      // End of field
      values.push(currentValue);
      currentValue = '';
    } else {
      // Add to current field
      currentValue += char;
    }
  }
  
  // Add the last field
  values.push(currentValue);
  
  return values;
}

// Process product items in batches, with individual inserts/updates
async function processProductItems(products: any[], store: any, storeId: number | string, supabaseClient: any) {
  console.log(`Processing batch of ${products.length} products`);
  
  // Get store user_id for product ownership before mapping products
  const userId = store.user_id;
  
  // First, try to fetch detailed product info for all products in batch
  const baseUrl = store.domain.replace(/\/$/, '');
  const productDetails: Record<string, any> = {};
  
  // Only fetch details for the first batch to avoid too many API calls
  if (products.length > 0) {
    try {
      const skuToProcess = products[0].product_sku;
      console.log(`Fetching product details for SKU: ${skuToProcess}`);
      
      const apiResponse = await fetchProductDetails(baseUrl, store.api_key, skuToProcess);
      
      // Check if the response has the offers array format
      if (apiResponse && apiResponse.offers && Array.isArray(apiResponse.offers)) {
        console.log(`Found ${apiResponse.offers.length} offers with details via API`);
        
        // Store details by product_sku for easy lookup
        for (const offer of apiResponse.offers) {
          if (offer.product_sku) {
            productDetails[offer.product_sku] = {
              title: offer.product_title,
              description: offer.product_description,
              brand: offer.product_brand
            };
          }
        }
        
        console.log(`Extracted detailed info for ${Object.keys(productDetails).length} products`);
      } else {
        console.log("API response doesn't contain offers array:", apiResponse);
      }
    } catch (error) {
      console.error('Error fetching detailed product info:', error);
    }
  }
  
  // Map products to products with proper field mapping based on CSV headers and API details
  const productsToSave = products.map(product => {
    const uniqueKey = product.shop_sku && product.shop_sku.trim() !== '' ? product.shop_sku : null;
    if (!uniqueKey) {
      console.warn(`Product ${product.offer_id} skipped due to missing or empty shop_sku.`);
      return null;
    }
    
    // Try to get detailed info from API response
    let title = 'Unnamed Product';
    let description = '';
    
    const detailedInfo = product.product_sku ? productDetails[product.product_sku] : null;
    
    if (detailedInfo) {
      // Use detailed API data if available
      title = detailedInfo.title || title;
      description = detailedInfo.description || description;
    } else {
      // Fallback to CSV data
      if (typeof product.shop_name === 'string' && product.shop_name.trim()) {
        title = product.shop_name.trim();
      } else if (typeof product.shop_sku === 'string' && product.shop_sku.trim()) {
        title = `Product ${product.shop_sku.trim()}`;
      }
    }
    
    return {
      mirakl_product_id: product.offer_id || '',
      title: title,
      description: description,
      price: parseFloat(product.price || 0),
      currency: product.currency_iso_code || 'USD',
      sku: uniqueKey,
      quantity: parseInt(product.quantity || '0', 10),
      image_url: '' // No image URL available yet
    };
  }).filter(p => p !== null);

  // Log the first mapped product
  if (productsToSave.length > 0) {
    console.log('FIRST MAPPED PRODUCT:', JSON.stringify(productsToSave[0], null, 2));
  }

  console.log(`Mapped ${productsToSave.length} valid products from products`);
  
  // Process products individually - more reliable than batch upsert
  let savedCount = 0;
  
  // Process each product individually
  for (let i = 0; i < productsToSave.length; i++) {
    const product = productsToSave[i];
    
    try {
      // Check if product already exists
      const { data: existingProducts, error: queryError } = await supabaseClient
        .from('products')
        .select('id')
        .eq('store_id', storeId)
        .eq('sku', product.sku)
        .limit(1);
        
      if (queryError) {
        console.error(`Error querying product with SKU ${product.sku}:`, queryError);
        continue;
      }
      
      const updateData = {
        title: product.title,
        description: product.description,
        price: product.price,
        image_url: product.image_url,
        inventory: product.quantity,
        updated_at: new Date().toISOString()
      };
      
      if (existingProducts && existingProducts.length > 0) {
        // Update existing product
        const existingProductId = existingProducts[0].id;
        
        const { error: updateError } = await supabaseClient
          .from('products')
          .update(updateData)
          .eq('id', existingProductId);
          
        if (updateError) {
          console.error(`Error updating product with SKU ${product.sku}:`, updateError);
          continue;
        }
      } else {
        // Insert new product
        const insertData = {
          ...updateData,
          owner_user_id: userId,
          store_id: storeId,
          sku: product.sku,
          currency: product.currency || 'USD',
          is_shared: false,
          created_at: new Date().toISOString()
        };
        
        const { error: insertError } = await supabaseClient
          .from('products')
          .insert([insertData]);
          
        if (insertError) {
          console.error(`Error inserting product with SKU ${product.sku}:`, insertError);
          continue;
        }
      }
      
      savedCount++;
      
      // Log progress periodically
      if (savedCount % 10 === 0 || savedCount === productsToSave.length) {
        console.log(`Progress: ${savedCount}/${productsToSave.length} products processed`);
      }
    } catch (itemError) {
      console.error(`Error processing product with SKU ${product.sku}:`, itemError);
    }
  }
  
  console.log(`Successfully processed ${savedCount} out of ${productsToSave.length} products`);
  
  return {
    processedCount: savedCount
  };
}
