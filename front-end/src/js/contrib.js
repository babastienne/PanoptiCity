import { TEXTS } from "./language.js";
import { displaySnackbar, showLoginModal } from "./interfaceFill.js";
import { getCamera, createCamera, updateCamera, userIsConnected } from "./osm.js";
import { locateControl } from "./map.js";
import {
  computeRenderedImageWidth,
  showBottomModal,
  hideBottomSheet,
  updateBottomModalContent,
} from "./bottomModal.js";
import {
  choicesCameraType,
  choicesSurveillanceType,
  choicesCameraMount,
  choicesCameraZone,
  choicesCameraHeight,
  choicesCameraDirection,
  choicesCameraAngle,
  choicesCameraLocation,
} from "./cameraConfig.js";

let map;
let currentPositionMarker;
let sliderValue = 0;
let currentCamera = {};

export const initContrib = (givenMap) => {
  map = givenMap;
  currentPositionMarker = new L.marker(map.getCenter(), {});
};

// -- Functions to display forms / ask user information --
const displaySelectChoicesForUser = (choices) => {
  let modalContent = `
        <div class="pico modal-div">
            <h4 class="modal-title">${choices.title}</h4>
            <div class="modal-grid">
    `;
  for (let elem in choices.options) {
    modalContent =
      modalContent +
      `<div class="modal-cell" onclick="nextStep('${choices.tagName}', '${elem}')">
        <img class="modal-image" src="${choices.options[elem].picture}" />
        ${choices.options[elem].name}
        </div>`;
  }
  modalContent =
    modalContent +
    `</div>
        <button
            class="outline secondary modal-button"
            onclick="nextStep('${choices.tagName}')"
        >${TEXTS.iDontKnowButton}</button></div>`;
  let additionalHeight = computeRenderedImageWidth(100, 5, Object.keys(choices.options).length, 200);
  updateBottomModalContent(modalContent, { heightAdd: additionalHeight - 15 });
  showBottomModal({
    overlayClickHideModal: false,
    authorizeMoveBehindModal: false,
    authorizeDragModal: false,
  });
};

const displaySliderForUser = (choices) => {
  let modalContent = `
        <div class="pico modal-div">
          <h4 class="modal-title">${choices.title}</h4>
          <input 
              class="modal-slider-input"
              type="range"
              value="${choices.defaultValue}"
              min="${choices.minValue}"
              max="${choices.maxValue}"
              step="${choices.step}"
              oninput="updateSliderDistanceValue(this.value)" />
          <div id="sliderValue"></div>
          <div class="modal-flex-buttons">
            <button
                class="outline secondary modal-button"
                onclick="nextStep('${choices.tagName}')"
            >${TEXTS.iDontKnowButton}</button>
            <button
                class="outline primary modal-button"
                onclick="nextStep('${choices.tagName}', '${sliderValue}')"
            >${TEXTS.confirmButton}</button>
          </div>
        </div>
    `;
  updateBottomModalContent(modalContent, { heightAdd: -15 });
  updateSliderDistanceValue(choices.defaultValue);
  showBottomModal({
    overlayClickHideModal: false,
    authorizeMoveBehindModal: false,
    authorizeDragModal: false,
  });
};

const displayDirectionFormForUser = (choices) => {
  let modalContent = `
  <div class="pico modal-div">
    <h4 class="modal-title">${choices.title}</h4>
    <div class="modal-flex-buttons">
      <button
          class="outline secondary modal-button"
          onclick="nextStep('${choices.tagName}')"
      >${TEXTS.iDontKnowButton}</button>
      <button
          class="outline primary modal-button"
          onclick="nextStep('${choices.tagName}', '${sliderValue}')"
      >${TEXTS.confirmButton}</button>
    </div>
  </div>
`;
  updateBottomModalContent(modalContent, { heightAdd: -15 });
  showBottomModal({
    overlayClickHideModal: false,
    authorizeMoveBehindModal: true,
    authorizeDragModal: false,
  });
  addDirectionArrowOnMap();
};

