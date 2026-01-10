import { BASE_URL_API } from "../../CONFIG.js";
import { startCameraCreation } from "./contrib.js";
import { updateBottomModalContent, showBottomModal, hideBottomSheet } from "./bottomModal.js";
import { TEXTS } from "./language.js";
import { locateControl, fovLayer, setBaseLayer, getActiveBaseLayerId, baseLayersConfig } from "./map.js";

export let currentScenario = "mean";

export let initSidebar = (map) => {
  const modalButtons = ["btn-add-camera", "btn-layers", "btn-scenario", "btn-legend"];

  /**
   * Sets a button as active within the modal group.
   * It removes the active class from other modal buttons but leaves the
   * locate button alone.
   */
  const setModalGroupActive = (id) => {
    modalButtons.forEach((btnId) => {
      document.getElementById(btnId).classList.toggle("active", btnId === id);
    });
  };

  /**
   * Clears all active states for modal-related buttons.
   * Useful when the modal is closed manually.
   */
  window.clearModalActiveStates = () => {
    modalButtons.forEach((btnId) => {
      document.getElementById(btnId).classList.remove("active");
    });
  };

  const handleModalToggle = (id, openCallback) => {
    const btn = document.getElementById(id);
    if (btn.classList.contains("active")) {
      hideBottomSheet();
    } else {
      openCallback();
      setModalGroupActive(id);
    }
  };

  const getTileCoords = (lat, lon, zoom) => {
    const x = Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
    const y = Math.floor(
      ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
        Math.pow(2, zoom)
    );
    return { x, y, z: zoom };
  };

  // 1. Locate (Independent Toggle)
  const btnLocate = document.getElementById("btn-locate");
  map.on("locateactivate", () => {
    btnLocate.classList.add("active");
  });
  map.on("locatedeactivate", () => {
    btnLocate.classList.remove("active");
  });
  btnLocate.onclick = () => {
    if (locateControl._active) {
      locateControl.stop();
    } else {
      locateControl.start();
    }
  };

  // 2. Camera Creation
  document.getElementById("btn-add-camera").onclick = () => {
    startCameraCreation();
    setModalGroupActive("btn-add-camera");
  };

  // 3. Layers
  document.getElementById("btn-layers").onclick = () => {
    handleModalToggle("btn-layers", () => {
      const currentId = getActiveBaseLayerId();
      const center = map.getCenter();
      const zoom = Math.min(map.getZoom(), 18); // Limit zoom for preview safety
      const coords = getTileCoords(center.lat, center.lng, zoom);
      const layers = [
        { id: "osm", name: TEXTS.layerStandard, img: "images/contrib/mount-pole.jpg" },
        { id: "hot", name: TEXTS.layerHot, img: "images/contrib/mount-pole.jpg" },
        { id: "esri", name: TEXTS.layerSatellite, img: "images/contrib/mount-pole.jpg" },
      ];

      let content = `
    <div class="pico modal-div">
      <h4 class="modal-title">${TEXTS.tooltipLayers}</h4>
      <div class="modal-grid">
    `;

      Object.keys(baseLayersConfig).forEach((id) => {
        const config = baseLayersConfig[id];
        const isActive = id === currentId;

        // Generate the specific tile URL
        const replacements = {
          s: "a",
          z: coords.z,
          x: coords.x,
          y: coords.y,
        };

        // Use a regex to find everything inside { } and replace with the matching key in our object
        const tileUrl = config._url.replace(/{(\w+)}/g, (match, key) => {
          return replacements[key] !== undefined ? replacements[key] : match;
        });
        content += `
          <div class="modal-cell ${isActive ? "active" : ""}"
            data-layer-id="${id}"
            onclick="handleLayerSwitch('${id}')">
            <img class="modal-image map-preview ${config.className || ""}"
                src="${tileUrl}"
                alt="${config.options.name}"
                onerror="this.src='images/logo/fallback-layer.svg'" />
            ${config.options.name}
          </div>`;
      });

      content += `</div></div>`;

      updateBottomModalContent(content);
      showBottomModal({
        authorizeMoveBehindModal: true,
        authorizeDragModal: true,
      });
    });
  };

  window.handleLayerSwitch = (layerId) => {
    setBaseLayer(layerId);
    document.querySelectorAll(".modal-cell").forEach((cell) => cell.classList.remove("active"));
    const activeCell = document.querySelector(`.modal-cell[data-layer-id="${layerId}"]`);
    if (activeCell) {
      activeCell.classList.add("active");
    }
  };

  // 4. Scenario
  document.getElementById("btn-scenario").onclick = () => {
    handleModalToggle("btn-scenario", () => {
      const content = `
      <div class="pico">
        <h4 class="modal-title">${TEXTS.tooltipScenario}</h4>
        <div class="modal-content">
          <p>${TEXTS.scenarioIntro}</p>

          <div role="group" class="vertical">
            <button class="scenario-option ${currentScenario === "best" ? "active" : "outline"}" data-value="best">
              <h5>${TEXTS.scenarioLowTitle}</h5>
              <p>${TEXTS.scenarioLowDesc}</p>
            </button>

            <button class="scenario-option ${currentScenario === "mean" ? "active" : "outline"}" data-value="mean">
              <h5>${TEXTS.scenarioMidTitle}</h5>
              <p>${TEXTS.scenarioMidDesc}</p>
            </button>

            <button class="scenario-option ${currentScenario === "worst" ? "active" : "outline"}" data-value="worst">
              <h5>${TEXTS.scenarioHighTitle}</h5>
              <p>${TEXTS.scenarioHighDesc}</p>
            </button>
          </div>

          <footer class="modal-flex-buttons">
            <button class="outline secondary modal-button" onclick="displayMenuContent('TODO')">
              ${TEXTS.scenarioWhyLink}
            </button>
            <button class="outline secondary modal-button" onclick="displayMenuContent('TODO')">
              ${TEXTS.scenarioMethodologyLink}
            </button>
          </footer>
        </div>
      </div>
      `;
      updateBottomModalContent(content);
      showBottomModal({
        authorizeMoveBehindModal: true,
        authorizeDragModal: true,
        defaultHeight: 50,
        displayOnRight: true,
      });
      // Add event listeners to the new buttons
      document.querySelectorAll(".scenario-option").forEach((btn) => {
        btn.onclick = () => {
          const val = btn.getAttribute("data-value");
          currentScenario = val;

          // 1. Update Map URL
          const newUrl = `${BASE_URL_API}/focus/{z}/{x}/{y}/${val}/`;
          fovLayer.setUrl(newUrl);

          // 2. Refresh UI (Visual feedback)
          document.querySelectorAll(".scenario-option").forEach((b) => b.classList.remove("active"));
          document.querySelectorAll(".scenario-option").forEach((b) => b.classList.add("outline"));
          btn.classList.remove("outline");
          btn.classList.add("active");
        };
      });
    });
  };

  // 5. Legend
  document.getElementById("btn-legend").onclick = () => {
    handleModalToggle("btn-legend", () => {
      const content = `
      <div class="pico modal-div">
        <h4 class="modal-title">${TEXTS.tooltipLegend}</h4>
        <div class="modal-content">
          <p>${TEXTS.legendIntro}</p>

          <div class="legend-list">
              <div class="legend-item">
              <div class="legend-dot dot-id"></div>
              <div><strong>${TEXTS.levelIdTitle}</strong><br><small>${TEXTS.levelIdDesc}</small></div>
              </div>
              <div class="legend-item">
              <div class="legend-dot dot-rec"></div>
              <div><strong>${TEXTS.levelRecTitle}</strong><br><small>${TEXTS.levelRecDesc}</small></div>
              </div>
              <div class="legend-item">
              <div class="legend-dot dot-obs"></div>
              <div><strong>${TEXTS.levelObsTitle}</strong><br><small>${TEXTS.levelObsDesc}</small></div>
              </div>
          </div>

          <footer class="modal-flex-buttons">
              <button class="outline secondary modal-button" onclick="displayMenuContent('fov-more')">
              ${TEXTS.legendMoreLink}
              </button>
          </footer>
        </div>
      </div>
    `;
      updateBottomModalContent(content);
      showBottomModal({
        authorizeMoveBehindModal: true,
        authorizeDragModal: true,
        displayOnRight: true,
      });
    });
  };
};
