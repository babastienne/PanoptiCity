let getUserLang = () => {
  let [userLang] = navigator.language.split("-");
  if (!Object.keys(translatedTexts).includes(userLang)) {
    userLang = "en";
  }
  return userLang;
};

const TEXTS = translatedTexts[getUserLang()];

// Create some components
var creationCameraButton = `
  <img
    src="images/contrib/add.svg"
    id="buttonAddCamera"
    title="${TEXTS.addCameraButton}"
    onclick="startCameraCreation()"
  />`;

// Handle translations of UI
document.title = `${TEXTS.titleApp} - ${TEXTS.teaserApp}`;
document.getElementById("tr-titleApp").innerHTML = TEXTS.titleApp;
document.getElementById("tr-burgerMenu").title = TEXTS.burgerMenu;
document.getElementById("tr-themeToggle").title = TEXTS.toggleTheme;
document.getElementById("tr-github").title = TEXTS.linkGithub;
document.getElementById("loginButton").title = TEXTS.loginButtonTitle;
document.getElementById("loginButton").innerHTML = TEXTS.loginButtonName;
