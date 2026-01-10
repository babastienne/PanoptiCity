import { TEXTS } from "../language.js";
import { OSMLogin, OSMLogout } from "../osm.js"; // Adjust based on your osm logic export

const authPopup = document.getElementById("auth-popup");

/**
 * Updates the UI state and behavior of the Auth system
 * @param {boolean} userIsConnected
 * @param {string|null} username
 */
export const initAuthUI = (userIsConnected, username = "") => {
  const updateTriggerStyle = () => {
    document.querySelectorAll(".auth-trigger").forEach((btn) => {
      // Icon stays the same
      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      `;
      // Update color based on connection
      if (userIsConnected) {
        btn.style.color = "var(--pico-primary)";
      } else {
        btn.style.color = "var(--pico-muted-color)";
      }

      btn.onclick = (e) => {
        e.preventDefault();
        renderAuthPopup();
      };
    });
  };

  const renderAuthPopup = () => {
    const title = document.getElementById("auth-popup-title");
    const body = document.getElementById("auth-popup-content");
    const footer = document.getElementById("auth-popup-footer");

    footer.innerHTML = ""; // Clear old buttons

    if (!userIsConnected) {
      // --- LOGGED OUT VIEW ---
      title.innerText = TEXTS.authAccountTitle;
      body.innerHTML = `
        <p><strong>${TEXTS.authHelpNeeded} 🗺️</strong></p>
        <p>${TEXTS.authLoginMsg}</p>
        <p>${TEXTS.authPrivacyNotice}</p>
      `;

      const loginBtn = document.createElement("button");
      loginBtn.innerText = TEXTS.loginBtn;
      loginBtn.className = "primary";
      loginBtn.onclick = () => {
        OSMLogin(); // Trigger the logic in osm.js
        authPopup.classList.add("hidden");
      };
      const registerBtn = document.createElement("button");
      registerBtn.innerText = TEXTS.registerBtn;
      registerBtn.className = "contrast";
      registerBtn.onclick = () => {
        window.open("https://www.openstreetmap.org/user/new", "_blank"); // Open OSM registration
        authPopup.classList.add("hidden");
      };
      footer.appendChild(registerBtn);
      footer.appendChild(loginBtn);
    } else {
      // --- LOGGED IN VIEW ---
      title.innerText = TEXTS.authAccountTitle;
      body.innerHTML = `<p>${TEXTS.authConnectedAs} <strong>${username}</strong></p>`;

      const profileBtn = document.createElement("a");
      profileBtn.href = `https://www.openstreetmap.org/user/${username}`;
      profileBtn.target = "_blank";
      profileBtn.role = "button";
      profileBtn.className = "outline";
      profileBtn.innerText = TEXTS.authGoToProfile;
      footer.appendChild(profileBtn);

      const logoutBtn = document.createElement("button");
      logoutBtn.innerText = TEXTS.logoutBtn;
      logoutBtn.className = "secondary outline";
      logoutBtn.onclick = () => {
        OSMLogout();
        authPopup.classList.add("hidden");
      };
      footer.appendChild(logoutBtn);
    }

    authPopup.classList.remove("hidden");
  };

  // Close popup logic
  document.getElementById("close-auth-popup").onclick = () => authPopup.classList.add("hidden");

  // Initialize styles
  updateTriggerStyle();
};
