import OpenAI from "openai";
import {Company, UserValues} from "../supabase/client";
import {v4 as uuid} from "uuid";
import {getOrCreateCompany} from "../companies/client";
import fs from 'fs';
import path from 'path';
import { RECOMMENDATION_COUNT } from "../constants/recommendations";

// Initialize the OpenAI client
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type RecommendationResult = {
  id: string;
  company: Company;
  matching_points: string[];
}

// Define type for recommendation response from OpenAI
type OpenAIRecommendation = {
  id: string;
  name: string;
  industry: string;
  matching_points: string[];
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
  site_url?: string;
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

  // Add expertise in image-based value interpretation and company data analysis
  const enhancedSystemPrompt = systemPrompt + (locale === 'ja' 
    ? `\n\nあなたは画像ベースの価値観評価の専門家でもあります。ユーザーが選択した画像から価値観を抽出し、それを企業の推薦に活用できます。\n\nまた、企業データの分析の専門家でもあります。企業の公式情報（ミッション、ビジョン、価値観）だけでなく、社員レビューや実際の職場環境も考慮して、ユーザーの価値観と企業の価値観の間の真の適合性を評価してください。表面的なマッチングではなく、企業文化と実際の職場環境に基づいた深い分析を提供してください。\n\n特に重要なのは、ユーザーの価値観と企業の価値観の間の具体的な一致点を明確に示すことです。「ユーザーと企業の両方が...」という形式で、具体的な例や証拠を含めた詳細な説明を提供してください。\n\n重要: すべての出力は必ず日本語のみで提供してください。企業名や業界名も含め、英語の単語や文を混在させないでください。`
    : `\n\nYou are also an expert in image-based value assessment. You can extract values from images selected by users and incorporate them into company recommendations.\n\nYou are also an expert in company data analysis. Consider not just official company information (mission, vision, values) but also employee reviews and actual workplace environment to evaluate the true fit between user values and company values. Provide deep analysis based on company culture and actual workplace environment, not just surface-level matching.\n\nIt is especially important to clearly show the specific connections between the user's values and the company's values. Use a "Both the user and the company..." format and provide detailed explanations with specific examples or evidence.\n\nImportant: All output must be provided in English only. Do not mix Japanese words or sentences, including company names and industry names.`);

  const promptTemplate = locale === 'ja' 
    ? `
    ユーザーの価値観に基づいて、就職を考えている大学生に適した日本の企業${RECOMMENDATION_COUNT}社を推薦してください。

    重要: すべての回答は必ず日本語のみで提供してください。企業名や業界名も含め、英語の単語や文を混在させないでください。
    
    ユーザーの価値観:
    ${JSON.stringify(userData.values)}
    ${userData.selected_image_values ? `
    
    ユーザーが選択した画像ベースの価値観:
    ${JSON.stringify(userData.selected_image_values)}
    
    これらの画像ベースの価値観は、ユーザーが視覚的に選択した価値観を表しています。テキストベースの価値観と同様に重要視してください。
    ` : ''}
    
    各企業について、以下の情報を提供してください:
    - 企業名: 日本語で表記してください。英語名の場合は日本語での一般的な呼び方を使用してください。
    - 業界: 日本語で表記してください。
    - この企業がユーザーの価値観に合う理由を説明する3〜5つの具体的なポイント: すべて日本語で記述してください。
    
    マッチングポイントについては、「ユーザーと企業の両方が...」という形式で、ユーザーの価値観と企業の価値観の具体的な一致点を明確に示してください。表面的な説明ではなく、具体的な例や証拠を含めてください。

    マッチングポイントの良い例:
    - 「ユーザーと富士通の両方がワークライフバランスを重視しています。ユーザーは柔軟な勤務環境を求めており、富士通はフレックスタイム制度や在宅勤務制度を積極的に導入しています。」
    - 「ユーザーと楽天の両方がイノベーションを重視しています。ユーザーは創造的な環境で働きたいと考えており、楽天は新しいアイデアを奨励し、社内ベンチャー制度を設けています。」
    - 「ユーザーと資生堂の両方が社会的影響を重視しています。ユーザーは社会貢献活動に関心があり、資生堂は環境保全活動や女性支援プログラムなど多くの社会貢献活動を行っています。」

    マッチングポイントの悪い例:
    - 「この企業はイノベーションを重視しています」（ユーザーとの具体的な関連性が示されていない）
    - 「良い職場環境を提供しています」（具体性に欠ける）
    - 「ユーザーの価値観に合っています」（具体的な一致点が示されていない）
    
    推薦する企業を選ぶ際は、以下の点を考慮してください:
    - 企業の公式な価値観だけでなく、実際の職場環境や社員の経験も考慮してください
    - 企業の公式声明と実際の行動の間にギャップがある場合は、実際の行動を優先してください
    - ユーザーの価値観と企業文化の間の本質的な適合性を評価してください
    - 企業の社会的評判、従業員満足度、業界での評価も考慮してください
    
    必ず以下の企業規模をすべて含めた多様な企業を推薦してください：
    - スタートアップ: 少なくとも1社（会社の規模は正確に「スタートアップ（50人未満）」と表記）
    - 小規模企業: 少なくとも1社（会社の規模は正確に「小規模（50-200人）」と表記）
    - 中規模企業: 少なくとも1社（会社の規模は正確に「中規模 200-1000人」と表記）
    - 大規模企業: 少なくとも1社（会社の規模は正確に「大規模 1000人以上」と表記）
    
    企業の規模はフィルタリングと検索の目的で重要なので、必ず上記の正確な形式で表記してください。
    
    また、以下の業界からそれぞれ少なくとも1社を含めてください。全ての業界から選ぶ必要はありませんが、少なくとも5つの異なる業界からの企業を含めてください：
    - テクノロジー/IT
    - 医療/ヘルスケア
    - 金融/銀行
    - 教育
    - サステナビリティ/環境
    - 小売/消費財
    - 製造業
    - メディア/エンターテインメント
    - コンサルティング
    - 非営利/社会的企業
    
    これにより、学生が様々な業界の選択肢を検討できるようになります。
    
    以下の構造でJSONフォーマットで回答してください: 
    {
      "recommendations": [
        { 
          "name": "企業名（日本語のみ）", 
          "industry": "業界（日本語のみ）", 
          "matching_points": ["ポイント1（日本語のみ）", "ポイント2（日本語のみ）", ...] 
        },
        // 他の企業...
      ]
    }
    
    再度強調しますが、すべての出力は日本語のみで提供してください。英語の単語や文を混在させないでください。
    `
    : `
    Based on the user's values, recommend ${RECOMMENDATION_COUNT} real companies in Japan 
    that would be good matches for a university student seeking employment.

    Important: All responses must be in English only. Do not mix Japanese words or sentences, including company names and industry names.
    
    User values:
    ${JSON.stringify(userData.values)}
    ${userData.selected_image_values ? `
    
    User's image-based values:
    ${JSON.stringify(userData.selected_image_values)}
    
    These image-based values represent the values that the user selected visually. Please consider them as important as the text-based values.
    ` : ''}
    
    For each company, provide:
    - Company name: Use the English name or the commonly used English translation.
    - Industry: Provide in English.
    - 3-5 specific points explaining why this company matches the user's values: All in English.
    
    For the matching points, clearly show the specific connections between the user's values and the company's values using a "Both the user and the company..." format. Include specific examples or evidence rather than surface-level explanations.

    Good examples of matching points:
    - "Both the user and Sony value innovation. The user seeks a creative environment, and Sony encourages new ideas through its innovation programs and dedicated R&D budget."
    - "Both the user and Toyota prioritize work-life balance. The user values flexible working arrangements, and Toyota has implemented comprehensive flexible work policies and family support programs."
    - "Both the user and Rakuten emphasize career growth. The user is looking for professional development opportunities, and Rakuten offers structured career advancement paths and extensive training programs."

    Poor examples of matching points:
    - "The company values innovation" (doesn't show specific connection to user)
    - "Provides a good work environment" (lacks specificity)
    - "Aligns with user values" (doesn't identify specific matching points)
    
    When selecting companies to recommend, consider:
    - Not just official company values but also actual workplace environment and employee experiences
    - When there's a gap between official company statements and actual practices, prioritize actual practices
    - Evaluate the intrinsic fit between user values and company culture
    - Consider the company's social reputation, employee satisfaction, and industry standing
    
    You must include companies of all the following sizes in your recommendations:
    - Startup: at least 1 company (use the exact text "Startup (less than 50 employees)" for company size)
    - Small company: at least 1 company (use the exact text "Small (50-200 employees)" for company size)
    - Medium company: at least 1 company (use the exact text "Medium (200-1000 employees)" for company size)
    - Large company: at least 1 company (use the exact text "Large (1000+ employees)" for company size)
    
    Company size is important for filtering and search purposes, so please use these exact formats.
    
    Additionally, please include at least one company from each of these industries. You don't need to include all industries, but ensure that at least 5 different industries are represented:
    - Technology/IT
    - Healthcare/Medical
    - Finance/Banking
    - Education
    - Sustainability/Environment
    - Retail/Consumer Goods
    - Manufacturing
    - Media/Entertainment
    - Consulting
    - Nonprofit/Social Enterprise
    
    This will help students consider options across various industries.
    
    Format as JSON with this structure: 
    {
      "recommendations": [
        { 
          "name": "Company Name (English only)", 
          "industry": "Industry (English only)", 
          "matching_points": ["point1 (English only)", "point2 (English only)", ...] 
        },
        // more companies...
      ]
    }
    
    To emphasize again, all output must be in English only. Do not mix Japanese words or sentences.
    `;

  try {
    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: enhancedSystemPrompt,
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
        const company = await getOrCreateCompany(rec.name, rec.industry, locale);

        return {
          id: rec.id,
          company,
          matching_points: rec.matching_points,
        };
      })
    );

    return enhancedRecommendations;
  } catch (error) {
    console.error("Error processing recommendations:", error);
    throw new Error("Failed to generate recommendations");
  }
}

