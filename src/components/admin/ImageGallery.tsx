"use client";

import React from "react";
import Image from "next/image";
import {Loader2} from "lucide-react";
import {ValueImage} from "@/lib/supabase/client";

// Image card as a memoized component to prevent unnecessary re-renders
export const ImageCard = React.memo(({image}: {image: ValueImage}) => {
  return (
    <div className="relative group">
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
        
        {/* Attribution for images */}
        {image.attribution && (
          <div className="text-xs mt-1 text-gray-500">
            Photo by{" "}
            <a 
              href={image.attribution.photographer_url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-700"
            >
              {image.attribution.photographer_name}
            </a>
            {" "}on{" "}
            {image.unsplash_id ? (
              <a 
                href="https://unsplash.com/?utm_source=project_x&utm_medium=referral"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-700"
              >
                Unsplash
              </a>
            ) : image.pexels_id ? (
              <a 
                href="https://www.pexels.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-700"
              >
                Pexels
              </a>
            ) : (
              "Stock"
            )}
          </div>
        )}
        
        {image.tags && image.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {image.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

ImageCard.displayName = "ImageCard";

// Empty state component
const EmptyState = React.memo(
  ({message, resetAction}: {message: string; resetAction?: () => void}) => (
    <p>
      {message}
      {resetAction && (
        <>
          {" "}
          <button
            onClick={resetAction}
            className="text-primary underline hover:text-primary/80"
          >
            reset them
          </button>
        </>
      )}
      .
    </p>
  )
);

EmptyState.displayName = "EmptyState";

// Loading component
const LoadingState = React.memo(() => (
  <div className="flex justify-center items-center py-8">
    <Loader2 className="h-8 w-8 animate-spin" />
    <span className="ml-2">Loading images...</span>
  </div>
));

LoadingState.displayName = "LoadingState";

// Image Gallery component
export const ImageGallery = React.memo(
  ({
    images,
    isLoading,
    resetFilters,
    isFiltering,
  }: {
    images: ValueImage[];
    isLoading: boolean;
    resetFilters?: () => void;
    isFiltering: boolean;
  }) => {
    if (isLoading) {
      return <LoadingState />;
    }

    if (images.length === 0 && !isFiltering) {
      return (
        <EmptyState message="No images found. Upload some images or fetch from Pexels or Unsplash to get started" />
      );
    }

    if (images.length === 0 && isFiltering) {
      return (
        <EmptyState
          message="No images match your current filters. Try adjusting your filters or"
          resetAction={resetFilters}
        />
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <ImageCard key={image.id} image={image} />
        ))}
      </div>
    );
  }
);

ImageGallery.displayName = "ImageGallery";
