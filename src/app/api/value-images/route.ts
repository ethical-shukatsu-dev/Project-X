import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { supabaseAdmin } from '@/lib/supabase/admin-client';
import { fetchAndSaveImagesForCategory, fetchAndSaveImagesForAllCategories } from '@/lib/pexels/client';

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
      const { data, error } = await supabaseAdmin
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
    // Handle JSON requests for Pexels API
    else if (contentType.includes('application/json')) {
      const body = await request.json();
      const { action, category, count } = body;
      
      if (action !== 'fetch_pexels') {
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
      }
      
      try {
        let result;
        
        // Fetch images for a specific category or all categories
        if (category) {
          result = await fetchAndSaveImagesForCategory(category, count || 10);
          return NextResponse.json({
            success: true,
            message: `Successfully fetched ${result.length} images for category: ${category}`,
            images: result
          });
        } else {
          result = await fetchAndSaveImagesForAllCategories(count || 20);
          
          // Calculate total images fetched
          const totalImages = Object.values(result).reduce(
            (sum, images) => sum + images.length, 
            0
          );
          
          return NextResponse.json({
            success: true,
            message: `Successfully fetched ${totalImages} images for all categories`,
            images: result
          });
        }
      } catch (error) {
        console.error('Error fetching images from Pexels:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
          { error: 'Failed to fetch images: ' + errorMessage },
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