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
  value_match_ratings?: Record<string, number>;
  strength_match_ratings?: Record<string, number>;
  value_matching_details?: Record<string, string>;
  strength_matching_details?: Record<string, string>;
  company_values?: string;
}

// Define type for recommendation response from OpenAI
type OpenAIRecommendation = {
  id?: string;
  name: string;
  industry: string;
  matching_points: string[];
  company_values?: string;
  value_match_ratings?: Record<string, number>;
  strength_match_ratings?: Record<string, number>;
  value_matching_details?: Record<string, string>;
  strength_matching_details?: Record<string, string>;
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
  company_values?: string;
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
    ? `\n\nあなたは画像ベースの価値観評価の専門家でもあります。ユーザーが選択した画像から価値観を抽出し、それを企業の推薦に活用できます。\n\nまた、企業データの分析の専門家でもあります。企業の公式情報（ミッション、ビジョン、価値観）だけでなく、社員レビューや実際の職場環境も考慮して、ユーザーの価値観と企業の価値観の間の真の適合性を評価してください。表面的なマッチングではなく、企業文化と実際の職場環境に基づいた深い分析を提供してください。\n\n特に重要なのは、ユーザーの価値観と企業の価値観の間の具体的な一致点を明確に示すことです。この企業はあなたと同じように...という形式で、具体的な例や証拠を含めた詳細な説明を提供してください。\n\n重要: すべての出力は必ず日本語のみで提供してください。企業名や業界名も含め、英語の単語や文を混在させないでください。`
    : `\n\nYou are also an expert in image-based value assessment. You can extract values from images selected by users and incorporate them into company recommendations.\n\nYou are also an expert in company data analysis. Consider not just official company information (mission, vision, values) but also employee reviews and actual workplace environment to evaluate the true fit between user values and company values. Provide deep analysis based on company culture and actual workplace environment, not just surface-level matching.\n\nIt is especially important to clearly show the specific connections between the user's values and the company's values. Use a "This company, like you, values..." format and provide detailed explanations with specific examples or evidence.\n\nImportant: All output must be provided in English only. Do not mix Japanese words or sentences, including company names and industry names.`);

  const promptTemplate = locale === 'ja' 
    ? `
    ユーザーの価値観と強みに基づいて、就職を考えている大学生に適した日本の企業${RECOMMENDATION_COUNT}社を推薦してください。様々な企業を含めるようにしてください。

    重要: すべての回答は必ず日本語のみで提供。企業名や業界名も含め、英語の単語や文を混在させないでください。
    
    ユーザーの価値観:
    ${JSON.stringify(userData.values)}

    ${userData.selected_image_values ? `
    ユーザーが選択した画像ベースの価値観:
    ${JSON.stringify(userData.selected_image_values)}
    
    これらの画像ベースの価値観は、ユーザーが視覚的に選択した価値観を表しています。テキストベースの価値観と同様に重要視してください。
    ` : ''}

    ${userData.strengths ? `
    ユーザーの強み:
    ${JSON.stringify(userData.strengths)}
    ` : ''}
    
    ${userData.interests ? `
    ユーザーの興味のある業種・業界:
    ${JSON.stringify(userData.interests)}
    ` : ''}
    
    各企業について、以下の情報を提供してください:
    - 企業名: 日本語で表記してください。英語名の場合は日本語での一般的な呼び方を使用してください。
    - 業界: 日本語で表記してください。
    - 大事にする価値観：この企業が大事にする価値観を100文字程度で記述してください。
    - 各価値観や強みとのマッチ度：ユーザーの各価値観や強みとのマッチ度を1-10で示してください。
    - 各価値観とのマッチングポイント: この企業がユーザーの各価値観に合う理由をすべて日本語で記述してください。プロダクトやサービスに触れるなどして具体的にマッチしている点を明確に示してください。
    - 各強みとのマッチングポイント：ユーザーの各強みがこの企業で活かされると思う具体的な状況とその根拠を示してください。
    
    マッチングポイントの良い例:
    - 「富士通ではイノベーションを生み出す環境を大事にしており、フレックスタイム制度や在宅勤務制度を積極的に導入しています。」
    - 「楽天ではストレス耐性が高い人材を求めています。流れの早いオンラインコマースの業界において、顧客のニーズに合わせて柔軟にソリューションを変えていくため、色々な変化が起きやすくストレス耐性のある人材を求めています。」
    - 「資生堂ではチームワークを重視しています。新規商品開発も一人の天才が生み出すより、チームで話し合って出てきたアイディアを大事にしています。」

    マッチングポイントの悪い例:
    - 「この企業はイノベーションを重視しています」（ユーザーとの具体的な関連性が示されていない）
    - 「良い職場環境を提供しています」（具体性に欠ける）
    - 「ユーザーの価値観に合っています」（具体的な一致点が示されていない）
    
    必ず以下の企業規模をすべて1社を含めた多様な企業を推薦してください：
    - 「スタートアップ（50人未満）」: 少なくとも1社
    - 「小規模（50-200人）」: 少なくとも1社 
    - 「中規模（1000-5000人）」: 少なくとも1社
    - 「大規模（10000人以上）」: 少なくとも1社
    
    また、該当企業の業界は下記のカテゴリとサブカテゴリから選んで表示してください。提示する企業は同じ業界にならないようにしてください。

    - メーカー
    食品・農林・水産
    建設・住宅・インテリア
    繊維・化学・薬品・化粧品
    鉄鋼・金属・鉱業
    機械・プラント
    電子・電気機器
    自動車・輸送用機器
    精密・医療機器
    印刷・事務機器関連
    スポーツ・玩具
    その他メーカー
    - サービス・インフラ
    不動産
    鉄道・航空・運輸・物流
    電力・ガス・エネルギー
    フードサービス
    ホテル・旅行
    医療・福祉
    アミューズメント・レジャー
    その他サービス
    コンサルティング・調査
    人材サービス
    教育
    - 商社
    総合商社
    専門商社
    - ソフトウェア
    ソフトウェア
    インターネット
    通信
    - 小売
    百貨店・スーパー
    コンビニ
    専門店
    - 広告・出版・マスコミ
    放送
    新聞
    出版
    広告
    - 金融
    銀行・証券
    クレジット
    信販・リース
    その他金融
    生保・損保
    - 官公庁・公社・団体
    公社・団体
    官公庁
    
    以下の構造でJSONフォーマットで回答してください: 
    {
      "recommendations": [
        { 
          "name": "企業名（日本語のみ）", 
          "industry": "業界（日本語のみ）",
          "company_values": "この企業が大事にする価値観（100文字程度）",
          "value_match_ratings": {
            "価値観1": 8,
            "価値観2": 9,
            ...
            // ユーザーの各価値観に対するマッチ度（1-10）
          },
          "strength_match_ratings": {
            "強み1": 7,
            "強み2": 9,
            ...
            // ユーザーの各強みに対するマッチ度（1-10）
          },
          "value_matching_details": {
            "価値観1": "この価値観に対する詳細なマッチングポイント",
            "価値観2": "この価値観に対する詳細なマッチングポイント",
            ...
            // ユーザーの各価値観に対する詳細な説明
          },
          "strength_matching_details": {
            "強み1": "この強みに対する詳細なマッチングポイント",
            "強み2": "この強みに対する詳細なマッチングポイント",
            ...
            // ユーザーの各強みに対する詳細な説明
          },
          "matching_points": ["総合的なマッチングポイント1（日本語のみ）", "総合的なマッチングポイント2（日本語のみ）", ...] 
        },
        // 他の企業...
      ]
    }
    
    再度強調しますが、すべての出力は日本語のみで提供してください。英語の単語や文を混在させないでください。
    `
    : `
    Based on the user's values and strengths, recommend ${RECOMMENDATION_COUNT} real companies in Japan 
    that would be good matches for a university student seeking employment. Include both well-known and lesser-known companies.

    Important: All responses must be in English only. Do not mix Japanese words or sentences, including company names and industry names.
    
    User values:
    ${JSON.stringify(userData.values)}
    ${userData.selected_image_values ? `
    
    User's image-based values:
    ${JSON.stringify(userData.selected_image_values)}
    
    These image-based values represent the values that the user selected visually. Please consider them as important as the text-based values.
    ` : ''}
    
    ${userData.strengths ? `
    User's strengths:
    ${JSON.stringify(userData.strengths)}
    ` : ''}

    ${userData.interests ? `
    User's interests:
    ${JSON.stringify(userData.interests)}
    ` : ''}
    
    For each company, provide:
    - Company name: Use the English name or the commonly used English translation.
    - Industry: Provide in English, selecting from the categories and subcategories listed below.
    - Company values: Describe in about 100 words the values that this company cares about.
    - Match ratings for each value and strength: Show how well the company matches each of the user's values and strengths on a scale of 1-10.
    - Matching points for each value: Explain in detail why this company matches each of the user's values. Be specific about how it matches, mentioning products or services if relevant.
    - Matching points for each strength: Explain specific situations where the user's strengths would be valued at the company and provide reasoning.
    - 3-5 overall matching points explaining why this company matches the user's values: All in English.

    Good examples of matching points:
    - "Sony prioritizes innovation by maintaining a creative environment where employees can propose and develop new ideas through dedicated R&D programs."
    - "Rakuten seeks employees with high stress tolerance. In the fast-paced e-commerce industry, employees need to adapt solutions to customer needs quickly, requiring resilience during constant changes."
    - "Shiseido values teamwork, believing that collaborative ideation produces better products than individual genius, encouraging group discussions for new product development."

    Poor examples of matching points:
    - "The company values innovation" (doesn't show specific connection to user)
    - "Provides a good work environment" (lacks specificity)
    - "Aligns with user values" (doesn't identify specific matching points)
    
    You must include companies of all the following sizes in your recommendations:
    - Startup: at least 1 company (use the exact text "Startup (less than 50 employees)" for company size)
    - Small company: at least 1 company (use the exact text "Small (50-200 employees)" for company size)
    - Medium company: at least 1 company (use the exact text "Medium (1000-5000 employees)" for company size)
    - Large company: at least 1 company (use the exact text "Large (10000+ employees)" for company size)
    
    Choose the company industries from the following categories and subcategories. Ensure the recommended companies are from different industries:

    - Manufacturing
    Food/Agriculture/Fishery
    Construction/Housing/Interior
    Textiles/Chemicals/Pharmaceuticals/Cosmetics
    Steel/Metal/Mining
    Machinery/Plant
    Electronic/Electrical Equipment
    Automotive/Transportation Equipment
    Precision/Medical Equipment
    Printing/Office Equipment
    Sports/Toys
    Other Manufacturing
    - Service/Infrastructure
    Real Estate
    Railway/Aviation/Transportation/Logistics
    Power/Gas/Energy
    Food Service
    Hotel/Travel
    Medical/Welfare
    Amusement/Leisure
    Other Services
    Consulting/Research
    Human Resources
    Education
    - Trading
    General Trading
    Specialized Trading
    - Software
    Software
    Internet
    Telecommunications
    - Retail
    Department Stores/Supermarkets
    Convenience Stores
    Specialty Stores
    - Advertising/Publishing/Media
    Broadcasting
    Newspaper
    Publishing
    Advertising
    - Finance
    Banking/Securities
    Credit
    Leasing/Finance
    Other Finance
    Life/Non-Life Insurance
    - Government/Public/Organizations
    Public Corporations/Organizations
    Government
    
    Format as JSON with this structure: 
    {
      "recommendations": [
        { 
          "name": "Company Name (English only)", 
          "industry": "Industry (English only)",
          "company_values": "Values this company cares about (about 100 words)",
          "value_match_ratings": {
            "value1": 8,
            "value2": 9,
            ...
            // Match ratings for each user value (1-10)
          },
          "strength_match_ratings": {
            "strength1": 7,
            "strength2": 9,
            ...
            // Match ratings for each user strength (1-10)
          },
          "value_matching_details": {
            "value1": "Detailed matching points for this value",
            "value2": "Detailed matching points for this value",
            ...
            // Detailed explanation for each user value
          },
          "strength_matching_details": {
            "strength1": "Detailed matching points for this strength",
            "strength2": "Detailed matching points for this strength",
            ...
            // Detailed explanation for each user strength
          },
          "matching_points": ["Overall matching point 1 (English only)", "Overall matching point 2 (English only)", ...] 
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
        id: rec.id || uuid(),
        company,
        matching_points: rec.matching_points,
        value_match_ratings: rec.value_match_ratings,
        strength_match_ratings: rec.strength_match_ratings,
        value_matching_details: rec.value_matching_details,
        strength_matching_details: rec.strength_matching_details,
        company_values: rec.company_values
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
    - company_values: この企業が大事にする価値観（100文字程度）を記述してください。
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
    - company_values: Describe the values that this company cares about (about 100 words).
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
      company_values: companyData.company_values || undefined,
      data_source: "openai",
      last_updated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error parsing OpenAI response:", error);
    throw new Error("Failed to parse company data from OpenAI");
  }
}
