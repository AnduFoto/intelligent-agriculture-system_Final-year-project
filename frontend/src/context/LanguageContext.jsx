import React, { createContext, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    // Optionally set document direction if supporting RTL languages later
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <LanguageContext.Provider value={{ language: i18n.language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
