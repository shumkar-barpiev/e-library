import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import kgTranslations from "@/locales/kg/translation.json";
import ruTranslations from "@/locales/ru/translation.json";
import LanguageDetector from "i18next-browser-languagedetector";

if (typeof window !== "undefined") {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        kg: { translation: kgTranslations },
        ru: { translation: ruTranslations },
      },
      fallbackLng: "ru",
      supportedLngs: ["kg", "ru"],
      nonExplicitSupportedLngs: true,
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ["localStorage", "navigator"],
        caches: ["localStorage"],
      },
    });
}

export default i18n;
