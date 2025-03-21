"use client";

import React from "react";
import Image from "next/image";
import {Loader2, Copy, Check} from "lucide-react";
import {ValueImage} from "@/lib/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Image card as a memoized component to prevent unnecessary re-renders
export const ImageCard = React.memo(({image}: {image: ValueImage}) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(image.image_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  return (
    <div className="relative group">
      <div className="relative overflow-hidden rounded-md aspect-square">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Image
                src={image.image_url}
                alt={image.description || image.value_name}
                fill
                className="object-cover"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>{image.description || image.value_name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="mt-2">
        <p className="font-medium">{image.value_name}</p>
        <p className="text-sm text-gray-500">{image.category}</p>

        {/* Attribution for images */}
        {image.attribution && (
          <div className="mt-1 text-xs text-gray-500">
            Photo by{" "}
            <a
              href={image.attribution.photographer_url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-700"
            >
              {image.attribution.photographer_name}
            </a>{" "}
            on{" "}
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
                className="inline-block px-2 py-1 text-xs text-gray-800 bg-gray-100 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Copy URL Button */}
        <button
          onClick={copyToClipboard}
          className="flex items-center justify-center w-full gap-2 px-2 py-1.5 mt-2 text-xs text-gray-600 transition-colors bg-gray-100 rounded-md hover:bg-gray-200"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy image URL
            </>
          )}
        </button>
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
            className="underline text-primary hover:text-primary/80"
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
  <div className="flex items-center justify-center py-8">
    <Loader2 className="w-8 h-8 animate-spin" />
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
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {images.map((image) => (
          <TooltipProvider key={image.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <ImageCard key={image.id} image={image} />
              </TooltipTrigger>
              <TooltipContent>
                <p>{image.description || image.value_name || "Value image"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    );
  }
);

ImageGallery.displayName = "ImageGallery";
