// From under this line do not modify the file
let getUserLang = () => {
  let [userLang] = navigator.language.split("-");
  if (!Object.keys(translatedTexts).includes(userLang)) {
    userLang = "en";
  }
  return userLang;
};

const TEXTS = translatedTexts[getUserLang()];

document.title = `${TEXTS.titleApp} - ${TEXTS.teaserApp}`;
document.getElementById("tr-titleApp").innerHTML = TEXTS.titleApp;
document.getElementById("tr-burgerMenu").title = TEXTS.burgerMenu;
document.getElementById("tr-themeToggle").title = TEXTS.toggleTheme;
document.getElementById("tr-github").title = TEXTS.linkGithub;
document.getElementById("loginButton").title = TEXTS.loginButtonTitle;
document.getElementById("loginButton").innerHTML = TEXTS.loginButtonName;
