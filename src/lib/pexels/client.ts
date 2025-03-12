import { supabase } from '../supabase/client';
import type { ValueImage } from '../supabase/client';

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

// Map value categories to search queries
const VALUE_CATEGORY_QUERIES: Record<string, string[]> = {
  'hobbies': [
    // Outdoor & Adventure
    'hiking adventure', 'mountain climbing', 'camping outdoors', 'fishing nature', 
    'kayaking', 'surfing ocean', 'skiing snow', 'backpacking travel',
    // Creative & Artistic
    'painting art', 'drawing sketch', 'photography creative', 'writing poetry', 
    'playing music', 'singing performance', 'dancing expression', 'crafting handmade',
    // Intellectual & Learning
    'reading books', 'learning languages', 'chess strategy', 'puzzles problem-solving', 
    'history exploration', 'science experiments', 'philosophy thinking', 'documentary watching',
    // Social & Community
    'volunteering community', 'team sports', 'board games friends', 'cooking together', 
    'book club discussion', 'community gardening', 'group travel', 'cultural events',
    // Wellness & Mindfulness
    'yoga practice', 'meditation mindfulness', 'fitness training', 'cycling outdoors', 
    'running marathon', 'swimming exercise', 'healthy cooking', 'nature walks',
    // Technology & Digital
    'video gaming', 'programming coding', 'digital art', 'drone flying', 
    'virtual reality', 'tech gadgets', 'robotics building', 'streaming content'
  ],
  'work_values': [
    'teamwork', 'collaboration', 'productivity', 'achievement', 
    'dedication', 'excellence', 'professionalism', 'growth'
  ],
  'leadership_values': [
    'leadership', 'vision', 'inspiration', 'mentorship', 
    'guidance', 'direction', 'empowerment', 'strategy'
  ],
  'company_culture': [
    'culture', 'diversity', 'inclusion', 'community', 
    'celebration', 'team spirit', 'office culture', 'workplace happiness'
  ],
  'work_environment': [
    'modern office', 'workspace', 'ergonomic', 'collaborative space', 
    'remote work', 'office design', 'productive environment', 'creative space'
  ],
  'innovation': [
    'innovation', 'technology', 'creativity', 'brainstorming', 
    'ideas', 'future', 'digital transformation', 'breakthrough'
  ],
  'personal_professional_growth': [
    'learning', 'development', 'career growth', 'adaptability', 
    'change', 'education', 'skill development', 'personal growth'
  ],
  'work_life_balance': [
    'work-life balance', 'remote work', 'hybrid work', 'mental health', 
    'wellness', 'relaxation', 'flexible work', 'healthy lifestyle'
  ],
  'financial_job_security': [
    'compensation', 'benefits', 'job stability', 'ownership', 
    'equity', 'financial security', 'career stability', 'retirement'
  ],
  'impact_purpose': [
    'social impact', 'sustainability', 'ethical standards', 'mission', 
    'purpose', 'meaningful work', 'environmental responsibility', 'community impact'
  ],
  'communication_transparency': [
    'open communication', 'feedback', 'trust', 'autonomy', 
    'transparency', 'honest conversation', 'information sharing', 'clear communication'
  ],
  'recognition_appreciation': [
    'employee recognition', 'supportive management', 'peer recognition', 'appreciation', 
    'awards', 'acknowledgment', 'gratitude', 'team celebration'
  ]
};

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
 * @returns Promise with the saved images
 */
export async function fetchAndSaveImagesForCategory(
  category: string,
  count: number = 10
): Promise<ValueImage[]> {
  // Get search queries for the category
  const queries = VALUE_CATEGORY_QUERIES[category];
  
  if (!queries || queries.length === 0) {
    throw new Error(`No search queries defined for category: ${category}`);
  }
  
  // Calculate how many images to fetch per query
  const imagesPerQuery = Math.ceil(count / queries.length);
  
  // Fetch and save images for each query
  const savedImages: ValueImage[] = [];
  
  for (const query of queries) {
    try {
      // Search for images
      const searchResults = await searchPexelsImages(query, imagesPerQuery);
      
      // Process each photo
      for (const photo of searchResults.photos) {
        // Generate a unique file name
        const fileName = `pexels_${photo.id}.jpg`;
        const filePath = `value_images/${fileName}`;
        
        // Download the image
        const imageResponse = await fetch(photo.src.medium);
        const imageBlob = await imageResponse.blob();
        
        // Upload the image to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, imageBlob, {
            contentType: 'image/jpeg',
            upsert: true
          });
          
        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          continue;
        }
        
        // Get the public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);
          
        // Create value name from query
        const valueName = query.charAt(0).toUpperCase() + query.slice(1);
        
        // Insert the image data into the value_images table using the admin client
        // This bypasses RLS policies
        const { data, error } = await supabase
          .from('value_images')
          .insert({
            category,
            value_name: valueName,
            image_url: publicUrl,
            description: photo.alt || `${valueName} image from Pexels`,
            tags: [query, category, 'pexels', photo.photographer]
          })
          .select()
          .single();
          
        if (error) {
          console.error('Error inserting image data:', error);
          continue;
        }
        
        if (data) {
          savedImages.push(data);
        }
      }
    } catch (error) {
      console.error(`Error fetching images for query "${query}":`, error);
    }
  }
  
  return savedImages;
}

/**
 * Fetch and save images for all value categories
 * @param imagesPerCategory Number of images to fetch per category
 * @returns Promise with the saved images
 */
export async function fetchAndSaveImagesForAllCategories(
  imagesPerCategory: number = 20
): Promise<Record<string, ValueImage[]>> {
  const result: Record<string, ValueImage[]> = {};
  
  for (const category of Object.keys(VALUE_CATEGORY_QUERIES)) {
    try {
      const images = await fetchAndSaveImagesForCategory(category, imagesPerCategory);
      result[category] = images;
    } catch (error) {
      console.error(`Error fetching images for category "${category}":`, error);
      result[category] = [];
    }
  }
  
  return result;
} 