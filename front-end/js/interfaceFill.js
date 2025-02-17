function displaySnackbar(content = "") {
  let elem = document.getElementById("snackbar");
  elem.className = "show";
  elem.innerHTML = content;
  setTimeout(function () {
    elem.className = elem.className.replace("show", "");
  }, 2950);
}

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

// Handle side menu content
let menuItems = [
  {
    name: TEXTS.aboutThisSiteTitle,
    content: TEXTS.aboutThisSiteContent,
  },
  {
    name: TEXTS.whyThisNameTitle,
    content: TEXTS.whyThisNameContent,
  },
];

fillSideMenu = () => {
  let sideMenuContent = document.getElementById("sideMenuContent");
  let menuContent = "";
  menuItems.forEach((elem, n) => {
    menuContent =
      menuContent +
      `
      <li class="menu__li">
        <a class="menu__item" title=${elem.name} onclick="displayMenuContent(${n})">${elem.name}</a>
      </li>`;
  });
  sideMenuContent.innerHTML = menuContent;
};

displayMenuContent = (n) => {
  let content = `
  <div class="pico modal-div">
    <h4 class="modal-title">${menuItems[n].name}</h4><div class="modal-content">`;
  menuItems[n].content.split("\n").forEach((elem, _) => {
    content = content + `<p>${elem}</p>`;
  });
  content = content + "</div></div>";
  updateBottomModalContent(content);
  showBottomModal();
};

fillSideMenu();

// Handle translations of UI
document.title = `${TEXTS.titleApp} - ${TEXTS.teaserApp}`;
document.getElementById("tr-titleApp").innerHTML = TEXTS.titleApp;
document.getElementById("tr-burgerMenu").title = TEXTS.burgerMenu;
document.getElementById("tr-themeToggle").title = TEXTS.toggleTheme;
document.getElementById("tr-github").title = TEXTS.linkGithub;
document.getElementById("loginButton").title = TEXTS.loginButtonTitle;
document.getElementById("loginButton").innerHTML = TEXTS.loginButtonName;
