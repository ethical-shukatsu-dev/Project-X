"use client";

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ValueImage } from '@/lib/supabase/client';

interface ImageValueSelectorProps {
  images: ValueImage[];
  onSelect: (imageId: string) => void;
  selectedImageId?: string;
}

export default function ImageValueSelector({ 
  images, 
  onSelect, 
  selectedImageId 
}: ImageValueSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {images.map((image) => (
        <div 
          key={image.id}
          onClick={() => onSelect(image.id)}
          className={cn(
            "relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-200 transform hover:scale-105",
            selectedImageId === image.id 
              ? "ring-4 ring-primary ring-offset-2" 
              : "ring-1 ring-gray-200 hover:ring-gray-300"
          )}
        >
          <Image
            src={image.image_url}
            alt={image.description || "Value image"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 text-sm">
            {image.value_name}
          </div>
        </div>
      ))}
    </div>
  );
}

// Component for displaying a grid of image questions
interface ImageQuestionGridProps {
  images: ValueImage[];
  onSelect: (imageId: string) => void;
  selectedImageId?: string;
}

export function ImageQuestionGrid({
  images,
  onSelect,
  selectedImageId,
}: ImageQuestionGridProps) {
  return (
    <div className="space-y-4">
      <ImageValueSelector
        images={images}
        onSelect={onSelect}
        selectedImageId={selectedImageId}
      />
    </div>
  );
} 