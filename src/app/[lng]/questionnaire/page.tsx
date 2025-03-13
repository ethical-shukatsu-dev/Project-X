import ValuesQuestionnaire from "@/components/forms/ValuesQuestionnaire";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {Suspense} from "react";
import {Skeleton} from "@/components/ui/skeleton";
import {getTranslation} from "@/i18n-server";

// Loading skeleton component for the questionnaire
function QuestionnaireLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="mb-8 text-center">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mx-auto mb-2" />
            <Skeleton className="h-4 w-full mx-auto" />
            <Skeleton className="h-4 w-5/6 mx-auto mt-1" />
          </CardHeader>
        </Card>

        {/* Skeleton for questionnaire form */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" /> {/* Question X of Y */}
            <Skeleton className="h-5 w-full" /> {/* Question text */}
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4 rounded-full" />{" "}
                  {/* Radio button */}
                  <Skeleton className="h-5 w-full max-w-[250px]" />{" "}
                  {/* Option label */}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Skeleton className="h-10 w-24" /> {/* Previous button */}
            <Skeleton className="h-10 w-20" /> {/* Next button */}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function QuestionnairePage({
  params,
  searchParams,
}: {
  params: Promise<{lng: string}>;
  searchParams: Promise<{type?: string}>;
}) {
  // Use an async IIFE to handle the Promise
  const QuestionnairePageContent = async () => {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const lng = resolvedParams.lng;
    const {t} = await getTranslation(lng, "ai");

    // Get the questionnaire type from the URL query parameters
    const questionnaireType = resolvedSearchParams.type || "text"; // Default to text if not specified

    return (
      <Suspense fallback={<QuestionnaireLoadingSkeleton />}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="mb-8 text-center">
              <CardHeader>
                <CardTitle className="text-3xl">
                  {t("questionnaire.title")}
                </CardTitle>
                <CardDescription className="text-lg">
                  {t("questionnaire.description")}
                </CardDescription>
              </CardHeader>
            </Card>
            <ValuesQuestionnaire
              lng={lng}
              questionnaireType={questionnaireType}
            />
          </div>
        </div>
      </Suspense>
    );
  };

  return QuestionnairePageContent();
}
