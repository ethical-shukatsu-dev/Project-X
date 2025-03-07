# Internationalization (i18n) in Project X

This project uses next-i18next to support multiple languages. Currently, the application supports:

- English (en)
- Japanese (ja)

## How It Works

The i18n implementation in this project follows these principles:

1. **URL-based Routing**: Each language has its own URL path (e.g., `/en/about`, `/ja/about`).
2. **Automatic Language Detection**: The middleware detects the user's preferred language and redirects accordingly.
3. **Server and Client Components**: Both server and client components can use translations.
4. **AI Responses**: AI responses are generated in the user's selected language.

## Directory Structure

```
public/
  locales/
    en/
      common.json    # General UI translations
      ai.json        # AI-related translations
    ja/
      common.json    # Japanese general UI translations
      ai.json        # Japanese AI-related translations
src/
  i18n-config.ts     # Configuration for i18n
  i18n-server.ts     # Server-side translation utility
  i18n-client.ts     # Client-side translation utility
  middleware.ts      # Language detection and routing
```

## How to Use Translations

### In Server Components

```tsx
import { getTranslation } from '@/i18n-server';

export default async function MyServerComponent({
  params: { lng }
}: {
  params: { lng: string }
}) {
  const { t } = await getTranslation(lng, 'common');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

### In Client Components

```tsx
'use client';

import { useTranslation } from '@/i18n-client';

export default function MyClientComponent({
  lng
}: {
  lng: string;
}) {
  const { t, loaded } = useTranslation(lng, 'common');

  // Show loading state while translations are being loaded
  if (!loaded) return <div>Loading...</div>;

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

### In API Routes

```tsx
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { locale = 'en' } = await req.json();
  
  // Use locale to determine response language
  const message = locale === 'ja' 
    ? 'こんにちは、世界！' 
    : 'Hello, world!';
  
  return Response.json({ message });
}
```

## Adding a New Language

To add a new language (e.g., French):

1. Add the language code to the `languages` array in `src/i18n-config.ts`:

```ts
export const languages = ['en', 'ja', 'fr'];
```

2. Create new translation files:

```
public/locales/fr/common.json
public/locales/fr/ai.json
```

3. Add translations to these files following the same structure as the existing files.

## Language Switching

The `LanguageSwitcher` component allows users to switch between languages. It's included in the main layout and automatically updates the URL to reflect the selected language.

## AI Responses

When making API calls to generate AI responses, include the current locale:

```tsx
const response = await fetch('/api/ai', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: userInput,
    locale: currentLanguage,
    context: 'questionnaire' // or 'recommendations'
  }),
});
```

The API will use the appropriate system prompt from the translations and generate responses in the specified language.

## Best Practices

1. **Use Namespaces**: Organize translations into logical namespaces (e.g., 'common', 'ai').
2. **Use Translation Keys**: Use descriptive, hierarchical keys (e.g., 'homepage.title').
3. **Handle Loading States**: Always handle loading states in client components.
4. **Interpolation**: Use variables in translations with double curly braces (e.g., `{{variable}}`).
5. **Pluralization**: Use plural forms when needed (see i18next documentation).

## Troubleshooting

- If translations aren't loading, check the network tab to ensure the JSON files are being fetched correctly.
- If the middleware isn't redirecting correctly, check the matcher configuration in `middleware.ts`.
- For client components, ensure you're passing the language code as a prop. 