import { useState, useCallback } from "react";
import { translateText, getStoredTranslation, type LanguageCode } from "@/lib/translation";

export function useTranslation() {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<Record<string, string>>({});

  const translateStoryContent = useCallback(async (
    originalText: string,
    targetLanguage: LanguageCode,
    storyId?: number,
    chapterId?: number
  ): Promise<string> => {
    if (targetLanguage === 'en') {
      return originalText; // No translation needed for English
    }

    const cacheKey = `${storyId || 'temp'}-${chapterId || 'story'}-${targetLanguage}`;
    
    // Check if we already have this translation cached
    if (translatedContent[cacheKey]) {
      return translatedContent[cacheKey];
    }

    setIsTranslating(true);
    
    try {
      // Try to get stored translation first
      if (storyId) {
        const stored = await getStoredTranslation(storyId, targetLanguage, chapterId);
        if (stored) {
          setTranslatedContent(prev => ({
            ...prev,
            [cacheKey]: stored
          }));
          return stored;
        }
      }

      // If no stored translation, translate now
      const translated = await translateText({
        text: originalText,
        targetLanguage,
        storyId,
        chapterId,
      });

      setTranslatedContent(prev => ({
        ...prev,
        [cacheKey]: translated
      }));

      return translated;
    } catch (error) {
      console.error('Translation failed:', error);
      throw error;
    } finally {
      setIsTranslating(false);
    }
  }, [translatedContent]);

  const clearTranslationCache = useCallback(() => {
    setTranslatedContent({});
  }, []);

  const changeLanguage = useCallback((language: LanguageCode) => {
    setCurrentLanguage(language);
  }, []);

  return {
    currentLanguage,
    isTranslating,
    translateStoryContent,
    clearTranslationCache,
    changeLanguage,
  };
}
