"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ValueImage } from '@/lib/supabase/client';
import Image from 'next/image';

// Define the categories for value images
const VALUE_CATEGORIES = [
  { value: 'work_values', label: 'Work Values' },
  { value: 'leadership_values', label: 'Leadership Values' },
  { value: 'company_culture', label: 'Company Culture' },
  { value: 'work_environment', label: 'Work Environment' },
  { value: 'innovation', label: 'Innovation' },
];

export default function AdminValueImagesPage() {
  const [images, setImages] = useState<ValueImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('');
  const [valueName, setValueName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [tags, setTags] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch existing images on component mount
  useEffect(() => {
    fetchImages();
  }, []);

  // Fetch images from the API
  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/value-images');
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error('Error fetching images:', error);
      setError('Failed to fetch images');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate form
    if (!selectedFile || !category || !valueName) {
      setError('Please fill in all required fields');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('category', category);
      formData.append('value_name', valueName);
      
      if (description) {
        formData.append('description', description);
      }
      
      if (tags) {
        // Parse tags as a comma-separated list
        const tagArray = tags.split(',').map(tag => tag.trim());
        formData.append('tags', JSON.stringify(tagArray));
      }
      
      const response = await fetch('/api/value-images', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }
      
      // Reset form
      setSelectedFile(null);
      setPreviewUrl(null);
      setCategory('');
      setValueName('');
      setDescription('');
      setTags('');
      
      // Show success message
      setSuccess('Image uploaded successfully');
      
      // Refresh images
      fetchImages();
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Value Images Admin</h1>
      
      {/* Upload Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Upload New Value Image</CardTitle>
          <CardDescription>
            Upload images that represent different values for the questionnaire.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                {success}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="image">Image *</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
                
                {previewUrl && (
                  <div className="mt-2 relative aspect-square w-full max-w-[200px] rounded-md overflow-hidden">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="">Select a category</option>
                    {VALUE_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="value_name">Value Name *</Label>
                  <Input
                    id="value_name"
                    value={valueName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValueName(e.target.value)}
                    placeholder="e.g., collaborative, innovative"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                    placeholder="Describe what this image represents"
                    rows={3}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTags(e.target.value)}
                    placeholder="e.g., teamwork, collaboration, office"
                  />
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Upload Image'}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      {/* Image Gallery */}
      <Card>
        <CardHeader>
          <CardTitle>Value Images Gallery</CardTitle>
          <CardDescription>
            Manage existing value images.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading images...</p>
          ) : images.length === 0 ? (
            <p>No images found. Upload some images to get started.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-square relative rounded-md overflow-hidden">
                    <Image
                      src={image.image_url}
                      alt={image.description || image.value_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="mt-2">
                    <p className="font-medium">{image.value_name}</p>
                    <p className="text-sm text-gray-500">{image.category}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 