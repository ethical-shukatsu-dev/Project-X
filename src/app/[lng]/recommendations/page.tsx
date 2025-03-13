import RecommendationsContent from "@/components/recommendations/RecommendationsContent";

// Main page component with Suspense boundary
export default function RecommendationsPage({
  params,
}: {
  params: Promise<{lng: string}>;
}) {
  // Use an async IIFE to handle the Promise
  const RecommendationsPageContent = async () => {
    const resolvedParams = await params;
    const lng = resolvedParams.lng;

    return <RecommendationsContent lng={lng} />;
  };

  return RecommendationsPageContent();
}
