import { supabase, type ImageAttribution, type ImageSizes } from '../supabase/client';
import { VALUE_CATEGORY_QUERIES } from '../constants/category-queries';

// Define the Unsplash API response types
interface UnsplashPhoto {
  id: string;
  width: number;
  height: number;
  description: string | null;
  alt_description: string | null;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  user: {
    name: string;
    username: string;
    links: {
      html: string;
    };
  };
  links: {
    download: string;
    download_location: string;
    html: string;
  };
}

interface UnsplashSearchResponse {
  total: number;
  total_pages: number;
  results: UnsplashPhoto[];
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
 * Check if an Unsplash image already exists in the database by its ID
 * @param unsplashId The Unsplash image ID
 * @returns Boolean indicating if the image exists
 */
async function doesUnsplashImageExist(unsplashId: string): Promise<boolean> {
  // Check if there's an entry in the database with this image ID
  const { data: dbEntries } = await supabase
    .from('value_images')
    .select('id')
    .eq('unsplash_id', unsplashId)
    .limit(1);

  return !!dbEntries && dbEntries.length > 0;
}

/**
 * Fetch images from Unsplash API based on a search query
 * @param query The search query
 * @param perPage Number of images to fetch per page
 * @param page Page number
 * @returns Promise with the search results
 */
export async function searchUnsplashImages(
  query: string,
  perPage: number = 10,
  page: number = 1
): Promise<UnsplashSearchResponse> {
  // Use process.env directly for server components and API routes
  const apiKey = process.env.UNSPLASH_API_KEY;

  if (!apiKey) {
    console.error('UNSPLASH_API_KEY is not set in environment variables');
    throw new Error('UNSPLASH_API_KEY is not set in environment variables');
  }

  const url = new URL('https://api.unsplash.com/search/photos');
  url.searchParams.append('query', query);
  url.searchParams.append('per_page', perPage.toString());
  url.searchParams.append('page', page.toString());

  console.log(`Making Unsplash API request to: ${url.toString()}`); // Debug logging

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Client-ID ${apiKey}`,
      },
    });

    if (!response.ok) {
      console.error(`Unsplash API error: ${response.status} ${response.statusText}`);

      // Log more detailed error info when possible
      if (response.headers.get('content-type')?.includes('application/json')) {
        const errorData = await response.json();
        console.error('Unsplash error details:', errorData);
      }

      throw new Error(`Unsplash API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in searchUnsplashImages:', error);
    throw error;
  }
}

/**
 * Track a download event for an Unsplash photo
 * @param downloadLocation The download location URL for the photo
 */
async function trackUnsplashDownload(downloadLocation: string): Promise<void> {
  const apiKey = process.env.UNSPLASH_API_KEY;

  if (!apiKey) {
    console.error('UNSPLASH_API_KEY is not set in environment variables');
    throw new Error('UNSPLASH_API_KEY is not set in environment variables');
  }

  try {
    const response = await fetch(downloadLocation, {
      headers: {
        Authorization: `Client-ID ${apiKey}`,
      },
    });

    if (!response.ok) {
      console.error(`Failed to track Unsplash download: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error tracking Unsplash download:', error);
  }
}

/**
 * Fetch and save images for a specific value category from Unsplash
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
    failed: 0,
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
      const searchResults = await searchUnsplashImages(query, fetchCount);

      // Process each photo
      for (const photo of searchResults.results) {
        // Stop if we've reached the target count
        if (savedCount >= count) break;

        // Check if this image already exists
        const imageExists = await doesUnsplashImageExist(photo.id);

        if (imageExists) {
          result.skipped++;
          continue;
        }

        // Track download for Unsplash attribution requirements
        await trackUnsplashDownload(photo.links.download_location);

        // Create value name from query
        const valueName = query.charAt(0).toUpperCase() + query.slice(1);

        // Create the attribution text and links
        const photographerName = photo.user.name;
        const photographerUrl = photo.user.links.html;
        const unsplashPhotoUrl = photo.links.html;

        // Create attribution object
        const attribution: ImageAttribution = {
          photographer_name: photographerName,
          photographer_url: photographerUrl,
          photo_url: unsplashPhotoUrl,
        };

        // Create image sizes object
        const imageSizes: ImageSizes = {
          thumb: photo.urls.thumb,
          small: photo.urls.small,
          regular: photo.urls.regular,
          full: photo.urls.full,
          raw: photo.urls.raw,
        };

        const { error } = await supabase.from('value_images').insert({
          category,
          value_name: valueName,
          image_url: photo.urls.regular,
          description:
            photo.alt_description || photo.description || `${valueName} image from Unsplash`,
          tags: [query, category, `by ${photo.user.name}`, `unsplash_${photo.user.username}`],
          unsplash_id: photo.id,
          attribution,
          image_sizes: imageSizes,
        });

        if (error) {
          console.error('Error inserting image data:', error);
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
 * Fetch and save images for all value categories from Unsplash
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
