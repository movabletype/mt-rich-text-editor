import ja from "../locales/ja/translation.json";
import en from "../locales/en/translation.json";

const lexicon = {
  ja,
  en,
};

export const currentLanguage = document.querySelector("html")?.getAttribute("lang") || "";
Object.assign(
  (window as any).Lexicon,
  lexicon[currentLanguage as keyof typeof lexicon] ?? lexicon.en
);
