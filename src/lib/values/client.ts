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
  const allImages = await getAllValueImages();
  
  // Group images by category
  const imagesByCategory: Record<string, ValueImage[]> = {};
  
  allImages.forEach(image => {
    if (!imagesByCategory[image.category]) {
      imagesByCategory[image.category] = [];
    }
    imagesByCategory[image.category].push(image);
  });
  
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