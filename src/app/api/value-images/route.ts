import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { fetchAndSaveImagesForCategory as fetchAndSavePexelsImagesForCategory, fetchAndSaveImagesForAllCategories as fetchAndSavePexelsImagesForAllCategories } from '@/lib/pexels/client';
import { fetchAndSaveImagesForCategory as fetchAndSaveUnsplashImagesForCategory, fetchAndSaveImagesForAllCategories as fetchAndSaveUnsplashImagesForAllCategories } from '@/lib/unsplash/client';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    // Handle form data uploads (existing functionality)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const imageFile = formData.get('image') as File;
      const category = formData.get('category') as string;
      const valueName = formData.get('value_name') as string;
      const description = formData.get('description') as string;
      const tags = formData.get('tags') as string;
      
      // Validate required fields
      if (!imageFile || !category || !valueName) {
        return NextResponse.json(
          { error: 'Image, category, and value_name are required' },
          { status: 400 }
        );
      }

      // Parse tags if provided
      let parsedTags: string[] = [];
      try {
        parsedTags = tags ? JSON.parse(tags) : [];
      } catch (error) {
        console.error('Error parsing tags:', error);
        return NextResponse.json(
          { error: 'Invalid tags format' },
          { status: 400 }
        );
      }
      
      // Generate a unique file name
      const fileName = `${Date.now()}_${imageFile.name.replace(/\s+/g, '_')}`;
      const filePath = `value_images/${fileName}`;
      
      // Check if the storage bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage
        .listBuckets();
        
      if (bucketsError) {
        console.error('Error listing buckets:', bucketsError);
        return NextResponse.json(
          { error: 'Failed to access storage' },
          { status: 500 }
        );
      }
      
      const imagesBucket = buckets?.find(bucket => bucket.name === 'images');
      
      if (!imagesBucket) {
        console.error('Images bucket not found');
        return NextResponse.json(
          { error: 'Storage bucket not found' },
          { status: 500 }
        );
      }
      
      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, imageFile);
        
      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return NextResponse.json(
          { error: 'Failed to upload image: ' + uploadError.message },
          { status: 500 }
        );
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
          tags: parsedTags
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error inserting image data:', error);
        return NextResponse.json(
          { error: 'Failed to save image data: ' + error.message },
          { status: 500 }
        );
      }
      
      return NextResponse.json(data);
    } 
    // Handle JSON requests for API fetching
    else if (contentType.includes('application/json')) {
      const body = await request.json();
      const { action, category, count } = body;
      
      if (!['fetch_pexels', 'fetch_unsplash'].includes(action)) {
        return NextResponse.json(
          { error: 'Invalid action. Use fetch_pexels or fetch_unsplash' },
          { status: 400 }
        );
      }
      
      try {
        let result;
        
        // Fetch images from the specified source
        if (action === 'fetch_pexels') {
          // Fetch images for a specific category or all categories from Pexels
          if (category) {
            result = await fetchAndSavePexelsImagesForCategory(category, count || 10);
            return NextResponse.json({
              success: true,
              message: `Successfully fetched ${result.added} images from Pexels for category: ${category} (${result.skipped} duplicates skipped, ${result.failed} failed)`,
              added: result.added,
              skipped: result.skipped,
              failed: result.failed
            });
          } else {
            result = await fetchAndSavePexelsImagesForAllCategories(count || 20);
            
            // Calculate total images fetched, skipped, and failed
            const totalAdded = Object.values(result).reduce(
              (sum, categoryResult) => sum + categoryResult.added, 
              0
            );
            
            const totalSkipped = Object.values(result).reduce(
              (sum, categoryResult) => sum + categoryResult.skipped, 
              0
            );

            const totalFailed = Object.values(result).reduce(
              (sum, categoryResult) => sum + categoryResult.failed, 
              0
            );
            
            // Format the response with added, skipped, and failed counts per category
            const formattedResult: Record<string, { added: number, skipped: number, failed: number }> = {};
            for (const [category, categoryResult] of Object.entries(result)) {
              formattedResult[category] = {
                added: categoryResult.added,
                skipped: categoryResult.skipped,
                failed: categoryResult.failed
              };
            }
            
            return NextResponse.json({
              success: true,
              message: `Successfully fetched ${totalAdded} images from Pexels for all categories (${totalSkipped} duplicates skipped, ${totalFailed} failed)`,
              result: formattedResult,
              totalAdded,
              totalSkipped,
              totalFailed
            });
          }
        } else if (action === 'fetch_unsplash') {
          // Fetch images for a specific category or all categories from Unsplash
          if (category) {
            result = await fetchAndSaveUnsplashImagesForCategory(category, count || 10);
            return NextResponse.json({
              success: true,
              message: `Successfully fetched ${result.added} images from Unsplash for category: ${category} (${result.skipped} duplicates skipped, ${result.failed} failed)`,
              added: result.added,
              skipped: result.skipped,
              failed: result.failed
            });
          } else {
            result = await fetchAndSaveUnsplashImagesForAllCategories(count || 20);
            
            // Calculate total images fetched, skipped, and failed
            const totalAdded = Object.values(result).reduce(
              (sum, categoryResult) => sum + categoryResult.added, 
              0
            );
            
            const totalSkipped = Object.values(result).reduce(
              (sum, categoryResult) => sum + categoryResult.skipped, 
              0
            );

            const totalFailed = Object.values(result).reduce(
              (sum, categoryResult) => sum + categoryResult.failed, 
              0
            );
            
            // Format the response with added, skipped, and failed counts per category
            const formattedResult: Record<string, { added: number, skipped: number, failed: number }> = {};
            for (const [category, categoryResult] of Object.entries(result)) {
              formattedResult[category] = {
                added: categoryResult.added,
                skipped: categoryResult.skipped,
                failed: categoryResult.failed
              };
            }
            
            return NextResponse.json({
              success: true,
              message: `Successfully fetched ${totalAdded} images from Unsplash for all categories (${totalSkipped} duplicates skipped, ${totalFailed} failed)`,
              result: formattedResult,
              totalAdded,
              totalSkipped,
              totalFailed
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching images from ${action === 'fetch_pexels' ? 'Pexels' : 'Unsplash'}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
          { error: `Failed to fetch images: ${errorMessage}` },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Unsupported content type' },
        { status: 415 }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error: ' + errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    
    let query = supabase.from('value_images').select('*');
    
    // Filter by category if provided
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching value images:', error);
      return NextResponse.json(
        { error: 'Failed to fetch value images: ' + error.message },
        { status: 500 }
      );
    }
    
    // Return an empty array if no data
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error processing request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error: ' + errorMessage },
      { status: 500 }
    );
  }
} 