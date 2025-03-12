import { supabase } from '../supabase/client';
import type { ValueImage } from '../supabase/client';

/**
 * Fetch value images by category
 * @param category The category of images to fetch
 * @returns An array of value images
 */
export async function getValueImagesByCategory(category: string): Promise<ValueImage[]> {
  const { data, error } = await supabase
    .from('value_images')
    .select('*')
    .eq('category', category);

  if (error) {
    console.error('Error fetching value images:', error);
    throw new Error('Failed to fetch value images');
  }

  return data || [];
}

/**
 * Fetch all value images
 * @returns An array of all value images
 */
export async function getAllValueImages(): Promise<ValueImage[]> {
  const { data, error } = await supabase
    .from('value_images')
    .select('*');

  if (error) {
    console.error('Error fetching value images:', error);
    throw new Error('Failed to fetch value images');
  }

  return data || [];
}

/**
 * Fetch value images for image-based questions
 * @returns An object with image questions by category
 */
export async function getImageQuestions(): Promise<Record<string, ValueImage[]>> {
  // First, get all categories by selecting distinct categories
  const { data: categoriesData, error: categoriesError } = await supabase
    .from('value_images')
    .select('category');

  if (categoriesError) {
    console.error('Error fetching image categories:', categoriesError);
    throw new Error('Failed to fetch image categories');
  }

  // Extract unique categories
  const categories = [...new Set(categoriesData.map(item => item.category))];

  // Initialize the result object
  const imagesByCategory: Record<string, ValueImage[]> = {};

  // For each category, fetch all images and then randomly select 4
  await Promise.all(
    categories.map(async (category: string) => {
      // Fetch all images for this category
      const { data: allImages, error: imagesError } = await supabase
        .from('value_images')
        .select('*')
        .eq('category', category)
        .limit(20);

      if (imagesError) {
        console.error(`Error fetching images for category ${category}:`, imagesError);
        return;
      }

      if (!allImages || allImages.length === 0) {
        imagesByCategory[category] = [];
        return;
      }

      // Randomly select 4 images (or fewer if there aren't enough)
      const randomImages = shuffleArray(allImages).slice(0, 4);
      
      // Add the images to the result object
      imagesByCategory[category] = randomImages;
    })
  );

  return imagesByCategory;
}

/**
 * Shuffle an array using the Fisher-Yates algorithm
 * @param array The array to shuffle
 * @returns A new shuffled array
 */
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * Upload a value image to Supabase Storage
 * @param file The image file to upload
 * @param category The category of the image
 * @param valueName The value name associated with the image
 * @param description Optional description of the image
 * @param tags Optional tags for the image
 * @returns The uploaded image data
 */
export async function uploadValueImage(
  file: File,
  category: string,
  valueName: string,
  description?: string,
  tags?: string[]
): Promise<ValueImage> {
  // Generate a unique file name
  const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
  const filePath = `value_images/${fileName}`;
  
  // Upload the file to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('images')
    .upload(filePath, file);
    
  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    throw new Error('Failed to upload image');
  }
  
  // Get the public URL for the uploaded file
  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(filePath);
    
  // Insert the image data into the value_images table using the admin client
  // This bypasses RLS policies
  const { data, error } = await supabase
    .from('value_images')
    .insert({
      category,
      value_name: valueName,
      image_url: publicUrl,
      description,
      tags
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error inserting image data:', error);
    throw new Error('Failed to save image data');
  }
  
  return data;
} 