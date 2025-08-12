/* eslint-disable @typescript-eslint/no-explicit-any */
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

type TFunction = {
  (strings: TemplateStringsArray | string, ...values: any[]): string;
  (string: string): string;
};

export const t: TFunction = ((...args: any[]) => {
  if (typeof args[0] === "string") {
    return i18n.t(...(args as any));
  } else {
    let res = "";
    const [strings, ...values] = args;
    for (let i = 0; i < strings.length; i++) {
      res += strings[i] + i18n.t(values[i]);
    }
    return res;
  }
}) as any;
