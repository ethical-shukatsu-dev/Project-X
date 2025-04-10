import { supabase, type ValueImage } from '../supabase/client';

/**
 * Fetch random value images by category using a database function
 * @param category The category of images to fetch
 * @param limit The number of random images to fetch (default: 4)
 * @returns An array of random value images for the specified category
 */
export async function getRandomValueImagesByCategory(
  category: string,
  limit: number = 4
): Promise<ValueImage[]> {
  const { data, error } = await supabase.rpc('get_random_value_images_by_category', {
    category_param: category,
    limit_param: limit,
  });

  if (error) {
    console.error('Error fetching random value images:', error);
    throw new Error('Failed to fetch random value images');
  }

  return data || [];
}

/**
 * Fetch random value images using a database function
 * @param limit The number of random images to fetch (default: 4)
 * @returns An array of random value images
 */
export async function getRandomValueImages(limit: number = 4): Promise<ValueImage[]> {
  const { data, error } = await supabase.rpc('get_random_value_images', {
    limit_param: limit,
  });

  if (error) {
    console.error('Error fetching random value images:', error);
    throw new Error('Failed to fetch random value images');
  }

  return data || [];
}

/**
 * Fetch value images for image-based questions using database functions
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
  const categories = [...new Set(categoriesData.map((item) => item.category))];

  // Initialize the result object
  const imagesByCategory: Record<string, ValueImage[]> = {};

  // For each category, fetch random images directly using the database function
  await Promise.all(
    categories.map(async (category: string) => {
      // Use the RPC function to get random images for this category
      const { data: randomImages, error: imagesError } = await supabase.rpc(
        'get_random_value_images_by_category',
        {
          category_param: category,
          limit_param: 4,
        }
      );

      if (imagesError) {
        console.error(`Error fetching random images for category ${category}:`, imagesError);
        return;
      }

      // Add the images to the result object
      imagesByCategory[category] = randomImages || [];
    })
  );

  return imagesByCategory;
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
  const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    throw new Error('Failed to upload image');
  }

  // Get the public URL for the uploaded file
  const {
    data: { publicUrl },
  } = supabase.storage.from('images').getPublicUrl(filePath);

  // Insert the image data into the value_images table using the admin client
  // This bypasses RLS policies
  const { data, error } = await supabase
    .from('value_images')
    .insert({
      category,
      value_name: valueName,
      image_url: publicUrl,
      description,
      tags,
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting image data:', error);
    throw new Error('Failed to save image data');
  }

  return data;
}