const displayAngleFormForUser = (choices) => {
  let modalContent = `
  <div class="pico modal-div">
    <h4 class="modal-title">${choices.title}</h4>
    <input 
      type="range"
      class="modal-slider-input"
      value="${choices.defaultValue}"
      min="${choices.minValue}"
      max="${choices.maxValue}"
      step="${choices.step}"
      oninput="rotateArrowForDirection(this.value, ${choices.additionalTransform})" />
    <div id="sliderValue">${choices.defaultValue}°</div>
    <img id="modal-arrow-direction" src="/images/contrib/arrow.svg" />
    <div class="modal-flex-buttons">
      <button
          class="outline secondary modal-button"
          onclick="nextStep('${choices.tagName}')"
      >${TEXTS.iDontKnowButton}</button>
      <button
          class="outline primary modal-button"
          onclick="nextStep('${choices.tagName}', '${sliderValue}')"
      >${TEXTS.confirmButton}</button>
    </div>
  </div>
`;
  updateBottomModalContent(modalContent, { heightAdd: -15 });
  rotateArrowForDirection(choices.defaultValue, choices.additionalTransform);
  showBottomModal({
    overlayClickHideModal: false,
    authorizeMoveBehindModal: false,
    authorizeDragModal: false,
  });
};

const displayMapFormForUser = (choices) => {
  let modalContent = `
  <div class="pico modal-div">
    <h4 class="modal-title">${choices.title}</h4>
    <div class="modal-flex-buttons">
      <button
          class="outline secondary modal-button"
          onclick="cancelCameraCreation()"
      >${TEXTS.cancelButton}</button>
      <button
          class="outline primary modal-button"
          onclick="nextStep('${choices.tagName}')"
      >${TEXTS.confirmButton}</button>
    </div>
  </div>
`;
  updateBottomModalContent(modalContent, { heightAdd: -15 });
  showBottomModal({
    overlayClickHideModal: false,
    authorizeMoveBehindModal: true,
    authorizeDragModal: false,
  });
};

// -- UTILS Functions --
const addCreationMarkerOnMap = () => {
  currentPositionMarker.setLatLng(map.getCenter());
  currentPositionMarker.addTo(map);
  map.on("move", centerMarkerOnMap);
};

const centerMarkerOnMap = (event) => {
  currentPositionMarker.setLatLng(event.target.getCenter());
};

export const removeCreationMarkerFromMap = () => {
  currentPositionMarker.remove();
  map.off("move", centerMarkerOnMap);
  return currentPositionMarker.getLatLng();
};

const addDirectionArrowOnMap = () => {
  map.dragging.disable();
  let overlay = document.getElementById("customOverlay");
  overlay.innerHTML = `<img id="overlay-arrow-direction" draggable="false" oncontextmenu="return false;" src="/images/contrib/arrow-base.svg" />`;
  let arrow = document.getElementById("overlay-arrow-direction");
  arrow.style.top = `calc(${map.getSize().y / 2}px + 3.5rem - 100px)`;
  let mapDiv = document.getElementById("map");
  mapDiv.addEventListener("mousedown", eventRotationArrow, false);
  arrow.addEventListener("mousedown", eventRotationArrow, false);
  mapDiv.addEventListener("touchstart", eventRotationArrow, false);
  arrow.addEventListener("touchstart", eventRotationArrow, false);
};

const eventRotationArrow = (event) => {
  let typeEvents = event.type == "mousedown" ? ["mousemove", "mouseup"] : ["touchmove", "touchend"];
  var arrow = document.getElementById("overlay-arrow-direction");
  var arrowRects = arrow.getBoundingClientRect();
  var arrowX = arrowRects.left + arrowRects.width / 2;
  var arrowY = arrowRects.top + arrowRects.height / 2;

  let eventMoveHandlerMouse = (event) => {
    let geom = event.type == "touchmove" ? event.touches[0] : event;
    var angle = Math.atan2(geom.clientY - arrowY, geom.clientX - arrowX) + Math.PI / 2;
    rotateArrow((angle * 180) / Math.PI);
  };

  window.addEventListener(typeEvents[0], eventMoveHandlerMouse, false);

  window.addEventListener(
    typeEvents[1],
    function eventEndHandler() {
      window.removeEventListener(typeEvents[0], eventMoveHandlerMouse, false);
      window.removeEventListener(typeEvents[1], eventEndHandler);
    },
    false
  );
};

const rotateArrow = (deg) => {
  let arrow = document.getElementById("overlay-arrow-direction");
  arrow.style.transform = `rotate(${deg}deg)`;
  sliderValue = Math.round(deg);
};

export const removeDirectionArrowFromMap = () => {
  map.dragging.enable();
  let arrow = document.getElementById("overlay-arrow-direction");
  let mapDiv = document.getElementById("map");
  if (mapDiv) {
    mapDiv.removeEventListener("mousedown", eventRotationArrow, false);
    mapDiv.removeEventListener("touchstart", eventRotationArrow, false);
  }
  if (arrow) {
    arrow.removeEventListener("mousedown", eventRotationArrow, false);
    arrow.removeEventListener("touchstart", eventRotationArrow, false);
  }
  let overlay = document.getElementById("customOverlay");
  overlay.innerHTML = "";
};

