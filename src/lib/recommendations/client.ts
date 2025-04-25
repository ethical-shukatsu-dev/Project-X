import { getModelForProvider, openai as openaiClient } from '../openai/config';
import { Company, UserValues } from '../supabase/client';
import { v4 as uuid } from 'uuid';
import { getOrCreateCompany } from '../companies/client';
import fs from 'fs';
import path from 'path';
import { RECOMMENDATION_COUNT } from '../constants/recommendations';

export type RecommendationResult = {
  id: string;
  company: Company;
  matching_points: string[];
  value_match_ratings?: Record<string, number>;
  strength_match_ratings?: Record<string, number>;
  value_matching_details?: Record<string, string>;
  strength_matching_details?: Record<string, string>;
  company_values?: string;
};

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
 * Stream company recommendations to the client one by one
 */
export async function streamRecommendations(
  userData: UserValues,
  locale: string = 'en',
  onRecommendation: (recommendation: RecommendationResult) => Promise<void>
): Promise<void> {
  // Load translations for the specified locale
  const translations = loadAiTranslations(locale) || loadAiTranslations('en');

  // Get the appropriate system prompt from translations
  const systemPrompt =
    translations?.systemPrompt?.recommendations?.replace(
      '{{language}}',
      locale === 'ja' ? '日本語' : 'English'
    ) ||
    `You are a helpful assistant that recommends Japanese companies to university students based on their values and interests. Please respond in ${
      locale === 'ja' ? 'Japanese' : 'English'
    }.`;

  // Add expertise in image-based value interpretation and company data analysis
  const enhancedSystemPrompt =
    systemPrompt +
    (locale === 'ja'
      ? `\n\nあなたは画像ベースの価値観評価の専門家でもあります。ユーザーが選択した画像から価値観を抽出し、
それを企業の推薦に活用できます。\n\nまた、企業データの分析の専門家でもあります。企業の公式情報（ミッション、ビジョン、価値観）だけでなく、社員レビューや実際の職場環境も考慮して、ユーザーの価値観と企業の価値観の間の真の適合性を評価してください。表面的なマッチングではなく、企業文化と実際の職場環境に基づいた深い分 析を提供してください。\n\n特に重要なのは、ユーザーの価値観と企業の価値観の間の具体的な一致点を
明確に示す ことです。この企業はあなたと同じように...という形式で、具体的な例や証拠を含めた詳細な説明を提供してください。\n\n重要: すべての出力は必ず日本語のみで提供してください。企業名や業界名も含め、
英語の単語や文を混在 させないでください。`
      : `\n\nYou are also an expert in image-based value assessment. You can extract values from images selected by users and incorporate them into company recommendations.\n\nYou are also an expert in company data analysis. Consider not just official company information (mission, vision, values) but also employee reviews and actual workplace environment to evaluate the true fit between user values and company values. Provide deep analysis based on company culture and actual workplace environment, not just surface-level matching.\n\nIt is especially important to clearly show the specific connections between the user's values and the company's values. Use a "This company, like you, values..." format and provide detailed explanations with specific examples or evidence.\n\nImportant: All output must be provided in English only. Do not mix Japanese words or sentences, including company names and industry names.`);

  // For streaming, we'll modify the prompt to instruct the model to provide recommendations one by one
  const streamingInstructions =
    locale === 'ja'
      ? '\n\n重要: 企業の推薦を1つずつ提供してください。各企業の完全な情報を提供した後、必ず 「NEXT_RECOMMENDATION」 というテキストマーカーを含めてください。これにより、スムーズなストリーミング体験が確保されます。最後の企業の後には 「END_OF_RECOMMENDATIONS」 というテキストマーカーを含めてください。各企業のJSONはマークダウンなどのフォーマットを使わずに、純粋なJSONのみを提供してください。'
      : "\n\nIMPORTANT: Provide the company recommendations one by one. After providing the complete information for each company, include the text marker 'NEXT_RECOMMENDATION'. This ensures a smooth streaming experience. After the last company, include the text marker 'END_OF_RECOMMENDATIONS'. For each company, provide pure JSON without markdown formatting or code blocks. Do not use backticks (`) or any other formatting - just provide the raw JSON.";

  const promptTemplate =
    locale === 'ja'
      ? `
    ユーザーの価値観と強みに基づいて、就職を考えている大学生に適した日本の企業${RECOMMENDATION_COUNT}社を
推薦してください。
         
    重要: すべての回答は必ず日本語のみで提供。企業名や業界名も含め、英語の単語や文を混在させないでくださ
い。
  
    ユーザーの価値観:
    ${JSON.stringify(userData.values)}

    ${
      userData.selected_image_values
        ? `
    ユーザーが選択した画像ベースの価値観:
    ${JSON.stringify(userData.selected_image_values)}
    
    これらの画像ベースの価値観は、ユーザーが視覚的に選択した価値観を表しています。テキストベースの価値観
と同様に重要視してください。                                                                                 `
        : ''
    }

    ${
      userData.strengths
        ? `
    ユーザーの強み:
    ${JSON.stringify(userData.strengths)}
    `
        : ''
    }
    
    ${
      userData.interests
        ? `
    ユーザーの興味のある業種・業界:
    ${JSON.stringify(userData.interests)}
    `
        : ''
    }
    
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
    - 「あなたの価値観に合っています」（具体的な一致点が示されていない）
    
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
    
    以下の構造でJSONフォーマットで回答してください。各企業の後に "NEXT_RECOMMENDATION" を含め、最後の企業の後に "END_OF_RECOMMENDATIONS" を含めてください: 
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
    }
    NEXT_RECOMMENDATION
    
    再度強調しますが、すべての出力は日本語のみで提供してください。JSONの形式は純粋なJSONのみを使用し、バッククォート(\`)や\`\`\`のようなコードブロック記法は使用しないでください。英語の単語や文を混在させないでください。最後の企業の後には "END_OF_RECOMMENDATIONS" を含めてください。
   `
      : `
    Based on the user's values and strengths, recommend ${RECOMMENDATION_COUNT} real companies in Japan that would be good matches for a university student seeking employment. Include both well-known and lesser-known companies.

    Important: All responses must be in English only. Do not mix Japanese words or sentences, including company names and industry names.
    
    User values:
    ${JSON.stringify(userData.values)}
    ${
      userData.selected_image_values
        ? `
    
    User's image-based values:
    ${JSON.stringify(userData.selected_image_values)}
    
    These image-based values represent the values that the user selected visually. Please consider them as important as the text-based values.
    `
        : ''
    }
    
    ${
      userData.strengths
        ? `
    User's strengths:
    ${JSON.stringify(userData.strengths)}
    `
        : ''
    }

    ${
      userData.interests
        ? `
    User's interests:
    ${JSON.stringify(userData.interests)}
    `
        : ''
    }
    
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
    
    Format as JSON for each individual company, with "NEXT_RECOMMENDATION" after each company and "END_OF_RECOMMENDATIONS" after the last one: 
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
    }
    NEXT_RECOMMENDATION
    
    To emphasize again, all output must be in English only. Do not use markdown formatting, code blocks with \`\`\`, or backticks (\`) - provide pure JSON only. Do not mix Japanese words or sentences. After the last company, include "END_OF_RECOMMENDATIONS".
    `;

  try {
    console.log('Starting OpenAI streaming request...');
    const response = await openaiClient.chat.completions.create({
      model: getModelForProvider(openaiClient),
      messages: [
        {
          role: 'system',
          content: enhancedSystemPrompt + streamingInstructions,
        },
        { role: 'user', content: promptTemplate },
      ],
      stream: true,
      // temperature: 0.7, // Adding temperature to control randomness
      // max_tokens: 4000, // Ensure we have enough tokens for the response
    });

    let currentJson = '';
    let recommendationsProcessed = 0;

    console.log('Stream connected, awaiting chunks...');

    for await (const chunk of response) {
      const content = chunk.choices[0]?.delta?.content || '';
      console.log('LOOK HERE:', chunk);
      if (content) {
        currentJson += content;
        console.log('Received chunk:', content);

        // Check if we've reached a marker for the next recommendation
        if (currentJson.includes('NEXT_RECOMMENDATION')) {
          console.log('Found NEXT_RECOMMENDATION marker');
          // Extract the JSON part before the marker
          const jsonPart = currentJson.split('NEXT_RECOMMENDATION')[0].trim();
          currentJson = currentJson.split('NEXT_RECOMMENDATION')[1] || '';
          console.log('JSON part to parse:', jsonPart.substring(0, 100) + '...');
          console.log('Full JSON to parse:', jsonPart);

          try {
            // Clean the JSON string - remove markdown formatting characters and ensure valid JSON
            const cleanedJsonPart = jsonPart
              .replace(/```json/g, '') // Remove JSON code block markers
              .replace(/```/g, '') // Remove any remaining code block markers
              .replace(/`/g, '') // Remove backticks
              .trim();

            console.log('Cleaned JSON:', cleanedJsonPart.substring(0, 100) + '...');

            // Only try to parse if the string looks like valid JSON
            if (cleanedJsonPart.startsWith('{') && cleanedJsonPart.includes('}')) {
              // Try to parse the JSON
              console.log('Attempting to parse JSON...');
              const recommendationData = JSON.parse(cleanedJsonPart) as OpenAIRecommendation;
              console.log('Successfully parsed JSON:', recommendationData.name);

              // Only proceed if we have valid required data
              if (recommendationData && recommendationData.name && recommendationData.industry) {
                console.log('Creating company from recommendation:', recommendationData.name);
                // Create a company from the recommendation
                const company = await getOrCreateCompany(
                  recommendationData.name,
                  recommendationData.industry,
                  locale
                );
                console.log('Company created:', company.name);

                // Create the recommendation result
                const recommendationResult: RecommendationResult = {
                  id: recommendationData.id || uuid(),
                  company,
                  matching_points: recommendationData.matching_points || [],
                  value_match_ratings: recommendationData.value_match_ratings,
                  strength_match_ratings: recommendationData.strength_match_ratings,
                  value_matching_details: recommendationData.value_matching_details,
                  strength_matching_details: recommendationData.strength_matching_details,
                  company_values: recommendationData.company_values,
                };

                // Send the recommendation to the callback
                console.log('Sending recommendation to callback...');
                await onRecommendation(recommendationResult);
                console.log('Recommendation sent to callback successfully');
                recommendationsProcessed++;
                console.log(`Processed ${recommendationsProcessed} recommendations so far`);

                // If we've reached the desired number of recommendations, we can stop
                if (recommendationsProcessed >= RECOMMENDATION_COUNT) {
                  console.log(
                    `Reached target of ${RECOMMENDATION_COUNT} recommendations, stopping stream`
                  );
                  break;
                }
              } else {
                console.warn('Parsed JSON is missing required fields:', recommendationData);
              }
            } else {
              console.warn(
                "JSON doesn't appear to be valid:",
                cleanedJsonPart.substring(0, 100) + '...'
              );

              // Try a more aggressive approach to extract valid JSON
              try {
                // Look for anything that starts with { and ends with }
                const jsonMatch = cleanedJsonPart.match(/\{[\s\S]*\}/);
                if (jsonMatch && jsonMatch[0]) {
                  const extractedJson = jsonMatch[0];
                  console.log(
                    'Attempting fallback JSON extraction with regex:',
                    extractedJson.substring(0, 100) + '...'
                  );
                  const fallbackData = JSON.parse(extractedJson) as OpenAIRecommendation;

                  // Only proceed if we have valid required data
                  if (fallbackData && fallbackData.name && fallbackData.industry) {
                    console.log(
                      'Successfully extracted JSON with fallback method:',
                      fallbackData.name
                    );

                    // Create a company from the recommendation
                    const company = await getOrCreateCompany(
                      fallbackData.name,
                      fallbackData.industry,
                      locale
                    );

                    // Create the recommendation result
                    const recommendationResult: RecommendationResult = {
                      id: fallbackData.id || uuid(),
                      company,
                      matching_points: fallbackData.matching_points || [],
                      value_match_ratings: fallbackData.value_match_ratings,
                      strength_match_ratings: fallbackData.strength_match_ratings,
                      value_matching_details: fallbackData.value_matching_details,
                      strength_matching_details: fallbackData.strength_matching_details,
                      company_values: fallbackData.company_values,
                    };

                    // Send the recommendation to the callback
                    console.log('Sending fallback recommendation to callback...');
                    await onRecommendation(recommendationResult);
                    console.log('Fallback recommendation sent successfully');
                    recommendationsProcessed++;
                    console.log(`Processed ${recommendationsProcessed} recommendations so far`);

                    // If we've reached the desired number of recommendations, we can stop
                    if (recommendationsProcessed >= RECOMMENDATION_COUNT) {
                      console.log(
                        `Reached target of ${RECOMMENDATION_COUNT} recommendations, stopping stream`
                      );
                      break;
                    }
                  }
                }
              } catch (fallbackError) {
                console.error('Fallback JSON extraction also failed:', fallbackError);
              }
            }
          } catch (error) {
            console.error('Error parsing recommendation JSON:', error);
            console.error('Raw JSON that failed parsing:', jsonPart);
            // Continue to collect more content if the JSON is incomplete
          }
        }

        // Check if we've reached the end marker
        if (currentJson.includes('END_OF_RECOMMENDATIONS')) {
          console.log('Found END_OF_RECOMMENDATIONS marker, ending stream');
          break;
        }
      }

      console.log(
        'Current accumulated JSON:',
        currentJson.substring(0, 100) + (currentJson.length > 100 ? '...' : '')
      );
    }

    console.log(`Stream completed. Processed ${recommendationsProcessed} recommendations total.`);
  } catch (error) {
    console.error('Error streaming recommendations:', error);
    throw new Error('Failed to stream recommendations');
  }
}
