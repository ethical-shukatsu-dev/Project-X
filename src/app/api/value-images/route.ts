import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: Request) {
  try {
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
      
    // Insert the image data into the value_images table
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