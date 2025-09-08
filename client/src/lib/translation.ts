import { apiRequest } from "./queryClient";

export interface TranslationRequest {
  text: string;
  targetLanguage: string;
  storyId?: number;
  chapterId?: number;
}

export interface TranslationResponse {
  translatedText: string;
}

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
  { code: 'nso', name: 'Sepedi', flag: '🇿🇦' },
  { code: 'st', name: 'Sesotho', flag: '🇱🇸' },
  { code: 'tn', name: 'Setswana', flag: '🇧🇼' },
  { code: 've', name: 'Venda', flag: '🇿🇦' },
  { code: 'ts', name: 'Tsonga', flag: '🇿🇦' },
  { code: 'zu', name: 'Zulu', flag: '🇿🇦' },
  { code: 'xh', name: 'Xhosa', flag: '🇿🇦' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'zh', name: 'Chinese (Mandarin)', flag: '🇨🇳' },
] as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];

export async function translateText(request: TranslationRequest): Promise<string> {
  const response = await apiRequest('POST', '/api/translate', request);
  const data: TranslationResponse = await response.json();
  return data.translatedText;
}

export async function getStoredTranslation(storyId: number, language: string, chapterId?: number): Promise<string | null> {
  try {
    const url = `/api/stories/${storyId}/translations/${language}${chapterId ? `?chapterId=${chapterId}` : ''}`;
    const response = await apiRequest('GET', url);
    const translation = await response.json();
    return translation.translatedContent;
  } catch (error) {
    return null;
  }
}

export function getLanguageInfo(code: string) {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
}
