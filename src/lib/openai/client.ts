import OpenAI from 'openai';
import { Company, UserValues } from '../supabase/client';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type RecommendationResult = {
  company: Company;
  matchingPoints: string[];
  score: number;
};

// Type for the OpenAI response
type OpenAIRecommendation = {
  companyId: string;
  score: number;
  matchingPoints: string[];
};

/**
 * Generate company recommendations based on user values
 */
export async function generateRecommendations(
  userValues: UserValues,
  companies: Company[],
  count: number = 10
): Promise<RecommendationResult[]> {
  try {
    // Prepare the prompt for OpenAI
    const prompt = `
      I have a user with the following values and interests:
      Values: ${JSON.stringify(userValues.values)}
      Interests: ${userValues.interests.join(', ')}
      
      I also have a list of companies:
      ${JSON.stringify(companies, null, 2)}
      
      Please recommend the top ${count} companies that match this user's values and interests.
      For each recommendation, provide:
      1. The company ID
      2. A score from 0-100 indicating how well it matches
      3. 2-3 specific points explaining why this company matches the user's values
      
      Return the results as a JSON array with objects containing: 
      { companyId, score, matchingPoints }
    `;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that recommends companies based on user values and interests.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
    });

    // Parse the response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    const parsedResponse = JSON.parse(content);
    const recommendations = parsedResponse.recommendations || [];

    // Map the recommendations to our format
    return recommendations.map((rec: OpenAIRecommendation) => {
      const company = companies.find(c => c.id === rec.companyId);
      if (!company) {
        throw new Error(`Company with ID ${rec.companyId} not found`);
      }
      
      return {
        company,
        matchingPoints: rec.matchingPoints,
        score: rec.score,
      };
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw error;
  }
} 