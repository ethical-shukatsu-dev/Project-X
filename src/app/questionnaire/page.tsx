import ValuesQuestionnaire from '@/components/forms/ValuesQuestionnaire';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function QuestionnairePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="mb-8 text-center">
          <CardHeader>
            <CardTitle className="text-3xl">Find Your Perfect Company Match</CardTitle>
            <CardDescription className="text-lg">
              Answer a few questions about your work preferences and interests to get personalized company recommendations.
            </CardDescription>
          </CardHeader>
        </Card>
        <ValuesQuestionnaire />
      </div>
    </div>
  );
} 