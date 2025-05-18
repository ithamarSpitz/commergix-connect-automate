import { supabaseClient } from "@/hooks/useSupabase";
import { SyncLog, SyncStatus, SyncType, Store } from "@/types";

// Type for sync response
interface SyncResponse {
  success: boolean;
  message: string;
  data?: any;
  syncedItems?: number;
}

const supabaseUrl = "https://tueobdgcahbccqznnhjc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1ZW9iZGdjYWhiY2Nxem5uaGpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzODI1NTYsImV4cCI6MjA1OTk1ODU1Nn0.Hk9dxqu_WPZa7Vsn-PBO7kA2BRM39qxNQr1-6rNY4QA";

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
        products(first: 90) {
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

    try {      if (!store.domain || !store.api_key) {
        console.error('[Sync] Missing Mirakl credentials for store:', store.store_name);
        return { success: false, message: "Missing Mirakl credentials" };
      }

      console.log('[Sync] Using Edge Function proxy for Mirakl API call with fullSync=true');

      //call getOffersCount function below to get the number of offers in Mirakl
      const countResponse = await getOffersCount(store.id);
      if (!countResponse) {
        console.error('[Sync] Error getting offers count:');
        return { success: false, message: `Error getting offers count` };
      }
      const totalOffers = countResponse || 0;
      console.log('[Sync] Total offers in Mirakl:', totalOffers);
      if (totalOffers === 0) {
        console.log('[Sync] No offers to sync from Mirakl');
        return { success: true, message: "No offers to sync from Mirakl", syncedItems: 0 };
      }
  
      // Sync in batches of 900
      const batchCount = Math.ceil(totalOffers / 900);
      for (let i = 0; i < batchCount; i++) {
        const offset = (i * 900).toString();
        console.log(`[Sync] Syncing batch ${i + 1} of ${batchCount} with offset ${offset}`);
        const syncResponse = await sync900MiraklProducts(store.id, offset);
        if (!syncResponse) {
          console.error('[Sync] Error syncing products from Mirakl:');
          return { success: false, message: `Error syncing products from Mirakl` };
        }
        if (i === batchCount - 1) {
          console.log('[Sync] Last batch synced successfully'); 
        }else {
          console.log('[Sync] Batch synced successfully, waiting for 60 seconds before next batch');
          await sleep(60000); // Delay between batches
        }
      }
      
      console.log('[Sync] Successfully synced products from Mirakl');
      return {
        success: true,
        message: `Successfully synced products from Mirakl`,
        syncedItems: totalOffers
      };
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

// function that returns the number of offers in Mirakl
const getOffersCount = async (storeId: string): Promise<number> => {
        const getCountFunctionUrl = `${supabaseUrl}/functions/v1/mirakl-count-offers`;

  const response = await fetch(getCountFunctionUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            "apikey": SUPABASE_ANON_KEY
          },
          body: JSON.stringify({
            storeId: storeId,
          })
        });

  if (!response.ok) {
    throw new Error(`Error fetching offers count: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('Offers count response:', data);
  return data.count;
}

// function that syncs up to 900 products from Mirakl
const sync900MiraklProducts = async (storeId: string, offset: string): Promise<SyncResponse> => {
  const syncFunctionUrl = `${supabaseUrl}/functions/v1/mirakl-sync-900`;
  const response = await fetch(syncFunctionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "apikey": SUPABASE_ANON_KEY
    },
    body: JSON.stringify({
      storeId: storeId,
      offset: offset,
    })
  });

  if (!response.ok) {
    throw new Error(`Error syncing products: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('Sync response:', data);
  return data;
}
