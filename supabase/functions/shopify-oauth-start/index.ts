import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const SHOPIFY_API_KEY = Deno.env.get('SHOPIFY_API_KEY') || '';
const SHOPIFY_API_SECRET = Deno.env.get('SHOPIFY_API_SECRET') || '';
const REDIRECT_URI = Deno.env.get('SHOPIFY_REDIRECT_URI') || 'https://your-app-url.com/api/auth/callback/shopify';
const SCOPES = 'read_products,write_products,read_orders,write_orders,read_inventory,write_inventory';

// This edge function generates the Shopify OAuth authorization URL
serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Get the request body
    const { shop, nonce } = await req.json();
    
    if (!shop) {
      return new Response(
        JSON.stringify({ error: 'Shop domain is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize shop domain if needed
    let normalizedShop = shop.trim().toLowerCase();
    if (!normalizedShop.includes('.')) {
      normalizedShop = `${normalizedShop}.myshopify.com`;
    }
    if (normalizedShop.startsWith('http')) {
      // Extract the hostname
      try {
        const url = new URL(normalizedShop);
        normalizedShop = url.hostname;
      } catch (e) {
        return new Response(
          JSON.stringify({ error: 'Invalid shop domain format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Generate the authorization URL
    const state = nonce || Math.random().toString(36).substring(2, 15);
    const authUrl = `https://${normalizedShop}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}&scope=${SCOPES}&redirect_uri=${REDIRECT_URI}&state=${state}`;

    return new Response(
      JSON.stringify({ authUrl, state }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});