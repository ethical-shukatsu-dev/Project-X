import OpenAI from "openai";
import {Company, UserValues} from "../supabase/client";
import {v4 as uuid} from "uuid";
import {getOrCreateCompany} from "../companies/client";
import fs from 'fs';
import path from 'path';

// Initialize the OpenAI client
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface RecommendationResult {
  company: Company;
  matchingPoints: string[];
}

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

// Function to load AI translations
const loadAiTranslations = (locale: string) => {
  try {
    const filePath = path.join(process.cwd(), 'public', 'locales', locale, 'ai.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Failed to load AI translations for ${locale}`, error);
    return null;
  }
};

/**
 * Generate company recommendations based on user values
 */
export async function generateRecommendations(
  userData: UserValues,
  locale: string = 'en'
): Promise<RecommendationResult[]> {
  // Load translations for the specified locale
  const translations = loadAiTranslations(locale) || loadAiTranslations('en');
  
  // Get the appropriate system prompt from translations
  const systemPrompt = translations?.systemPrompt?.recommendations?.replace('{{language}}', locale === 'ja' ? '日本語' : 'English') 
    || `You are a helpful assistant that recommends Japanese companies to university students based on their values and interests. Please respond in ${locale === 'ja' ? 'Japanese' : 'English'}.`;

  const promptTemplate = locale === 'ja' 
    ? `
    ユーザーの価値観と興味に基づいて、就職を考えている大学生に適した日本の企業5社を推薦してください。
    
    ユーザーの価値観と興味:
    ${JSON.stringify(userData.values)}
    ${JSON.stringify(userData.interests)}
    
    各企業について、以下の情報を提供してください:
    - 企業名
    - 業界
    - この企業がユーザーの価値観に合う理由を説明する3〜5つの具体的なポイント
    
    以下の構造でJSONフォーマットで回答してください: 
    {
      "recommendations": [
        { 
          "name": "企業名", 
          "industry": "業界", 
          "matchingPoints": ["ポイント1", "ポイント2", ...] 
        },
        // 他の企業...
      ]
    }
    `
    : `
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
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {role: "user", content: promptTemplate},
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
        };
      })
    );

    return enhancedRecommendations;
  } catch (error) {
    console.error("Error processing recommendations:", error);
    throw new Error("Failed to generate recommendations");
  }
}

export async function fetchCompanyData(
  companyName: string,
  industry?: string,
  locale: string = 'en'
): Promise<Company> {
  // Get the appropriate system prompt based on locale
  const systemPrompt = locale === 'ja'
    ? "あなたは日本の就職活動をしている大学生向けに、企業に関する正確な情報を提供する役立つアシスタントです。情報はJSONフォーマットでのみ提供してください。"
    : "You are a helpful assistant that provides accurate information about companies in Japan for university students seeking employment. Provide information in JSON format only.";

  const promptTemplate = locale === 'ja'
    ? `
    "${companyName}" ${industry ? `（${industry}業界）` : ""} に関する詳細情報を提供してください。
    この情報は日本で就職活動をしている大学生に関連するものであるべきです。
    
    以下の情報をJSONフォーマットで含めてください:
    - name: 会社の正式名称
    - industry: 主要業界
    - description: 詳細な説明（100〜150語）
    - size: 会社の規模（従業員数の範囲を含む小/中/大）
    - values: 1〜10の数値評価による会社の価値観を表すJSONオブジェクト、例えば:
      {
        "work_life_balance": 8,
        "remote_work": 7,
        "innovation": 9,
        "social_impact": 6
      }
    - headquarters: 本社所在地
    - japan_presence: 日本での存在感に関する詳細
    
    有効なJSONフォーマットのみで回答してください。
    `
    : `
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
          content: systemPrompt,
        },
        {role: "user", content: promptTemplate},
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
