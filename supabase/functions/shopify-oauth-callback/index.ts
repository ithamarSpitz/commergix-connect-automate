import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
const SHOPIFY_API_KEY = Deno.env.get('SHOPIFY_API_KEY') || '';
const SHOPIFY_API_SECRET = Deno.env.get('SHOPIFY_API_SECRET') || '';
const APP_URL = Deno.env.get('APP_URL') || 'http://localhost:3000';

// This edge function handles the OAuth callback from Shopify
serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Create a Supabase client
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Parse the URL to get query parameters
    const url = new URL(req.url);
    const shop = url.searchParams.get('shop');
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    
    if (!shop || !code) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Exchange the authorization code for an access token
    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: SHOPIFY_API_KEY,
        client_secret: SHOPIFY_API_SECRET,
        code,
      }),
    });
    
    if (!tokenResponse.ok) {
      throw new Error(`Failed to get access token: ${tokenResponse.statusText}`);
    }
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    if (!accessToken) {
      throw new Error('No access token received from Shopify');
    }
    
    // Get shop info from Shopify API
    const shopResponse = await fetch(`https://${shop}/admin/api/2023-04/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
      },
    });
    
    if (!shopResponse.ok) {
      throw new Error(`Failed to get shop info: ${shopResponse.statusText}`);
    }
    
    const shopData = await shopResponse.json();
    
    // Find pending store in database based on domain
    const { data: storeData, error: storeError } = await supabaseClient
      .from('stores')
      .select('*')
      .eq('status', 'pending')
      .ilike('domain', `%${shop}%`)
      .maybeSingle();
    
    if (storeError) {
      throw new Error(`Error finding store: ${storeError.message}`);
    }
    
    let storeId;
    
    if (!storeData) {
      // Try to find by store name as fallback
      const shopName = shopData.shop.name;
      const { data: fallbackStore, error: fallbackError } = await supabaseClient
        .from('stores')
        .select('*')
        .eq('status', 'pending')
        .ilike('store_name', `%${shopName}%`)
        .maybeSingle();
      
      if (fallbackError || !fallbackStore) {
        // Create a new store if none found
        const { data: newStore, error: newStoreError } = await supabaseClient
          .from('stores')
          .insert({
            store_name: shopData.shop.name,
            domain: shop,
            platform: 'shopify',
            access_token: accessToken,
            api_key: SHOPIFY_API_KEY,
            status: 'active',
            // You'll need to get the user_id from the session or a parameter
            user_id: url.searchParams.get('user_id'),
          })
          .select('*')
          .single();
        
        if (newStoreError) {
          throw new Error(`Error creating new store: ${newStoreError.message}`);
        }
        
        storeId = newStore.id;
      } else {
        storeId = fallbackStore.id;
      }
    } else {
      storeId = storeData.id;
    }
    
    // Update the store with access token and change status to active
    const { error: updateError } = await supabaseClient
      .from('stores')
      .update({
        domain: shop,
        access_token: accessToken,
        api_key: SHOPIFY_API_KEY,
        status: 'active',
      })
      .eq('id', storeId);
    
    if (updateError) {
      throw new Error(`Error updating store: ${updateError.message}`);
    }
    
    // Redirect back to the application
    return Response.redirect(`${APP_URL}/settings/connections?success=true&shop=${shop}`);
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    
    // Redirect with error
    return Response.redirect(`${APP_URL}/settings/connections?error=true&message=${encodeURIComponent(error.message)}`);
  }
});