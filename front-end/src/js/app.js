import { TEXTS } from "./language.js";
import { OSM_API_URL } from "../../CONFIG.js";
import { initUI } from "./interfaceFill.js";
import { initMap } from "./map.js";
import { initCamera } from "./camera.js";
import { checkIfUserConnected } from "./osm.js";
import { initTheme } from "./theme-switcher.js";
import { initModal } from "./bottomModal.js";
import { initContrib } from "./contrib.js";

// Initialize everything when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Fill UI (+ translations)
  initUI();
  // Init map
  const map = initMap();
  // Init cameras
  initCamera(map);
  // Init theme switcher
  //   themeSwitcher.init(map);
  initTheme();

  // Init modal
  initModal(map);
  // Init OSM Link
  OSM.configure({ apiUrl: OSM_API_URL });
  checkIfUserConnected();
  // Init contrib with map
  initContrib(map);
});
