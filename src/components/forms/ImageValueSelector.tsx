'use client';

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
  selectedImageId,
}: ImageValueSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {images.map((image) => (
        <div
          key={image.id}
          onClick={() => onSelect(image.id)}
          className={cn(
            'relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-200 transform hover:scale-105',
            selectedImageId === image.id
              ? 'ring-4 ring-primary ring-offset-2 shadow-[0_0_15px_rgba(139,92,246,0.7)]'
              : 'ring-1 ring-gray-200 hover:ring-gray-300'
          )}
        >
          <Image
            src={image.image_url}
            alt={image.description || 'Value image'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {selectedImageId === image.id && (
            <>
              <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_30px_rgba(139,92,246,0.4)]"></div>
              <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1 shadow-md ring-2 ring-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </>
          )}
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

export function ImageQuestionGrid({ images, onSelect, selectedImageId }: ImageQuestionGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 min-h-[300px] max-w-4xl mx-auto">
      {images.map((image) => (
        <button
          key={image.id}
          onClick={() => onSelect(image.id)}
          className={`relative flex flex-col items-center p-4 transition-all duration-300 rounded-xl border hover:shadow-blue-500/10 min-h-[250px] ${
            selectedImageId === image.id
              ? 'border-transparent bg-gradient-to-r from-blue-500/80 to-purple-500/80 shadow-lg'
              : 'border-white/10 hover:bg-white/5'
          }`}
        >
          {/* Image container with consistent aspect ratio */}
          <div className="relative w-full h-48 rounded-lg overflow-hidden">
            <img
              src={image.image_url}
              alt={image.value_name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
          {/* Value name label */}
          <span
            className={`mt-4 text-lg sm:text-xl ${
              selectedImageId === image.id ? 'text-white' : 'text-gray-300'
            }`}
          >
            {image.value_name
              .split('_')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')}
          </span>
        </button>
      ))}
    </div>
  );
}
