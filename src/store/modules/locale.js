const supportedLanguages = ["en", "fr"];
const MASTER_LANGUAGE = "en";
const userLanguages = window.navigator.languages;
let usedLanguage = null;

for (let lang of userLanguages) {
  if (supportedLanguages.includes(lang)) {
    console.log(`setting to ${lang} locale`);
    usedLanguage = lang; // use first fully supported locale found in the user's browser's settings
    break;
  }
}
if (usedLanguage === null) {
  for (let lang of userLanguages) {
    if (supportedLanguages.includes(lang.substring(0, 2))) {
      console.log(`setting to ${lang.substring(0, 2)} language`);
      usedLanguage = lang.substring(0, 2); // use first supported language found in the user's browser's settings
      break;
    }
  }
}
if (!usedLanguage) {
  usedLanguage = MASTER_LANGUAGE; // set to master language if no language is supported by both the user and the application
}

export const locale = require(`../locale/${usedLanguage}/ui.json`);
export const rolesJSON = require(`../locale/${usedLanguage}/roles.json`);
export const jinxesJSON = require(`../locale/${usedLanguage}/hatred.json`);
export const fabledJSON = require(`../locale/${usedLanguage}/fabled.json`);
export const editionJSON = require(`../locale/${usedLanguage}/editions.json`);
