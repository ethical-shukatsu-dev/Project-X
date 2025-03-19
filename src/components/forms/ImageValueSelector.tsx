"use client";

import React from "react";
import Image from "next/image";
import {cn} from "@/lib/utils";
import {ValueImage} from "@/lib/supabase/client";
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
            "relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-200 transform hover:scale-105",
            selectedImageId === image.id
              ? "ring-4 ring-primary ring-offset-2 shadow-[0_0_15px_rgba(139,92,246,0.7)]"
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
          {selectedImageId === image.id && (
            <>
              <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_30px_rgba(139,92,246,0.4)]"></div>
              <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1 shadow-md ring-2 ring-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
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