/**
 * Fetch a company logo URL using the BrandFetch Logo Link API
 * @param companyName The company name
 * @param companySiteUrl The company site url
 * @returns A URL to the company logo or null if not found
 */
export async function fetchCompanyLogo(companyName: string, companySiteUrl?: string): Promise<string | null> {
  try {
    // Get the BrandFetch client ID from environment variables
    const clientId = process.env.BRANDFETCH_CLIENT_ID;
    
    if (!clientId) {
      console.warn('BRANDFETCH_CLIENT_ID is not set in environment variables');
      return generateFallbackLogo(companyName);
    }
    
    let domains: string[] = [];
    
    // Use companySiteUrl if provided
    if (companySiteUrl) {
      try {
        // Extract domain from URL
        const url = new URL(companySiteUrl.startsWith('http') ? companySiteUrl : `https://${companySiteUrl}`);
        domains = [url.hostname];
      } catch (error) {
        console.warn(`Invalid URL format for companySiteUrl: ${companySiteUrl}`, error);
        // Fall back to domain generation logic
      }
    }
    
    // If no valid domain from companySiteUrl, use the original domain generation logic
    if (domains.length === 0) {
      // Format company name for domain (remove spaces, special chars)
      const formattedName = companyName
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      
      // Try common domain extensions
      domains = [
        `${formattedName}.com`,
        `${formattedName}.co.jp`,
        `${formattedName}.jp`,
        `${formattedName}.io`,
        `${formattedName}.org`,
        `${formattedName}.net`
      ];
    }
    
    // Try to find a valid logo using BrandFetch Logo Link
    for (const domain of domains) {
      // Use BrandFetch Logo Link API
      const logoUrl = `https://cdn.brandfetch.io/${domain}?c=${clientId}`;
      
      // Check if the logo exists by making a HEAD request
      try {
        const response = await fetch(logoUrl, { method: 'HEAD' });
        
        if (response.ok) {
          return logoUrl;
        }
      } catch {
        // Continue to the next domain if this one fails
        continue;
      }
    }
    
    // If no logo found from BrandFetch, use fallback
    return generateFallbackLogo(companyName);
  } catch (error) {
    console.error("Error fetching company logo:", error);
    
    // Even if there's an error, still return a generated avatar
    return generateFallbackLogo(companyName);
  }
}

