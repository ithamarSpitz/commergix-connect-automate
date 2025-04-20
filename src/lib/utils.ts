import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/integrations/supabase/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount);
}

export function formatDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }
): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", options).format(date);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function getInitials(name: string): string {
  if (!name) return "?";
  
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function(...args: Parameters<T>): void {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Uploads a file to Supabase Storage with proper authentication handling
 * and returns the public URL of the uploaded file.
 */
export async function uploadFileToStorage(
  bucket: string, 
  filePath: string, 
  file: File
): Promise<string> {
  try {
    // Upload the file to Supabase storage
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }
    
    // Get the public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
      
    if (!urlData?.publicUrl) {
      throw new Error('Failed to get public URL for uploaded file');
    }
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Storage upload error:', error);
    throw error;
  }
}

/**
 * Ensures an image URL works properly by adding the appropriate tokens for Supabase private storage paths
 */
export function ensureValidImageUrl(url: string): string {
  // If it's already a placeholder or data URL, return as is
  if (url.startsWith('/') || url.startsWith('data:')) {
    return url;
  }
  
  // For Supabase storage URLs
  if (url.includes('supabase.co') && url.includes('/products/')) {
    try {
      // Extract the path from the URL
      // The URL format is like: https://tueobdgcahbccqznnhjc.supabase.co/storage/v1/object/public/products/private/filename.png
      const pathParts = url.split('/products/');
      if (pathParts.length < 2) return url;
      
      // The path should be everything after "products/"
      const path = pathParts[1];
      
      // Get a fresh public URL with the correct tokens
      const { data } = supabase.storage
        .from('products')
        .getPublicUrl(path);
      
      console.log('Original URL:', url);
      console.log('Regenerated URL:', data?.publicUrl);
      
      return data?.publicUrl || url;
    } catch (error) {
      console.error('Error formatting image URL:', error);
      return url;
    }
  }
  
  // Return the original URL if no special handling needed
  return url;
}
