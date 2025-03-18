import { supabase } from '../supabase/client';
import type { ImageAttribution, ImageSizes } from '../supabase/client';
import { VALUE_CATEGORY_QUERIES } from '../constants/category-queries';

// Define the Pexels API response types
interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  liked: boolean;
  alt: string;
}

interface PexelsSearchResponse {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  next_page: string;
}

/**
 * Result object for image fetching operations
 */
interface ImageFetchResult {
  added: number;
  skipped: number;
  failed: number;
}

/**
 * Check if a Pexels image already exists in the database by its ID
 * @param pexelsId The Pexels image ID
 * @returns Boolean indicating if the image exists
 */
async function doesPexelsImageExist(pexelsId: number): Promise<boolean> {
  // Check if there's an entry in the database with this image ID
  const { data: dbEntries } = await supabase
    .from('value_images')
    .select('id')
    .eq('pexels_id', pexelsId)
    .limit(1);
    
  if (dbEntries && dbEntries.length > 0) {
    return true;
  }
  
  // For backward compatibility, also check for images stored with the old method
  const fileName = `pexels_${pexelsId}.jpg`;
  const { data: fileExists } = await supabase.storage
    .from('images')
    .list('value_images', {
      search: fileName
    });
    
  if (fileExists && fileExists.length > 0) {
    return true;
  }
  
  return false;
}

/**
 * Fetch images from Pexels API based on a search query
 * @param query The search query
 * @param perPage Number of images to fetch per page
 * @param page Page number
 * @returns Promise with the search results
 */
export async function searchPexelsImages(
  query: string,
  perPage: number = 10,
  page: number = 1
): Promise<PexelsSearchResponse> {
  const apiKey = process.env.PEXELS_API_KEY;
  
  if (!apiKey) {
    throw new Error('PEXELS_API_KEY is not set in environment variables');
  }
  
  const url = new URL('https://api.pexels.com/v1/search');
  url.searchParams.append('query', query);
  url.searchParams.append('per_page', perPage.toString());
  url.searchParams.append('page', page.toString());
  
  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': apiKey
    }
  });
  
  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

/**
 * Fetch and save images for a specific value category
 * @param category The value category
 * @param count Number of images to fetch
 * @returns Promise with the saved images and skipped count
 */
export async function fetchAndSaveImagesForCategory(
  category: string,
  count: number = 10
): Promise<ImageFetchResult> {
  // Get search queries for the category
  const queries = VALUE_CATEGORY_QUERIES[category];
  
  if (!queries || queries.length === 0) {
    throw new Error(`No search queries defined for category: ${category}`);
  }
  
  // Calculate how many images to fetch per query
  const imagesPerQuery = Math.ceil(count / queries.length);
  
  // Fetch and save images for each query
  const result: ImageFetchResult = {
    added: 0,
    skipped: 0,
    failed: 0
  };
  
  // Keep track of how many images we've successfully saved
  let savedCount = 0;
  let queryIndex = 0;
  
  // Continue fetching until we reach the desired count or run out of queries
  while (savedCount < count && queryIndex < queries.length) {
    const query = queries[queryIndex];
    try {
      // Determine page size based on remaining images needed
      const remainingNeeded = count - savedCount;
      const fetchCount = Math.min(remainingNeeded + 5, imagesPerQuery);
      
      // Search for images, requesting a few extra to account for potential duplicates
      const searchResults = await searchPexelsImages(query, fetchCount);
      
      // Process each photo
      for (const photo of searchResults.photos) {
        // Stop if we've reached the target count
        if (savedCount >= count) break;
        
        // Check if this image already exists
        const imageExists = await doesPexelsImageExist(photo.id);
        
        if (imageExists) {
          result.skipped++;
          continue;
        }
        
        // Create value name from query
        const valueName = query.charAt(0).toUpperCase() + query.slice(1);
        
        // Create the attribution text and links
        const photographerName = photo.photographer;
        const photographerUrl = photo.photographer_url;
        const pexelsPhotoUrl = photo.url;
        
        // Create attribution object
        const attribution: ImageAttribution = {
          photographer_name: photographerName,
          photographer_url: photographerUrl,
          photo_url: pexelsPhotoUrl
        };

        // Create image sizes object
        const imageSizes: ImageSizes = {
          thumb: photo.src.tiny,
          small: photo.src.small,
          regular: photo.src.medium,
          full: photo.src.large,
          raw: photo.src.original
        };

        // Insert the image into the database
        const { error } = await supabase.from('value_images').insert({
          category,
          value_name: valueName,
          image_url: photo.src.medium,
          description: photo.alt || `${valueName} image from Pexels`,
          tags: [query, category, `by ${photo.photographer}`, `pexels_${photo.id}`],
          pexels_id: photo.id.toString(),
          attribution,
          image_sizes: imageSizes
        });

        if (error) {
          console.error('Error saving Pexels image:', error);
          result.failed++;
          continue;
        }
        
        result.added++;
        savedCount++;
      }
    } catch (error) {
      console.error(`Error fetching images for query "${query}":`, error);
      result.failed++;
    }
    
    // Move to the next query
    queryIndex++;
  }
  
  return result;
}

/**
 * Fetch and save images for all value categories
 * @param imagesPerCategory Number of images to fetch per category
 * @returns Promise with the saved images and skipped counts
 */
export async function fetchAndSaveImagesForAllCategories(
  imagesPerCategory: number = 20
): Promise<Record<string, ImageFetchResult>> {
  const result: Record<string, ImageFetchResult> = {};
  
  for (const category of Object.keys(VALUE_CATEGORY_QUERIES)) {
    try {
      const categoryResult = await fetchAndSaveImagesForCategory(category, imagesPerCategory);
      result[category] = categoryResult;
    } catch (error) {
      console.error(`Error fetching images for category "${category}":`, error);
      result[category] = { added: 0, skipped: 0, failed: 0 };
    }
  }
  
  return result;
} 