/**
 * Generate a fallback logo using UI Avatars
 * @param companyName The name of the company
 * @returns A URL to a generated logo
 */
function generateFallbackLogo(companyName: string): string {
  // Get initials from company name
  const initials = companyName
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  
  // Generate a consistent color based on company name
  const colorHash = Math.abs(
    companyName.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0)
  ) % 16777215; // 16777215 is FFFFFF in decimal
  
  const colorHex = colorHash.toString(16).padStart(6, '0');
  
  // Use UI Avatars to generate a placeholder with the company's initials
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${colorHex}&color=fff&size=256`;
}

export async function fetchCompanyData(
  companyName: string,
  industry?: string,
  locale: string = 'en'
): Promise<Company> {
  // Get the appropriate system prompt based on locale
  const systemPrompt = locale === 'ja'
    ? "あなたは日本の就職活動をしている大学生向けに、企業に関する正確な情報を提供する役立つアシスタントです。企業の公式情報、ミッション、ビジョン、価値観、社員レビュー、および職場文化に基づいて、正確で詳細な企業プロファイルを作成してください。各企業の価値観を評価する際は、公式声明だけでなく、実際の職場環境や社員の経験も考慮してください。情報はJSONフォーマットでのみ提供してください。重要: すべての出力は必ず日本語のみで提供してください。企業名や業界名も含め、英語の単語や文を混在させないでください。"
    : "You are a helpful assistant that provides accurate information about companies in Japan for university students seeking employment. Create accurate and detailed company profiles based on official company information, mission statements, vision, values, employee reviews, and workplace culture. When evaluating company values, consider not just official statements but also the actual work environment and employee experiences. Provide information in JSON format only. Important: All output must be provided in English only. Do not mix Japanese words or sentences, including company names and industry names.";

  const promptTemplate = locale === 'ja'
    ? `
    "${companyName}" ${industry ? `（${industry}業界）` : ""} に関する詳細情報を提供してください。
    この情報は日本で就職活動をしている大学生に関連するものであるべきです。

    重要: すべての回答は必ず日本語のみで提供してください。企業名や業界名も含め、英語の単語や文を混在させないでください。
    
    以下の情報をJSONフォーマットで含めてください:
    - name: 会社の正式名称（日本語で表記）
    - industry: 主要業界（日本語で表記）
    - description: 詳細な説明（100〜150語）。会社の歴史、主要製品/サービス、市場での位置づけを含めてください。すべて日本語で記述してください。
    - size: 会社の規模。従業員数に基づいて、以下の正確な形式のいずれかのみを使用してください：
      - 「スタートアップ（50人未満）」 - 小規模スタートアップ企業向け
      - 「小規模（50-200人）」 - 50人から200人程度の企業向け
      - 「中規模（1000-5000人）」 - 1000人から5000人程度の企業向け
      - 「大規模（10000人以上）」 - 10000人以上の大企業向け
    - values: 1〜10の数値評価による会社の価値観を表すJSONオブジェクト。以下の要素を含め、可能な限り正確に評価してください:
      {
        "work_life_balance": 8, // 実際の労働時間、休暇制度、柔軟な勤務体制に基づく評価
        "remote_work": 7, // リモートワークの方針と実際の実施状況
        "innovation": 9, // 新しいアイデアや技術への投資と実際の革新性
        "social_impact": 6, // 社会貢献活動と実際の影響力
        "career_growth": 8, // キャリア開発機会と昇進の可能性
        "compensation": 7, // 業界平均と比較した給与水準
        "company_stability": 9, // 財務安定性と市場での地位
        "diversity_inclusion": 6, // 多様性と包括性への取り組みと実際の職場環境
        "management_quality": 8 // リーダーシップの質と社員との関係
      }
      
      各評価値には、会社の公式情報だけでなく、社員レビューや実際の職場環境も考慮してください。
      評価は単なる推測ではなく、入手可能な情報に基づいた根拠のある判断であるべきです。
      
    - headquarters: 本社所在地（日本語で表記）
    - japan_presence: 日本での存在感に関する詳細（オフィス所在地、従業員数、事業内容など）（日本語で表記）
    - site_url: 会社の公式ウェブサイトのURL（わかる場合）。不明な場合はnullを返してください。
    
    有効なJSONフォーマットのみで回答してください。
    
    再度強調しますが、すべての出力は日本語のみで提供してください。英語の単語や文を混在させないでください。
    `
    : `
    Provide detailed information about "${companyName}" ${
    industry ? `in the ${industry} industry` : ""
    } 
    that would be relevant for university students in Japan seeking employment.

    Important: All responses must be in English only. Do not mix Japanese words or sentences, including company names and industry names.
    
    Include the following information in JSON format:
    - name: Full company name (in English)
    - industry: Primary industry (in English)
    - description: A detailed description (100-150 words) including company history, main products/services, and market position. All in English.
    - size: Company size. Use only one of the following exact formats based on employee count:
      - "Startup (less than 50 employees)" - For small startups
      - "Small (50-200 employees)" - For companies with around 50-200 employees
      - "Medium (1000-5000 employees)" - For companies with around 1000-5000 employees
      - "Large (10000+ employees)" - For large companies with over 10000 employees
    - values: JSON object with company values as numeric ratings from 1-10. Include the following elements and rate them as accurately as possible:
      {
        "work_life_balance": 8, // Based on actual working hours, vacation policies, and flexible work arrangements
        "remote_work": 7, // Based on remote work policies and actual implementation
        "innovation": 9, // Based on investment in new ideas and technologies and actual innovation
        "social_impact": 6, // Based on social contribution activities and actual impact
        "career_growth": 8, // Based on career development opportunities and promotion possibilities
        "compensation": 7, // Based on salary levels compared to industry average
        "company_stability": 9, // Based on financial stability and market position
        "diversity_inclusion": 6, // Based on diversity and inclusion initiatives and actual workplace environment
        "management_quality": 8 // Based on leadership quality and relationship with employees
      }
      
      For each rating, consider not just official company information but also employee reviews and actual workplace environment.
      Ratings should be evidence-based judgments from available information, not mere guesses.
      
    - headquarters: Headquarters location (in English)
    - japan_presence: Details about their presence in Japan (office locations, employee count, business activities) (in English)
    - site_url: The company's official website URL if known. Return null if unknown.
    
    Format the response as valid JSON only.
    
    To emphasize again, all output must be in English only. Do not mix Japanese words or sentences.
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

    // Fetch company logo
    const logoUrl = await fetchCompanyLogo(companyData.name, companyData.site_url);

    return {
      id: uuid(), // Generate a UUID for the new company
      name: companyData.name,
      industry: companyData.industry,
      description: companyData.description,
      size: companyData.size,
      values: numericValues,
      logo_url: logoUrl, // Use the fetched logo URL instead of null
      site_url: companyData.site_url || null, // Include domain URL if available
      data_source: "openai",
      last_updated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error parsing OpenAI response:", error);
    throw new Error("Failed to parse company data from OpenAI");
  }
}
