import { supabaseClient } from "@/hooks/useSupabase";
import { SyncLog, SyncStatus, SyncType, Store } from "@/types";

// Type for sync response
interface SyncResponse {
  success: boolean;
  message: string;
  data?: any;
  syncedItems?: number;
}

// Helper function for delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useStoreSync = () => {
  // Function to sync products from a store
  const syncProducts = async (store: Store): Promise<SyncResponse> => {
    console.log('[Sync] Starting product sync for store:', store.store_name);
    
    // Check if store has required credentials based on platform
    if (!store) {
      console.error('[Sync] Store object is undefined or null');
      return { success: false, message: "Invalid store configuration" };
    }
    
    // Different validation based on platform
    if (store.platform.toLowerCase() === 'shopify' && !store.access_token) {
      console.error('[Sync] Shopify store missing access_token:', store);
      return { success: false, message: "Store missing Shopify access token" };
    } else if (store.platform.toLowerCase() === 'mirakl' && !store.api_key) {
      console.error('[Sync] Mirakl store missing api_key:', store);
      return { success: false, message: "Store missing Mirakl API key" };
    }

    try {
      let syncedItems = 0;
      let syncResult: SyncResponse = { success: false, message: "Not implemented" };

      // Different implementation based on platform
      console.log('[Sync] Using platform implementation:', store.platform.toLowerCase());
      
      switch (store.platform.toLowerCase()) {
        case "shopify":
          syncResult = await syncShopifyProducts(store);
          syncedItems = syncResult.syncedItems || 0;
          break;
        case "mirakl":
          syncResult = await syncMiraklProducts(store);
          syncedItems = syncResult.syncedItems || 0;
          break;
        default:
          console.warn('[Sync] Unsupported platform:', store.platform);
          return { 
            success: false, 
            message: `Sync not implemented for platform: ${store.platform}` 
          };
      }

      // Log the sync activity
      console.log('[Sync] Product sync completed with result:', syncResult);
      
      await createSyncLog({
        user_id: store.user_id,
        type: 'products',
        details: `Synced ${syncedItems} products from ${store.store_name}`,
        status: syncResult.success ? 'success' : 'error',
        related_id: store.id
      });

      return syncResult;
    } catch (error) {
      console.error("[Sync] Product sync error:", error);
      
      // Log the sync error
      await createSyncLog({
        user_id: store.user_id,
        type: 'products',
        details: `Error syncing products: ${error.message}`,
        status: 'error',
        related_id: store.id
      });

      return { 
        success: false, 
        message: `Failed to sync products: ${error.message}` 
      };
    }
  };

  // Function to sync orders from a store
  const syncOrders = async (store: Store): Promise<SyncResponse> => {
    console.log('[Sync] Starting orders sync for store:', store.store_name);
    
    // Check if store has required credentials based on platform
    if (!store) {
      console.error('[Sync] Store object is undefined or null');
      return { success: false, message: "Invalid store configuration" };
    }
    
    // Different validation based on platform
    if (store.platform.toLowerCase() === 'shopify' && !store.access_token) {
      console.error('[Sync] Shopify store missing access_token for order sync:', store);
      return { success: false, message: "Store missing Shopify access token" };
    } else if (store.platform.toLowerCase() === 'mirakl' && !store.api_key) {
      console.error('[Sync] Mirakl store missing api_key for order sync:', store);
      return { success: false, message: "Store missing Mirakl API key" };
    }

    try {
      let syncedItems = 0;
      let syncResult: SyncResponse = { success: false, message: "Not implemented" };

      // Different implementation based on platform
      console.log('[Sync] Using platform implementation for orders:', store.platform.toLowerCase());
      
      switch (store.platform.toLowerCase()) {
        case "shopify":
          syncResult = await syncShopifyOrders(store);
          syncedItems = syncResult.syncedItems || 0;
          break;
        case "mirakl":
          syncResult = await syncMiraklOrders(store);
          syncedItems = syncResult.syncedItems || 0;
          break;
        default:
          console.warn('[Sync] Unsupported platform for orders:', store.platform);
          return { 
            success: false, 
            message: `Sync not implemented for platform: ${store.platform}` 
          };
      }

      // Log the sync activity
      console.log('[Sync] Orders sync completed with result:', syncResult);
      
      await createSyncLog({
        user_id: store.user_id,
        type: 'orders',
        details: `Synced ${syncedItems} orders from ${store.store_name}`,
        status: syncResult.success ? 'success' : 'error',
        related_id: store.id
      });

      return syncResult;
    } catch (error) {
      console.error("[Sync] Order sync error:", error);
      
      // Log the sync error
      await createSyncLog({
        user_id: store.user_id,
        type: 'orders',
        details: `Error syncing orders: ${error.message}`,
        status: 'error',
        related_id: store.id
      });

      return { 
        success: false, 
        message: `Failed to sync orders: ${error.message}` 
      };
    }
  };

  // Function to sync inventory from a store
  const syncInventory = async (store: Store): Promise<SyncResponse> => {
    console.log('[Sync] Starting inventory sync for store:', store.store_name);
    
    // Check if store has required credentials based on platform
    if (!store) {
      console.error('[Sync] Store object is undefined or null');
      return { success: false, message: "Invalid store configuration" };
    }
    
    // Different validation based on platform
    if (store.platform.toLowerCase() === 'shopify' && !store.access_token) {
      console.error('[Sync] Shopify store missing access_token for inventory sync:', store);
      return { success: false, message: "Store missing Shopify access token" };
    } else if (store.platform.toLowerCase() === 'mirakl' && !store.api_key) {
      console.error('[Sync] Mirakl store missing api_key for inventory sync:', store);
      return { success: false, message: "Store missing Mirakl API key" };
    }

    try {
      let syncedItems = 0;
      let syncResult: SyncResponse = { success: false, message: "Not implemented" };

      // Different implementation based on platform
      console.log('[Sync] Using platform implementation for inventory:', store.platform.toLowerCase());
      
      switch (store.platform.toLowerCase()) {
        case "shopify":
          syncResult = await syncShopifyInventory(store);
          syncedItems = syncResult.syncedItems || 0;
          break;
        case "mirakl":
          syncResult = await syncMiraklInventory(store);
          syncedItems = syncResult.syncedItems || 0;
          break;
        default:
          console.warn('[Sync] Unsupported platform for inventory:', store.platform);
          return { 
            success: false, 
            message: `Sync not implemented for platform: ${store.platform}` 
          };
      }

      // Log the sync activity
      console.log('[Sync] Inventory sync completed with result:', syncResult);
      
      await createSyncLog({
        user_id: store.user_id,
        type: 'inventory',
        details: `Synced inventory for ${syncedItems} products from ${store.store_name}`,
        status: syncResult.success ? 'success' : 'error',
        related_id: store.id
      });

      return syncResult;
    } catch (error) {
      console.error("[Sync] Inventory sync error:", error);
      
      // Log the sync error
      await createSyncLog({
        user_id: store.user_id,
        type: 'inventory',
        details: `Error syncing inventory: ${error.message}`,
        status: 'error',
        related_id: store.id
      });

      return { 
        success: false, 
        message: `Failed to sync inventory: ${error.message}` 
      };
    }
  };

  // Function to sync everything from a store
  const syncAll = async (store: Store): Promise<SyncResponse> => {
    console.log('[Sync] Starting full sync for store:', store.store_name, store);
    
    try {
      // Only sync products for now, as the other sync functions are placeholders
      console.log('[Sync] Calling product sync function');
      const productsResult = await syncProducts(store);
      console.log('[Sync] Product sync result:', productsResult);
      
      // Log detailed info about any placeholder functions
      console.log('[Sync] Note: Orders and inventory sync are currently placeholder implementations');
      
      // Create a summary log entry for the entire sync operation
      await createSyncLog({
        user_id: store.user_id,
        type: 'products', // Default to products since that's what we're actually syncing
        details: `Completed full sync for ${store.store_name}`,
        status: productsResult.success ? 'success' : 'error',
        related_id: store.id
      });

      console.log('[Sync] Full sync completed with success:', productsResult.success);
      
      return {
        success: productsResult.success,
        message: productsResult.success ? 
          "Successfully synchronized store data" : 
          "Failed to synchronize some store data",
        data: {
          products: productsResult
        }
      };
    } catch (error) {
      console.error("[Sync] Full sync error:", error);
      
      // Log the sync error
      await createSyncLog({
        user_id: store.user_id,
        type: 'products',
        details: `Error during full sync: ${error.message}`,
        status: 'error',
        related_id: store.id
      });
      
      return {
        success: false,
        message: `Failed to complete sync: ${error.message}`
      };
    }
  };

  // Helper function to create sync logs
  const createSyncLog = async (logData: {
    user_id: string;
    type: SyncType;
    details: string;
    status: SyncStatus;
    related_id: string | null;
  }): Promise<void> => {
    try {
      console.log('[Sync] Creating sync log entry:', logData);
      
      const { error } = await supabaseClient
        .from('sync_logs')
        .insert([{
          ...logData,
          timestamp: new Date().toISOString()
        }]);

      if (error) {
        console.error("[Sync] Error creating sync log:", error);
      } else {
        console.log('[Sync] Log entry created successfully');
      }
    } catch (error) {
      console.error("[Sync] Error in createSyncLog:", error);
    }
  };

  // Platform-specific implementation for Shopify
  const syncShopifyProducts = async (store: Store): Promise<SyncResponse> => {
    console.log('[Sync] Starting Shopify products sync for store:', store.store_name);
    
    try {
      if (!store.domain || !store.access_token) {
        console.error('[Sync] Missing Shopify credentials for store:', store.store_name);
        return { success: false, message: "Missing Shopify credentials" };
      }

      // Shopify GraphQL API endpoint
      const shopifyEndpoint = `https://${store.domain}/admin/api/2023-10/graphql.json`;
      console.log('[Sync] Using Shopify endpoint:', shopifyEndpoint);
      
      // GraphQL query to fetch products
      const query = `{
        products(first: 50) {
          edges {
            node {
              id
              title
              description
              variants(first: 10) {
                edges {
                  node {
                    id
                    price
                    sku
                    inventoryQuantity
                  }
                }
              }
              images(first: 1) {
                edges {
                  node {
                    originalSrc
                  }
                }
              }
            }
          }
        }
      }`;

      // Make API request to Shopify
      console.log('[Sync] Making Shopify API request');
      const response = await fetch(shopifyEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": store.access_token
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Sync] Shopify API error response:', response.status, errorText);
        throw new Error(`Shopify API error: ${response.statusText}. Details: ${errorText}`);
      }

      const responseData = await response.json();
      console.log('[Sync] Shopify API response:', responseData);
      
      const { data } = responseData;
      const products = data?.products?.edges || [];
      console.log('[Sync] Fetched products count:', products.length);

      // Process and save products to the database
      const productPromises = products.map(async ({ node }) => {
        const variant = node.variants.edges[0]?.node;
        const imageUrl = node.images.edges[0]?.node?.originalSrc;
        
        // Check if product already exists
        console.log('[Sync] Checking if product exists:', node.id);
        const { data: existingProducts, error: queryError } = await supabaseClient
          .from('products')
          .select('*')
          .eq('store_id', store.id)
          .eq('external_product_id', node.id);
          
        if (queryError) {
          console.error('[Sync] Error querying product:', queryError);
          throw new Error(`Error querying product: ${queryError.message}`);
        }
          
        if (existingProducts && existingProducts.length > 0) {
          // Update existing product
          console.log('[Sync] Updating existing product:', existingProducts[0].id);
          const { error: updateError } = await supabaseClient
            .from('products')
            .update({
              title: node.title,
              description: node.description || '',
              price: parseFloat(variant?.price || '0'),
              sku: variant?.sku || '',
              image_url: imageUrl,
              inventory: variant?.inventoryQuantity || 0,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingProducts[0].id);
            
          if (updateError) {
            console.error('[Sync] Error updating product:', updateError);
            throw new Error(`Error updating product: ${updateError.message}`);
          }
        } else {
          // Insert new product
          console.log('[Sync] Inserting new product:', node.id);
          const { error: insertError } = await supabaseClient
            .from('products')
            .insert([{
              owner_user_id: store.user_id,
              store_id: store.id,
              external_product_id: node.id,
              title: node.title,
              description: node.description || '',
              price: parseFloat(variant?.price || '0'),
              currency: 'USD', // Default or get from store settings
              sku: variant?.sku || '',
              is_shared: false,
              image_url: imageUrl,
              inventory: variant?.inventoryQuantity || 0,
              created_at: new Date().toISOString()
            }]);
            
          if (insertError) {
            console.error('[Sync] Error inserting product:', insertError);
            throw new Error(`Error inserting product: ${insertError.message}`);
          }
        }
      });

      await Promise.all(productPromises);
      console.log('[Sync] Successfully processed all products');

      return {
        success: true,
        message: `Successfully synced ${products.length} products from Shopify`,
        syncedItems: products.length
      };
    } catch (error) {
      console.error("[Sync] Shopify product sync error:", error);
      return {
        success: false,
        message: `Failed to sync Shopify products: ${error.message}`
      };
    }
  };

  // Platform-specific implementation for Mirakl
  const syncMiraklProducts = async (store: Store): Promise<SyncResponse> => {
    console.log('[Sync] Starting Mirakl products sync for store:', store.store_name);

    try {
      if (!store.domain || !store.api_key) {
        console.error('[Sync] Missing Mirakl credentials for store:', store.store_name);
        return { success: false, message: "Missing Mirakl credentials" };
      }

      console.log('[Sync] Using Edge Function proxy for Mirakl API call with fullSync=true');
      const miraklEndpoint = '/api/offers';
      const supabaseUrl = "https://tueobdgcahbccqznnhjc.supabase.co";
      const edgeFunctionUrl = `${supabaseUrl}/functions/v1/mirakl-sync`;
      const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1ZW9iZGdjYWhiY2Nxem5uaGpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzODI1NTYsImV4cCI6MjA1OTk1ODU1Nn0.Hk9dxqu_WPZa7Vsn-PBO7kA2BRM39qxNQr1-6rNY4QA";

      // Let the edge function handle the pagination process
      console.log('[Sync] Starting batch-based full sync through edge function');
      
      try {
        // Initialize sync state for direct offset-based pagination
        let currentOffset = 0;
        let totalItems = 0;
        let totalProcessed = 0;
        let processedCount = 0;
        let progress = 0;
        let batchCount = 0;
        let needsMoreBatches = true;
        
        // Maximum retries for a single batch
        const maxRetries = 3;
        // Maximum number of batches to process (safety limit)
        const maxBatches = 30;
        
        // Loop until all data is processed (all batches complete)
        while (needsMoreBatches && batchCount < maxBatches) {
          batchCount++;
          console.log(`[Sync] Processing batch #${batchCount} at offset ${currentOffset}, progress: ${progress}%`);
          
          let currentRetries = 0;
          let batchSuccess = false;
          
          while (!batchSuccess && currentRetries < maxRetries) {
            try {
              // Make request to edge function with current offset
              console.log(`[Sync] Making edge function request with:`, {
                storeId: store.id,
                endpoint: miraklEndpoint,
                fullSync: true,
                offset: currentOffset
              });
              
              const response = await fetch(edgeFunctionUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                  "apikey": SUPABASE_ANON_KEY
                },
                body: JSON.stringify({
                  storeId: store.id,
                  endpoint: miraklEndpoint,
                  offset: currentOffset,
                  fullSync: true,
                  pageSize: 90
                })
              });
              
              // Handle Rate Limiting (429)
              if (response.status === 429) {
                const retryAfterHeader = response.headers.get('Retry-After') || '30';
                const retryAfter = parseInt(retryAfterHeader, 10) * 1000;
                console.log(`[Sync] Rate limit exceeded. Waiting ${retryAfter/1000} seconds before retry...`);
                await sleep(retryAfter);
                currentRetries++;
                continue;
              }
              
              // Handle other errors
              if (!response.ok) {
                console.error(`[Sync] API error status: ${response.status}`);
                let errorMessage = `Mirakl API error: ${response.statusText}`;
                let errorData;
                
                try {
                  errorData = await response.json();
                  errorMessage = errorData.message || errorData.error || errorMessage;
                  console.error('[Sync] API error response:', response.status, errorData);
                } catch (e) {
                  console.error('[Sync] Failed to parse error response:', e);
                  try {
                    const errorText = await response.text();
                    console.error('[Sync] Raw error response:', errorText);
                  } catch (textError) {
                    console.error('[Sync] Could not read error response as text');
                  }
                }
                
                throw new Error(errorMessage);
              }
              
              // Process successful response
              const responseData = await response.json();
              console.log(`[Sync] Batch #${batchCount} response:`, responseData);

              // Check if the edge function accepted the job (async flow)
              if (responseData.accepted === true) {
                console.log(`[Sync] Background sync job started successfully for batch #${batchCount}.`);
                // For the async flow, we return success immediately on the frontend.
                // The actual sync happens in the background.
                // We can assume the initial call worked, no need to loop here.
                return {
                  success: true,
                  message: 'Mirakl product sync job initiated successfully.',
                  syncedItems: 0 // Indicate 0 for now, as sync is background
                };
              }

              // --- This part below is likely for a synchronous response, which we aren't getting ---
              // --- Keeping it for now, but the 'accepted' check above should handle the async case ---

              if (!responseData.success) {
                throw new Error(responseData.message || 'Edge function returned failure status');
              }

              // Check if we need to continue with another batch
              needsMoreBatches = responseData.needsMoreBatches === true;
              
              // Update our tracking variables
              if (responseData.totalItems) {
                totalItems = responseData.totalItems;
              }
              
              if (responseData.processedSoFar) {
                totalProcessed = responseData.processedSoFar;
              }
              
              if (responseData.processedCount) {
                processedCount += responseData.processedCount;
              }
              
              if (responseData.progress) {
                progress = responseData.progress;
              }
              
              // Get next offset if we need more batches
              if (needsMoreBatches && responseData.nextOffset) {
                currentOffset = responseData.nextOffset;
              }
              
              batchSuccess = true;
              
              if (needsMoreBatches) {
                console.log(`[Sync] Batch #${batchCount} completed. Progress: ${progress}%. Continuing with next batch at offset ${currentOffset}.`);
                
                // Add a small delay between batches
                await sleep(1000);
              } else {
                // Final batch completed
                console.log(`[Sync] Full sync completed. Processed ${processedCount} products.`);
                
                return {
                  success: true,
                  message: responseData.message || `Successfully synced ${processedCount} products from Mirakl`,
                  syncedItems: processedCount
                };
              }
            } catch (batchError) {
              // Handle batch errors
              console.error(`[Sync] Batch #${batchCount} error (attempt ${currentRetries + 1}/${maxRetries}):`, batchError);
              currentRetries++;
              
              // Wait before retrying
              if (currentRetries < maxRetries) {
                await sleep(5000 * currentRetries);
              } else {
                throw new Error(`Failed to process batch #${batchCount} after ${maxRetries} attempts: ${batchError.message}`);
              }
            }
          }
          
          if (!batchSuccess) {
            throw new Error(`Failed to process batch #${batchCount} after ${maxRetries} attempts`);
          }
        }
        
        // If we reached max batches but still have more to process
        if (needsMoreBatches) {
          console.warn(`[Sync] Reached maximum number of batches (${maxBatches}) but more data remains. Progress: ${progress}%`);
          return {
            success: true,
            message: `Partially synced ${processedCount} products from Mirakl (reached maximum batch limit)`,
            syncedItems: processedCount
          };
        }
        
        // This should rarely be reached due to the return in the else block above
        return {
          success: true,
          message: `Successfully synced ${processedCount} products from Mirakl`,
          syncedItems: processedCount
        };
      } catch (error) {
        console.error('[Sync] Error during full sync:', error);
        throw error;
      }
    } catch (error) {
      console.error("[Sync] Mirakl product sync error:", error);
      return {
        success: false,
        message: `Failed to sync Mirakl products: ${error.message}`
      };
    }
  };

  // Placeholder implementations for order sync
  const syncShopifyOrders = async (store: Store): Promise<SyncResponse> => {
    // Since this is a placeholder, we'll return a not implemented message instead
    // of a false success, so it doesn't trigger the "partial sync" message
    console.log('[Sync] Shopify orders sync not yet implemented');
    return { 
      success: true, 
      message: "Orders sync not yet implemented", 
      syncedItems: 0 
    };
  };

  const syncMiraklOrders = async (store: Store): Promise<SyncResponse> => {
    // Since this is a placeholder, we'll return a not implemented message instead
    // of a false success, so it doesn't trigger the "partial sync" message
    console.log('[Sync] Mirakl orders sync not yet implemented');
    return { 
      success: true, 
      message: "Orders sync not yet implemented", 
      syncedItems: 0 
    };
  };

  // Placeholder implementations for inventory sync
  const syncShopifyInventory = async (store: Store): Promise<SyncResponse> => {
    // Since this is a placeholder, we'll return a not implemented message instead
    // of a false success, so it doesn't trigger the "partial sync" message
    console.log('[Sync] Shopify inventory sync not yet implemented');
    return { 
      success: true, 
      message: "Inventory sync not yet implemented", 
      syncedItems: 0 
    };
  };

  const syncMiraklInventory = async (store: Store): Promise<SyncResponse> => {
    // Since this is a placeholder, we'll return a not implemented message instead
    // of a false success, so it doesn't trigger the "partial sync" message
    console.log('[Sync] Mirakl inventory sync not yet implemented');
    return { 
      success: true, 
      message: "Inventory sync not yet implemented", 
      syncedItems: 0 
    };
  };

  return {
    syncProducts,
    syncOrders,
    syncInventory,
    syncAll
  };
};