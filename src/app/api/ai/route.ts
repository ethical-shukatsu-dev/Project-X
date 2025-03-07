import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

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

export async function POST(req: NextRequest) {
  const { prompt, locale = 'en', context = 'questionnaire' } = await req.json();
  
  // Load translations for the specified locale
  const translations = loadAiTranslations(locale) || loadAiTranslations('en');
  
  // Get the appropriate system prompt from translations
  const systemPrompt = translations?.systemPrompt?.[context]?.replace('{{language}}', locale === 'ja' ? '日本語' : 'English') 
    || `You are a helpful assistant. Please respond in ${locale === 'ja' ? 'Japanese' : 'English'}.`;
  
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        { role: "user", content: prompt }
      ],
      model: "gpt-3.5-turbo",
    });

    return Response.json({ 
      response: completion.choices[0].message.content 
    });
  } catch (error: unknown) {
    console.error('OpenAI API error:', error);
    const errorMessage = locale === 'ja' ? translations?.response?.error || 'エラーが発生しました' : translations?.response?.error || 'An error occurred';
    return Response.json({ 
      error: errorMessage 
    }, { status: 500 });
  }
} 