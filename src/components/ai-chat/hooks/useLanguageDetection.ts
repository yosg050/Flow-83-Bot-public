import { useState } from 'react';

export const useLanguageDetection = () => {
  const [detectedLanguage, setDetectedLanguage] = useState<string>('en');

  // Enhanced language detection based on input text
  const updateLanguage = (text: string): string => {
    // Check for Hebrew characters
    const hebrewPattern = /[\u0590-\u05FF]/;
    if (hebrewPattern.test(text)) {
      setDetectedLanguage('he');
      return 'he';
    }
    
    // Check for Arabic characters
    const arabicPattern = /[\u0600-\u06FF]/;
    if (arabicPattern.test(text)) {
      setDetectedLanguage('ar');
      return 'ar';
    }
    
    // Check for Russian characters
    const russianPattern = /[\u0400-\u04FF]/;
    if (russianPattern.test(text)) {
      setDetectedLanguage('ru');
      return 'ru';
    }

    // Check for Spanish common words and characters
    const spanishPattern = /(\b(hola|gracias|como|está|buenos|días|qué|por|favor)\b)|[áéíóúüñ¿¡]/i;
    if (spanishPattern.test(text)) {
      setDetectedLanguage('es');
      return 'es';
    }

    // Check for French common words and characters
    const frenchPattern = /(\b(bonjour|merci|comment|ça va|salut|oui|non|je|tu|nous|vous)\b)|[àâäæçéèêëîïôœùûüÿ]/i;
    if (frenchPattern.test(text)) {
      setDetectedLanguage('fr');
      return 'fr';
    }
    
    // Default to English or keep previous detection
    return detectedLanguage || 'en';
  };

  // Get follow-up message based on detected language
  const getFollowUpMessage = (userName?: string): string => {
    const personalization = userName ? `${userName}, ` : '';
  
    
    // Get messages for the detected language or fall back to English
    const messages =
      "I'm here with you in this moment. Is there anything else stirring within you that you'd like to explore?";
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return {
    detectedLanguage,
    updateLanguage,
    getFollowUpMessage
  };
};
