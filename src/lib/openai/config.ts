import OpenAI from 'openai';

// Determine which API to use based on available API keys
function determineApiProvider(): 'openai' | 'gemini' {
  // If GOOGLE_API_KEY is set and valid, use Gemini
  // if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY.trim() !== '') {
  //   return 'gemini';
  // }
  // Otherwise default to OpenAI
  return 'openai';
}

// Create an OpenAI client using the appropriate API
export function createOpenAIClient() {
  const provider = determineApiProvider();

  if (provider === 'gemini') {
    return new OpenAI({
      apiKey: process.env.GOOGLE_API_KEY,
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    });
  } else {
    return new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
}

// Initialize the default OpenAI client
export const openai = createOpenAIClient();

// Helper function to get the appropriate model based on which provider is being used
export function getModelForProvider(
  client: OpenAI,
  openaiModel = 'gpt-4o',
  geminiModel = 'gemini-2.0-flash'
) {
  // Use optional chaining and type assertion for accessing baseURL which is a private property
  const baseURL = client.baseURL;
  const isGemini = baseURL?.includes('generativelanguage.googleapis.com');
  console.log('isGemini', isGemini);
  return isGemini ? geminiModel : openaiModel;
}