const rotateArrowForDirection = (value, optionnalTransformation = 0) => {
  sliderValue = Number(value);
  let arrow = document.getElementById("modal-arrow-direction");
  arrow.style.transform = `rotate(${Number(value) + optionnalTransformation}deg)`;
  document.getElementById("sliderValue").innerHTML = `${value}°`;
};

const updateSliderDistanceValue = (value) => {
  sliderValue = value;
  document.getElementById("sliderValue").innerHTML =
    value <= 1 ? `${value} ${TEXTS.distanceUnit}` : `${value} ${TEXTS.distanceUnitPlural}`;
};

// -- Functions to handle creation workflow --
const saveChoosenValue = (tagName, value = null) => {
  if (tagName == choicesCameraLocation.tagName) {
    let position = removeCreationMarkerFromMap();
    currentCamera.lat = position.lat;
    currentCamera.lon = position.lng;
    displaySelectChoicesForUser(choicesCameraType);
  } else if (
    tagName == choicesCameraDirection.tagName ||
    tagName == choicesCameraAngle.tagName ||
    tagName == choicesCameraHeight.tagName
  ) {
    if (tagName == choicesCameraDirection.tagName) {
      removeDirectionArrowFromMap();
    }
    if (value != null) {
      currentCamera.tags[tagName] = sliderValue;
    } else {
      currentCamera.tags[tagName] = null;
    }
  } else {
    currentCamera.tags[tagName] = value;
  }
};

const chooseNextStep = () => {
  let existingCameraFields = Object.keys(currentCamera);
  let existingCameraTags = Object.keys(currentCamera.tags);
  if (!existingCameraFields.includes("lat")) {
    displayMapFormForUser(choicesCameraLocation);
    addCreationMarkerOnMap();
  } else if (!existingCameraTags.includes(choicesCameraType.tagName)) {
    displaySelectChoicesForUser(choicesCameraType);
  } else if (
    existingCameraTags.includes(choicesCameraType.tagName) &&
    ["fixed", "panning"].includes(currentCamera.tags[choicesCameraType.tagName]) &&
    !existingCameraTags.includes(choicesCameraDirection.tagName)
  ) {
    displayDirectionFormForUser(choicesCameraDirection);
  } else if (
    existingCameraTags.includes(choicesCameraDirection.tagName) &&
    !existingCameraTags.includes(choicesCameraAngle.tagName)
  ) {
    displayAngleFormForUser(choicesCameraAngle);
  } else if (!existingCameraTags.includes(choicesSurveillanceType.tagName)) {
    displaySelectChoicesForUser(choicesSurveillanceType);
  } else if (!existingCameraTags.includes(choicesCameraMount.tagName)) {
    displaySelectChoicesForUser(choicesCameraMount);
  } else if (!existingCameraTags.includes(choicesCameraZone.tagName)) {
    displaySelectChoicesForUser(choicesCameraZone);
  } else if (!existingCameraTags.includes(choicesCameraHeight.tagName)) {
    displaySliderForUser(choicesCameraHeight);
  } else if (!existingCameraFields.includes("id")) {
    // Current does not have id, it is then a creation
    createCamera(currentCamera);
    cancelCameraCreation();
    displaySnackbar(TEXTS.successCreationCameraMsg);
  } else {
    // The camera is being updating (already exists)
    updateCamera(currentCamera);
    cancelCameraCreation();
    displaySnackbar(TEXTS.successUpdateCameraMsg);
  }
};

export const nextStep = (tagName, value = null) => {
  hideBottomSheet();
  saveChoosenValue(tagName, value);
  chooseNextStep();
};

export const startCameraCreation = () => {
  // This function is called when the user click on the creation button
  if (!userIsConnected) {
    showLoginModal();
    return;
  }
  currentCamera = {
    tags: {
      man_made: "surveillance",
      "surveillance:type": "camera",
    },
  };
  chooseNextStep();
};

export const completeExistingCameraMissingAttributes = async (cameraId) => {
  if (!userIsConnected) {
    showLoginModal();
    return;
  }
  currentCamera = await getCamera(cameraId);
  chooseNextStep();
};

export const cancelCameraCreation = () => {
  hideBottomSheet();
  removeCreationMarkerFromMap();
};

// TEMPORARY: Bridge for HTML onclick attributes
window.completeExistingCameraMissingAttributes = completeExistingCameraMissingAttributes;
window.nextStep = nextStep;
window.startCameraCreation = startCameraCreation;
window.cancelCameraCreation = cancelCameraCreation;
window.updateSliderDistanceValue = updateSliderDistanceValue;
window.rotateArrowForDirection = rotateArrowForDirection;
