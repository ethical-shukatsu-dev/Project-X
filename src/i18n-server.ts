import fs from 'fs';
import path from 'path';

// Function to load resources from file system (server-side only)
const loadLocaleSync = (language: string, namespace: string) => {
  try {
    const filePath = path.join(process.cwd(), 'public', 'locales', language, `${namespace}.json`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Failed to load ${language}/${namespace}`, error);
    return {};
  }
};

// Simple translation function for server components
export async function getTranslation(
  lng: string,
  ns: string,
  options: { keyPrefix?: string } = {}
) {
  // Load translations directly without i18next in server components
  const translations = loadLocaleSync(lng, ns);

  // Simple translation function
  const t = (key: string) => {
    // Handle nested keys (e.g., 'homepage.title')
    const keyParts = key.split('.');
    let result = translations;

    // Apply keyPrefix if provided
    if (options.keyPrefix) {
      const prefixParts = options.keyPrefix.split('.');
      keyParts.unshift(...prefixParts);
    }

    // Navigate through the nested objects
    for (const part of keyParts) {
      if (result && typeof result === 'object' && part in result) {
        result = result[part];
      } else {
        // Key not found
        return key; // Return the key itself as fallback
      }
    }

    return typeof result === 'string' ? result : key;
  };

  return {
    t,
    // Provide a minimal i18n-like interface for compatibility
    i18n: {
      language: lng,
      changeLanguage: () => Promise.resolve(),
      t,
    },
  };
}
