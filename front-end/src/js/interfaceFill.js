import { TEXTS } from "./language.js";
import { showBottomModal, updateBottomModalContent } from "./bottomModal.js";
import { OSMLogin } from "./osm.js";

export let displaySnackbar = (content = "") => {
  let elem = document.getElementById("snackbar");
  elem.className = "show";
  elem.innerHTML = content;
  setTimeout(function () {
    elem.className = elem.className.replace("show", "");
  }, 2950);
};

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

  modal.classList.remove("hidden");

  const hideModal = () => {
    modal.classList.add("hidden");
    localStorage.setItem("welcome-modal-seen", "true");
  };

  document.getElementById("understand-button").addEventListener("click", hideModal);
  document.getElementById("close-welcome").addEventListener("click", hideModal);
};

export let showLoginModal = () => {
  const inviteModal = document.getElementById("login-invite-modal");
  inviteModal.classList.remove("hidden");

  document.getElementById("login-osm-button").onclick = () => {
    inviteModal.classList.add("hidden");
    OSMLogin();
    clearModalActiveStates();
  };

  document.getElementById("close-invite").onclick = () => {
    inviteModal.classList.add("hidden");
    clearModalActiveStates();
  };
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
  document.getElementById("tr-welcomeTitle").innerText = TEXTS.welcomeTitle;
  document.getElementById("tr-welcomeDesc").innerText = TEXTS.welcomeDesc;
  document.getElementById("tr-welcomeStep1").innerText = TEXTS.welcomeStep1;
  document.getElementById("tr-welcomeStep2").innerText = TEXTS.welcomeStep2;
  document.getElementById("tr-welcomeStep3").innerText = TEXTS.welcomeStep3;
  document.getElementById("understand-button").innerText = TEXTS.welcomeButton;
  document.getElementById("understand-button").title = TEXTS.welcomeButton;
  document.getElementById("tr-inviteTitle").innerText = TEXTS.inviteTitle;
  document.getElementById("tr-inviteDesc").innerText = TEXTS.inviteDesc;
  document.getElementById("login-osm-button").innerText = TEXTS.loginButtonName;
  document.getElementById("login-osm-button").title = TEXTS.loginButtonTitle;
  // document.getElementById("buttonAddCamera").title = TEXTS.addCameraButton;
  // --- Sidebar tooltips ---
  const btnLocate = document.getElementById("btn-locate");
  btnLocate.title = TEXTS.mapLocateButton;
  btnLocate.setAttribute("data-tooltip", TEXTS.mapLocateButton);

  const btnAddCamera = document.getElementById("btn-add-camera");
  btnAddCamera.title = TEXTS.addCameraButton;
  btnAddCamera.setAttribute("data-tooltip", TEXTS.addCameraButton);

  const btnLayers = document.getElementById("btn-layers");
  btnLayers.title = TEXTS.tooltipLayers;
  btnLayers.setAttribute("data-tooltip", TEXTS.tooltipLayers);

  const btnScenario = document.getElementById("btn-scenario");
  btnScenario.title = TEXTS.tooltipScenario;
  btnScenario.setAttribute("data-tooltip", TEXTS.tooltipScenario);

  const btnLegend = document.getElementById("btn-legend");
  btnLegend.title = TEXTS.tooltipLegend;
  btnLegend.setAttribute("data-tooltip", TEXTS.tooltipLegend);
};

// TEMPORARY: Bridge for HTML onclick attributes
window.displayMenuContent = displayMenuContent;
