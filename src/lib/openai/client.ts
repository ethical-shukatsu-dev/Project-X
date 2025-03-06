/* eslint-disable @typescript-eslint/no-explicit-any */
import OpenAI from "openai";
import {Company, UserValues} from "../supabase/client";
import {v4 as uuid} from "uuid";
import {getOrCreateCompany} from "../companies/client";

// Initialize the OpenAI client
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type RecommendationResult = {
  company: Company;
  matchingPoints: string[];
  score: number;
};

// Define type for recommendation response from OpenAI
type OpenAIRecommendation = {
  name: string;
  industry: string;
  matchingPoints: string[];
};

type OpenAIRecommendationResponse = {
  recommendations: OpenAIRecommendation[];
};

// Define type for company data from OpenAI
type OpenAICompanyData = {
  name: string;
  industry: string;
  description: string;
  size: string;
  values: Record<string, number>;
  headquarters?: string;
  japan_presence?: string;
};

/**
 * Generate company recommendations based on user values
 */
export async function generateRecommendations(
  userData: UserValues
): Promise<RecommendationResult[]> {
  const prompt = `
    Based on the user's values and interests, recommend 5 real companies in Japan 
    that would be good matches for a university student seeking employment.
    
    User values and interests:
    ${JSON.stringify(userData.values)}
    ${JSON.stringify(userData.interests)}
    
    For each company, provide:
    - Company name
    - Industry
    - 3-5 specific points explaining why this company matches the user's values
    
    Format as JSON with this structure: 
    {
      "recommendations": [
        { 
          "name": "Company Name", 
          "industry": "Industry", 
          "matchingPoints": ["point1", "point2", ...] 
        },
        // more companies...
      ]
    }
  `;

  try {
    const response = await openaiClient.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that recommends Japanese companies to university students based on their values and interests.",
        },
        {role: "user", content: prompt},
      ],
      response_format: {type: "json_object"},
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    const parsedResponse = JSON.parse(content) as OpenAIRecommendationResponse;
    const recommendations = parsedResponse.recommendations;

    // Fetch or create company data for each recommendation
    const enhancedRecommendations = await Promise.all(
      recommendations.map(async (rec) => {
        const company = await getOrCreateCompany(rec.name, rec.industry);

        return {
          company,
          matchingPoints: rec.matchingPoints,
          score: calculateMatchScore(userData, company, rec.matchingPoints),
        };
      })
    );

    return enhancedRecommendations;
  } catch (error) {
    console.error("Error processing recommendations:", error);
    throw new Error("Failed to generate recommendations");
  }
}

// Enhanced function to calculate match score
function calculateMatchScore(
  userData: UserValues,
  company: Company,
  matchingPoints: string[]
): number {
  // Base score from matching points (10 points per match)
  const matchingPointsScore = matchingPoints.length * 10;
  
  // Calculate value alignment score
  let valueAlignmentScore = 0;
  let valuesCompared = 0;
  
  // Compare shared values between user and company
  if (userData.values && company.values) {
    Object.keys(userData.values).forEach(key => {
      if (company.values[key] !== undefined) {
        // Calculate similarity (0-10 scale)
        const userValue = userData.values[key];
        const companyValue = company.values[key];
        const similarity = 10 - Math.abs(userValue - companyValue);
        
        valueAlignmentScore += similarity;
        valuesCompared++;
      }
    });
  }
  
  // Normalize value alignment score (0-50 scale)
  const normalizedValueScore = valuesCompared > 0 
    ? (valueAlignmentScore / valuesCompared) * 5 
    : 0;
  
  // Interest match bonus (up to 20 points)
  let interestMatchScore = 0;
  if (userData.interests && userData.interests.length > 0) {
    // Check if company description or industry contains any user interests
    const companyText = `${company.industry} ${company.description || ''}`.toLowerCase();
    
    userData.interests.forEach(interest => {
      if (companyText.includes(interest.toLowerCase())) {
        interestMatchScore += 5; // 5 points per matched interest
      }
    });
    
    // Cap interest match score at 20
    interestMatchScore = Math.min(interestMatchScore, 20);
  }
  
  // Calculate final score (max 100)
  const totalScore = Math.min(
    matchingPointsScore + normalizedValueScore + interestMatchScore,
    100
  );
  
  return Math.round(totalScore);
}

export async function fetchCompanyData(
  companyName: string,
  industry?: string
): Promise<Company> {
  const prompt = `
    Provide detailed information about "${companyName}" ${
    industry ? `in the ${industry} industry` : ""
  } 
    that would be relevant for university students in Japan seeking employment.
    
    Include the following information in JSON format:
    - name: Full company name
    - industry: Primary industry
    - description: A detailed description (100-150 words)
    - size: Company size (Small/Medium/Large with employee count range)
    - values: JSON object with company values as numeric ratings from 1-10, such as:
      {
        "work_life_balance": 8,
        "remote_work": 7,
        "innovation": 9,
        "social_impact": 6
      }
    - headquarters: Headquarters location
    - japan_presence: Details about their presence in Japan
    
    Format the response as valid JSON only.
  `;

  try {
    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that provides accurate information about companies in Japan for university students seeking employment. Provide information in JSON format only.",
        },
        {role: "user", content: prompt},
      ],
      response_format: {type: "json_object"},
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    const companyData = JSON.parse(content) as OpenAICompanyData;

    // Ensure values are numbers
    const numericValues: Record<string, number> = {};
    Object.entries(companyData.values).forEach(([key, value]) => {
      numericValues[key] =
        typeof value === "number" ? value : parseInt(value as string, 10);
    });

    return {
      id: uuid(), // Generate a UUID for the new company
      name: companyData.name,
      industry: companyData.industry,
      description: companyData.description,
      size: companyData.size,
      values: numericValues,
      logo_url: null, // We could add logo fetching in the future
      data_source: "openai",
      last_updated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error parsing OpenAI response:", error);
    throw new Error("Failed to parse company data from OpenAI");
  }
}
