// Mirakl API utility functions for async export flow (OF52 → OF53 → OF54)

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Gets Mirakl offer data via direct CSV download (specific to this Mirakl instance)
 * @param domain Mirakl domain URL
 * @param apiKey Mirakl API key
 * @returns Promise with the response stream
 */
export async function launchExport(domain: string, apiKey: string): Promise<ReadableStream<Uint8Array>> {
  console.log('Getting Mirakl offer data via direct CSV download (modified for superpharm-prod)');

  const url = `${domain}/api/offers/export`;
  const method = 'GET'; // Use GET to get direct CSV data
  console.log(`Attempting to ${method} to ${url}`);

  const response = await fetch(url, {
    method: method,
    headers: {
      'Authorization': apiKey,
      'Accept': '*/*' // Accept any content type
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Mirakl data fetch failed: ${response.status} ${response.statusText} from ${method} ${url}`, errorText);
    throw new Error(`Failed to fetch export data: ${response.status} ${response.statusText}`);
  }

  // Check the actual content type returned by the server
  const contentType = response.headers.get('content-type');
  console.log(`Received response with Content-Type: ${contentType}`);

  // For this specific Mirakl instance, we're expecting CSV
  if (contentType && contentType.includes('text/csv')) {
    if (!response.body) {
      throw new Error('Response body stream is null');
    }
    
    console.log('Successfully received CSV data stream');
    return response.body;
  } else {
    // If it's not CSV, read as text and throw an error
    const responseText = await response.text();
    console.error(`Unexpected Content-Type from Mirakl: ${contentType}. Response: ${responseText.substring(0, 200)}...`);
    throw new Error(`Expected text/csv from Mirakl but received ${contentType}`);
  }
}

/**
 * Polls a Mirakl export job status until completion via OF53 API
 * @param domain Mirakl domain URL
 * @param apiKey Mirakl API key
 * @param taskId Task ID from the launch export call
 * @returns Promise with array of file URLs to download when complete
 */
export async function pollExport(
  domain: string, 
  apiKey: string, 
  taskId: string
): Promise<string[]> {
  console.log(`Polling export status for task ${taskId}`);
  
  const url = `${domain}/api/offers/export/${taskId}`;
  const maxAttempts = 30;
  const pollingInterval = 5000; // 5 seconds
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`Checking export status (attempt ${attempt}/${maxAttempts})`);
    
    const response = await fetch(url, {
      headers: { 
        'Authorization': apiKey,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Mirakl export status check failed: ${response.status}`, errorText);
      throw new Error(`Export status check failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Export status: ${data.status}, progress: ${data.status_details?.progress || 'N/A'}%`);
    
    if (data.status === 'COMPLETE') {
      if (data.files && data.files.length > 0) {
        console.log(`Export complete with ${data.files.length} file(s)`);
        return data.files;
      } else {
        throw new Error('Export completed but no files were generated');
      }
    } else if (data.status === 'ERROR' || data.status === 'FAILED') {
      throw new Error(`Export failed with status: ${data.status}, reason: ${data.status_details?.error || 'Unknown error'}`);
    }
    
    // Status is still pending, wait and retry
    await sleep(pollingInterval);
  }
  
  throw new Error(`Export did not complete after ${maxAttempts} attempts`);
}

/**
 * Downloads and processes Mirakl export files via OF54 API
 * @param domain Mirakl domain URL
 * @param apiKey Mirakl API key
 * @param urls Array of file URLs from the poll export call
 * @returns Promise with combined data from all files
 */
export async function downloadExportFiles(
  domain: string, 
  apiKey: string, 
  urls: string[]
): Promise<ReadableStream<Uint8Array>[]> {
  console.log(`Downloading ${urls.length} export file(s)`);
  
  // For each URL, fetch the file and return the streams
  const streams: ReadableStream<Uint8Array>[] = [];
  
  for (const url of urls) {
    const fullUrl = url.startsWith('http') ? url : `${domain}${url}`;
    console.log(`Fetching export file: ${fullUrl}`);
    
    const response = await fetch(fullUrl, {
      headers: { 
        'Authorization': apiKey,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to download export file: ${response.status}`, errorText);
      throw new Error(`File download failed: ${response.status} ${response.statusText}`);
    }
    
    if (!response.body) {
      throw new Error('Response body stream is null');
    }
    
    streams.push(response.body);
    console.log(`Successfully got stream for file: ${url}`);
  }
  
  return streams;
}

/**
 * Process a JSON stream line by line
 * @param text Accumulated text buffer
 * @param processChunk Function to process batches of JSON objects
 * @returns Remaining unprocessed buffer content
 */
export function flushJSONLines(text: string, processChunk: (items: any[]) => Promise<void>): string {
  // Split by newlines and keep track of processed lines
  const lines = text.split('\n');
  const lastLine = lines.length - 1;
  
  // If we have at least one complete line (ending in newline)
  if (lines.length > 1) {
    // Process all complete lines except the last potentially incomplete one
    const itemsToProcess: any[] = []; // Explicitly type as any[]

    for (let i = 0; i < lastLine; i++) {
      const line = lines[i].trim();
      if (line) {
        try {
          const item = JSON.parse(line);
          itemsToProcess.push(item);
        } catch (e) {
          console.warn(`Skipping invalid JSON line: ${line.substring(0, 50)}...`);
        }
      }
    }
    
    if (itemsToProcess.length > 0) {
      // Process the batch of items
      processChunk(itemsToProcess);
    }
    
    // Return the last potentially incomplete line
    return lines[lastLine];
  }
  
  // If no newlines yet, just return the original text
  return text;
}

/**
 * Stream and process a JSON lines file
 * @param stream Readable stream of JSON lines data
 * @param processBatch Function to process batches of parsed JSON objects
 * @returns Promise that resolves when processing is complete
 */
export async function streamJSONLines(
  stream: ReadableStream<Uint8Array>, 
  processBatch: (items: any[]) => Promise<void>
): Promise<number> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let totalProcessed = 0;
  
  try {
    // Process the stream chunks
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        // Handle any remaining data in buffer
        if (buffer.trim()) {
          try {
            const item = JSON.parse(buffer.trim());
            await processBatch([item]);
            totalProcessed += 1;
          } catch (e) {
            console.warn('Error parsing last chunk:', e);
          }
        }
        break;
      }
      
      // Add new chunk to buffer and process complete lines
      buffer += decoder.decode(value, { stream: true });
      
      // Extract complete JSON objects from buffer
      const batch: any[] = []; // Explicitly type as any[]
      const lines = buffer.split('\n');
      const lastIndex = lines.length - 1;
      
      // Process all complete lines
      for (let i = 0; i < lastIndex; i++) {
        const line = lines[i].trim();
        if (line) {
          try {
            const item = JSON.parse(line);
            batch.push(item);
          } catch (e) {
            console.warn(`Invalid JSON line: ${line.substring(0, 50)}...`);
          }
        }
      }
      
      // Keep the last potentially incomplete line in buffer
      buffer = lines[lastIndex];
      
      // Process batch if we have items
      if (batch.length > 0) {
        await processBatch(batch);
        totalProcessed += batch.length;
      }
    }
    
    return totalProcessed;
  } finally {
    reader.releaseLock();
  }
}

/**
 * Fetches product details from Mirakl API using the offers endpoint
 * @param domain Mirakl domain URL
 * @param apiKey Mirakl API key
 * @param productSku The product SKU to fetch details for
 * @returns Promise with the product details
 */
export async function fetchProductDetails(domain: string, apiKey: string, productSku: string): Promise<any> {
  console.log(`Fetching detailed info for product: ${productSku}`);
  
  // Use the offers endpoint that was successful
  const url = `${domain}/api/offers?product_sku=${encodeURIComponent(productSku)}`;
  console.log(`Querying Mirakl API: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': apiKey,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      const statusText = response.statusText;
      console.error(`API error: ${response.status} ${statusText}`);
      const errorText = await response.text();
      console.error(`Response body: ${errorText.substring(0, 200)}`);
      throw new Error(`API error: ${response.status} ${statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (err) {
    console.error(`Error fetching product details:`, err);
    throw err;
  }
}