import { supabase, Company } from '../supabase/client';
import { getModelForProvider, openai } from '../openai/config';
import { v4 as uuid } from 'uuid';

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

export async function fetchCompanyData(
  companyName: string,
  industry?: string,
  locale: string = 'en'
): Promise<Company> {
  // Get the appropriate system prompt based on locale
  const systemPrompt =
    locale === 'ja'
      ? 'あなたは日本の就職活動をしている大学生向けに、企業に関する正確な情報を提供する役立つアシスタントです。企業の公式情報、ミッション、ビジョン、価値観、社員レビュー、および職場文化に基づいて、正確で詳細な企業プロファイルを作成してください。各企業の価値観を評価する際は、公式声明だけでなく、実際の職場環境や社員の経験も考慮してください。情報はJSONフォーマットでのみ提供してください。重要: すべての出力は必ず日本語のみで提供してください。企業名や業界名も含め、英語の単語や文を混在させないでください。'
      : 'You are a helpful assistant that provides accurate information about companies in Japan for university students seeking employment. Create accurate and detailed company profiles based on official company information, mission statements, vision, values, employee reviews, and workplace culture. When evaluating company values, consider not just official statements but also the actual work environment and employee experiences. Provide information in JSON format only. Important: All output must be provided in English only. Do not mix Japanese words or sentences, including company names and industry names.';

  const promptTemplate =
    locale === 'ja'
      ? `
    "${companyName}" ${industry ? `（${industry}業界）` : ''} に関する詳細情報を提供してください。
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
      industry ? `in the ${industry} industry` : ''
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
    const response = await openai.chat.completions.create({
      model: getModelForProvider(openai),
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        { role: 'user', content: promptTemplate },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const companyData = JSON.parse(content) as OpenAICompanyData;

    // Ensure values are numbers
    const numericValues: Record<string, number> = {};
    Object.entries(companyData.values).forEach(([key, value]) => {
      numericValues[key] = typeof value === 'number' ? value : parseInt(value as string, 10);
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
      data_source: 'openai',
      last_updated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error parsing OpenAI response:', error);
    throw new Error('Failed to parse company data from OpenAI');
  }
}

export async function getOrCreateCompany(
  companyName: string,
  industry?: string,
  locale: string = 'en'
): Promise<Company> {
  try {
    // Check if company exists in database
    const { data: existingCompany, error } = await supabase
      .from('companies')
      .select('*')
      .ilike('name', companyName)
      .single();

    if (!error && existingCompany) {
      return existingCompany as Company;
    }

    // If company doesn't exist, fetch from OpenAI
    const companyData = await fetchCompanyData(companyName, industry, locale);

    // Extract the company_values field if present
    const { company_values, ...standardCompanyData } = companyData;

    // Prepare the company data for insertion
    const companyToInsert = {
      ...standardCompanyData,
      company_values: company_values || null,
    };

    // Insert into database
    const { data: newCompany, error: insertError } = await supabase
      .from('companies')
      .insert([companyToInsert])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting company data:', insertError);
      throw new Error('Failed to save company data');
    }

    return newCompany as Company;
  } catch (error) {
    console.error('Error creating company:', error);
    throw error;
  }
}

/**
 * Fetch a company logo URL using the BrandFetch Logo Link API
 * @param companyName The company name
 * @param companySiteUrl The company site url
 * @returns A URL to the company logo or null if not found
 */
export async function fetchCompanyLogo(
  companyName: string,
  companySiteUrl?: string
): Promise<string | null> {
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
        const url = new URL(
          companySiteUrl.startsWith('http') ? companySiteUrl : `https://${companySiteUrl}`
        );
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
        `${formattedName}.net`,
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
    console.error('Error fetching company logo:', error);

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
    .map((word) => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Generate a consistent color based on company name
  const colorHash =
    Math.abs(
      companyName.split('').reduce((acc, char) => {
        return acc + char.charCodeAt(0);
      }, 0)
    ) % 16777215; // 16777215 is FFFFFF in decimal

  const colorHex = colorHash.toString(16).padStart(6, '0');

  // Use UI Avatars to generate a placeholder with the company's initials
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    initials
  )}&background=${colorHex}&color=fff&size=256`;
}

/**
 * Updates existing companies in the database with logos if they don't have one
 */
export async function updateCompanyLogos(): Promise<void> {
  try {
    // Get all companies without logos
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .is('logo_url', null);

    if (error) {
      console.error('Error fetching companies without logos:', error);
      return;
    }

    if (!companies || companies.length === 0) {
      console.log('No companies without logos found');
      return;
    }

    console.log(`Found ${companies.length} companies without logos. Updating...`);

    // Update each company with a new logo
    for (const company of companies) {
      // Fetch just the logo instead of all company data
      const logoUrl = await fetchCompanyLogo(company.name, company.site_url);

      if (!logoUrl) {
        console.log(`Could not find logo for company ${company.name}`);
        continue;
      }

      // Update the company in the database
      const { error: updateError } = await supabase
        .from('companies')
        .update({ logo_url: logoUrl })
        .eq('id', company.id);

      if (updateError) {
        console.error(`Error updating logo for company ${company.name}:`, updateError);
      } else {
        console.log(`Updated logo for company ${company.name}`);
      }
    }

    console.log('Finished updating company logos');
  } catch (error) {
    console.error('Error updating company logos:', error);
  }
}
