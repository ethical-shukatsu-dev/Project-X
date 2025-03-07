import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getOptions } from './i18n-config';

// Function to load resources dynamically
const loadResources = (language: string, namespace: string) => {
  try {
    // For server-side
    if (typeof window === 'undefined') {
      return import(`../public/locales/${language}/${namespace}.json`);
    }
    // For client-side
    return fetch(`/locales/${language}/${namespace}.json`).then(res => res.json());
  } catch (error) {
    console.error(`Failed to load ${language}/${namespace}`, error);
    return {};
  }
};

const initI18next = async (lng: string, ns: string) => {
  const i18nInstance = createInstance();
  await i18nInstance
    .use(initReactI18next)
    .init({
      ...getOptions(lng, ns),
      resources: {
        [lng]: {
          [ns]: await loadResources(lng, ns)
        }
      }
    });
  return i18nInstance;
};

export async function useTranslation(lng: string, ns: string, options: { keyPrefix?: string } = {}) {
  const i18nextInstance = await initI18next(lng, ns);
  return {
    t: i18nextInstance.getFixedT(lng, ns, options.keyPrefix),
    i18n: i18nextInstance
  };
} 