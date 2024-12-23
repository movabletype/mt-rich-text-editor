import i18next from "i18next";
import i18n from "i18next";
import ja from "../locales/ja/translation.json";
import en from "../locales/en/translation.json";

i18next.init({
  fallbackLng: "en",
  resources: {
    ja: {
      translation: ja,
    },
    en: {
      translation: en,
    },
  },
});

export default i18n;
export function t(args: string | string[], params?: Record<string, unknown>): string {
  return i18n.t(args, params);
}
