import { startTransition } from "react";
import { useTranslation } from "react-i18next";

import { LANGUAGE_STORAGE_KEY } from "../lib/i18n";

const languages = ["en", "hi", "ur"];

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  return (
    <label className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 shadow-sm">
      <span>{t("navigation.language")}</span>
      <select
        className="bg-transparent text-sm outline-none"
        value={i18n.language}
        onChange={(event) => {
          const nextLanguage = event.target.value;
          localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
          startTransition(() => {
            i18n.changeLanguage(nextLanguage);
          });
        }}
      >
        {languages.map((language) => (
          <option key={language} value={language}>
            {t(`languages.${language}`)}
          </option>
        ))}
      </select>
    </label>
  );
};

export default LanguageSwitcher;

