import { TRANSLATIONS } from "../../translations.js";

// TODO: Check if other language in url to override navigator language ?
export let getUserLang = () => {
  let [userLang] = navigator.language.split("-");
  if (!Object.keys(TRANSLATIONS).includes(userLang)) {
    userLang = "en";
  }
  return userLang;
};

export const TEXTS = TRANSLATIONS[getUserLang()];
