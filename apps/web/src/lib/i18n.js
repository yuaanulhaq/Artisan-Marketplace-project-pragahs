import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "../locales/en.json";
import hi from "../locales/hi.json";
import ur from "../locales/ur.json";

export const LANGUAGE_STORAGE_KEY = "artisan-marketplace-language";
export const RTL_LANGUAGES = ["ur"];

export const isLanguageRTL = (language) => RTL_LANGUAGES.includes(language);

const defaultLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) || "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    ur: { translation: ur }
  },
  lng: defaultLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false
  }
});

export default i18n;

