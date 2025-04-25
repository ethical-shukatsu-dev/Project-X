# AI Provider System

This system allows you to seamlessly use either OpenAI or Gemini API through a unified interface. It automatically selects the appropriate provider based on your available API keys.

## Features

- Automatic provider selection based on available API keys
- Unified interface through the OpenAI SDK for both providers
- Compatible with both client and server components

## How It Works

The system automatically detects which API keys are available in your environment variables:

1. If `GOOGLE_API_KEY` is available and not empty, the system will use the Gemini API
2. Otherwise, it will default to using OpenAI with the `OPENAI_API_KEY`

## Usage

### In Client or Server Components

```tsx
import { openai } from '@/lib/openai/config';
import OpenAI from 'openai';

// Helper function to determine appropriate model
function getModelForProvider(
  client: OpenAI,
  openaiModel = 'gpt-4o',
  geminiModel = 'gemini-2.0-flash'
) {
  // Type-safe access to baseURL property
  const baseURL = (client as unknown as { baseURL?: string }).baseURL;
  const isGemini = baseURL?.includes('generativelanguage.googleapis.com');
  return isGemini ? geminiModel : openaiModel;
}

async function callAI(prompt: string) {
  // The client is pre-configured to use the correct API
  const completion = await openai.chat.completions.create({
    // Use the helper function to select the appropriate model
    model: getModelForProvider(openai),
    messages: [{ role: 'user', content: prompt }],
  });

  return completion.choices[0]?.message?.content || 'No response';
}
```

### In API Routes

```tsx
import { openai } from '@/lib/openai/config';
import OpenAI from 'openai';

// Helper function to determine appropriate model
function getModelForProvider(
  client: OpenAI,
  openaiModel = 'gpt-4o',
  geminiModel = 'gemini-2.0-flash'
) {
  // Type-safe access to baseURL property
  const baseURL = (client as unknown as { baseURL?: string }).baseURL;
  const isGemini = baseURL?.includes('generativelanguage.googleapis.com');
  return isGemini ? geminiModel : openaiModel;
}

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const completion = await openai.chat.completions.create({
    model: getModelForProvider(openai),
    messages: [{ role: 'user', content: prompt }],
  });

  return Response.json({
    content: completion.choices[0]?.message?.content,
  });
}
```

## Configuration

Set your API keys in your `.env.local` file:

```
# OpenAI API Key (used if GOOGLE_API_KEY is not available)
OPENAI_API_KEY=sk-xxxx

# Google API Key for Gemini (if available, this will be used)
GOOGLE_API_KEY=AIzaxx
```
