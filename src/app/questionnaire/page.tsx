import ValuesQuestionnaire from '@/components/forms/ValuesQuestionnaire';

export default function QuestionnairePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Find Your Perfect Company Match</h1>
        <p className="text-lg text-center mb-8">
          Answer a few questions about your work preferences and interests to get personalized company recommendations.
        </p>
        <ValuesQuestionnaire />
      </div>
    </div>
  );
} 