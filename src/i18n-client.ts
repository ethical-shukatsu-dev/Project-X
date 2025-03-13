'use client';

import { useEffect, useState } from 'react';
import i18next from 'i18next';
import { initReactI18next, useTranslation as useTranslationOrg } from 'react-i18next';
import { getOptions } from './i18n-config';

// Initialize i18next for client-side
i18next
  .use(initReactI18next)
  .init({
    ...getOptions(),
    lng: undefined, // Let detect the language on client side
    detection: {
      order: ['path', 'htmlTag', 'cookie', 'navigator'],
    },
    fallbackLng: 'ja', // Ensure there's always a fallback
  });

// Load resources on demand
const loadLocaleAsync = async (language: string, namespace: string) => {
  try {
    const response = await fetch(`/locales/${language}/${namespace}.json`);
    
    // Check if the response is ok before trying to parse JSON
    if (!response.ok) {
      console.warn(`Translation file for ${language}/${namespace} not found. Status: ${response.status}`);
      // Add an empty resource bundle to prevent repeated failed requests
      i18next.addResourceBundle(language, namespace, {});
      return {};
    }
    
    const data = await response.json();
    i18next.addResourceBundle(language, namespace, data);
    return data;
  } catch (error) {
    console.error(`Failed to load ${language}/${namespace}`, error);
    // Add an empty resource bundle to prevent repeated failed requests
    i18next.addResourceBundle(language, namespace, {});
    return {};
  }
};

export function useTranslation(lng: string, ns: string, options: { keyPrefix?: string } = {}) {
  const [loaded, setLoaded] = useState(false);
  
  const ret = useTranslationOrg(ns, options);
  const { i18n } = ret;

  useEffect(() => {
    // Reset loaded state when dependencies change
    setLoaded(false);
    
    const handleChange = async () => {
      // Always check if we need to load the resource bundle
      if (!i18n.hasResourceBundle(lng, ns)) {
        await loadLocaleAsync(lng, ns);
      }
      
      // Only change language if it's different
      if (i18n.resolvedLanguage !== lng) {
        i18n.changeLanguage(lng);
      }
      
      // Always set loaded to true after processing
      setLoaded(true);
    };

    handleChange();
  }, [lng, ns, i18n]);

  return {
    ...ret,
    loaded,
  };
} 