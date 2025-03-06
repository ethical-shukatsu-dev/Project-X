"use client";

import {Suspense} from "react";
import {Skeleton} from "@/components/ui/skeleton";
import RecommendationsContent from "@/components/recommendations/RecommendationsContent";

// Loading fallback component
function RecommendationsLoading() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <Skeleton className="h-8 w-1/3 mx-auto mb-4" />
      <Skeleton className="h-4 w-1/2 mx-auto mb-8" />
      <div className="max-w-4xl mx-auto">
        <Skeleton className="h-[200px] w-full mb-4" />
        <Skeleton className="h-[200px] w-full mb-4" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function RecommendationsPage() {
  return (
    <Suspense fallback={<RecommendationsLoading />}>
      <RecommendationsContent />
    </Suspense>
  );
}
