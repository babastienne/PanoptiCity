import { TEXTS } from "./language.js";
import { showBottomModal, updateBottomModalContent } from "./bottomModal.js";

export let displaySnackbar = (content = "") => {
  let elem = document.getElementById("snackbar");
  elem.className = "show";
  elem.innerHTML = content;
  setTimeout(function () {
    elem.className = elem.className.replace("show", "");
  }, 2950);
};

// Create some components
export let creationCameraButton = `
  <img
    src="images/contrib/add.svg"
    id="buttonAddCamera"
    title="${TEXTS.addCameraButton}"
    onclick="startCameraCreation()"
  />`;

// Handle side menu content
let fillSideMenu = () => {
  let sideMenuContent = document.getElementById("sideMenuContent");
  let menuContent = "";
  for (let entry in TEXTS.menuContent) {
    menuContent =
      menuContent +
      `
      <li class="menu__li">
        <a class="menu__item" title='${entry}' onclick="displayMenuContent('${entry}')">${entry}</a>
      </li>`;
  }
  sideMenuContent.innerHTML = menuContent;
};

let displayMenuContent = (entry) => {
  let menu = document.getElementById("menu__toggle");
  let content = `
  <div class="pico modal-div">
    <h4 class="modal-title">${entry}</h4><div class="modal-content">`;
  TEXTS.menuContent[entry].split("\n").forEach((elem, _) => {
    content = content + `<p>${elem}</p>`;
  });
  content = content + "</div></div>";
  updateBottomModalContent(content);
  menu.checked = false; // Close latteral menu before displaying the modal
  showBottomModal({
    authorizeMoveBehindModal: true,
  });
};

const initWelcomeModal = () => {
  // Check if user has already seen the modal
  if (localStorage.getItem("welcome-modal-seen") === "true") {
    return;
  }

  const modal = document.getElementById("welcome-modal");
  const understandBtn = document.getElementById("understand-button");

  modal.classList.remove("hidden");

  // Populate text
  document.getElementById("tr-welcomeTitle").innerText = TEXTS.welcomeTitle;
  document.getElementById("tr-welcomeDesc").innerText = TEXTS.welcomeDesc;
  document.getElementById("tr-welcomeStep1").innerText = TEXTS.welcomeStep1;
  document.getElementById("tr-welcomeStep2").innerText = TEXTS.welcomeStep2;
  document.getElementById("tr-welcomeStep3").innerText = TEXTS.welcomeStep3;
  understandBtn.innerText = TEXTS.welcomeButton;

  const hideModal = () => {
    modal.classList.add("hidden");
    localStorage.setItem("welcome-modal-seen", "true");
  };

  understandBtn.addEventListener("click", hideModal);
};

export let initUI = () => {
  fillSideMenu();

  initWelcomeModal();

  // Handle translations of UI
  document.title = `${TEXTS.titleApp} - ${TEXTS.teaserApp}`;
  document.getElementById("tr-titleApp").innerHTML = TEXTS.titleApp;
  document.getElementById("tr-burgerMenu").title = TEXTS.burgerMenu;
  document.getElementById("tr-themeToggle").title = TEXTS.toggleTheme;
  document.getElementById("tr-github").title = TEXTS.linkGithub;
  document.getElementById("loginButton").title = TEXTS.loginButtonTitle;
  document.getElementById("loginButton").innerHTML = TEXTS.loginButtonName;
};

// TEMPORARY: Bridge for HTML onclick attributes
window.displayMenuContent = displayMenuContent;
