var currentPositionMarker = new L.marker(map.getCenter(), {});
var sliderValue = 0;
var currentCamera = {};

// -- Functions to display forms / ask user information --
displaySelectChoicesForUser = (choices) => {
  let modalContent = `
        <div class="pico modal-div">
            <h4 class="modal-title">${choices.title}</h4>
            <div class="modal-grid">
    `;
  for (elem in choices.options) {
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
  let additionalHeight = computeRenderedImageWidth(
    100,
    5,
    Object.keys(choices.options).length,
    200
  );
  updateBottomModalContent(modalContent, additionalHeight);
  showBottomModal((overlayClickHideModal = false));
};

displaySliderForUser = (choices) => {
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
  updateBottomModalContent(modalContent);
  updateSliderDistanceValue(choices.defaultValue);
  showBottomModal((overlayClickHideModal = false));
};

displayDirectionFormForUser = (choices) => {
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
  updateBottomModalContent(modalContent, (heightAdd = -15), (adaptMap = true));
  addDirectionArrowOnMap();
  showBottomModal(
    (overlayClickHideModal = false),
    (authorizeMoveBehindModal = true)
  );
};

displayAngleFormForUser = (choices) => {
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
  updateBottomModalContent(modalContent);
  rotateArrowForDirection(choices.defaultValue, choices.additionalTransform);
  showBottomModal((overlayClickHideModal = false));
};

displayMapFormForUser = (choices) => {
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
  updateBottomModalContent(modalContent, (heightAdd = -15), (adaptMap = true));
  showBottomModal(
    (overlayClickHideModal = false),
    (authorizeMoveBehindModal = true)
  );
};

// -- UTILS Functions --
addCreationMarkerOnMap = () => {
  currentPositionMarker.setLatLng(map.getCenter());
  currentPositionMarker.addTo(map);
  map.on("move", centerMarkerOnMap);
};

centerMarkerOnMap = (event) => {
  currentPositionMarker.setLatLng(event.target.getCenter());
};

removeCreationMarkerFromMap = () => {
  currentPositionMarker.remove();
  map.off("move", centerMarkerOnMap);
  return currentPositionMarker.getLatLng();
};

addDirectionArrowOnMap = () => {
  map.dragging.disable();
  locateControl.remove(map);
  let overlay = document.getElementById("customOverlay");
  overlay.innerHTML = `<img id="overlay-arrow-direction" draggable="false" src="/images/contrib/arrow-base.svg" />`;
  let arrow = document.getElementById("overlay-arrow-direction");
  arrow.style.top = `calc(${map.getSize().y / 2}px + 4rem - 100px)`;
  let mapDiv = document.getElementById("map");
  mapDiv.addEventListener("mousedown", eventRotationArrow, false);
  arrow.addEventListener("mousedown", eventRotationArrow, false);
  mapDiv.addEventListener("touchstart", eventRotationArrow, false);
  arrow.addEventListener("touchstart", eventRotationArrow, false);
};

eventRotationArrow = (event) => {
  typeEvents =
    event.type == "mousedown"
      ? ["mousemove", "mouseup"]
      : ["touchmove", "touchend"];
  var arrow = document.getElementById("overlay-arrow-direction");
  var arrowRects = arrow.getBoundingClientRect();
  var arrowX = arrowRects.left + arrowRects.width / 2;
  var arrowY = arrowRects.top + arrowRects.height / 2;

  function eventMoveHandlerMouse(event) {
    let geom = event.type == "touchmove" ? event.touches[0] : event;
    var angle =
      Math.atan2(geom.clientY - arrowY, geom.clientX - arrowX) + Math.PI / 2;
    rotateArrow((angle * 180) / Math.PI);
  }

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

function rotateArrow(deg) {
  let arrow = document.getElementById("overlay-arrow-direction");
  arrow.style.transform = `rotate(${deg}deg)`;
  sliderValue = Math.round(deg);
}

removeDirectionArrowFromMap = () => {
  map.dragging.enable();
  locateControl.addTo(map);
  let arrow = document.getElementById("overlay-arrow-direction");
  let mapDiv = document.getElementById("map");
  mapDiv.removeEventListener("mousedown", eventRotationArrow, false);
  arrow.removeEventListener("mousedown", eventRotationArrow, false);
  mapDiv.removeEventListener("touchstart", eventRotationArrow, false);
  arrow.removeEventListener("touchstart", eventRotationArrow, false);
  let overlay = document.getElementById("customOverlay");
  overlay.innerHTML = "";
};

rotateArrowForDirection = (value, optionnalTransformation = 0) => {
  sliderValue = Number(value);
  let arrow = document.getElementById("modal-arrow-direction");
  arrow.style.transform = `rotate(${
    Number(value) + optionnalTransformation
  }deg)`;
  document.getElementById("sliderValue").innerHTML = `${value}°`;
};

updateSliderDistanceValue = (value) => {
  sliderValue = value;
  document.getElementById("sliderValue").innerHTML =
    value <= 1
      ? `${value} ${TEXTS.distanceUnit}`
      : `${value} ${TEXTS.distanceUnitPlural}`;
};

// -- Functions to handle creation workflow --
saveChoosenValue = (tagName, value = null) => {
  if (tagName == choicesCameraLocation.tagName) {
    position = removeCreationMarkerFromMap();
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

chooseNextStep = () => {
  let existingCameraFields = Object.keys(currentCamera);
  let existingCameraTags = Object.keys(currentCamera.tags);
  if (!existingCameraFields.includes("lat")) {
    addCreationMarkerOnMap();
    displayMapFormForUser(choicesCameraLocation);
  } else if (!existingCameraTags.includes(choicesCameraType.tagName)) {
    displaySelectChoicesForUser(choicesCameraType);
  } else if (
    existingCameraTags.includes(choicesCameraType.tagName) &&
    ["fixed", "panning"].includes(
      currentCamera.tags[choicesCameraType.tagName]
    ) &&
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

nextStep = (tagName, value = null) => {
  hideBottomSheet();
  saveChoosenValue(tagName, value);
  chooseNextStep();
};

startCameraCreation = () => {
  // This function is called when the user click on the creation button
  document.getElementById("latteralButtons").innerHTML = ""; // We remove the creation button of the interface
  currentCamera = {
    tags: {
      man_made: "surveillance",
      "surveillance:type": "camera",
    },
  };
  chooseNextStep();
};

completeExistingCameraMissingAttributes = async (cameraId) => {
  document.getElementById("latteralButtons").innerHTML = ""; // We remove the creation button of the interface
  currentCamera = await getCamera(cameraId);
  chooseNextStep();
};

cancelCameraCreation = () => {
  hideBottomSheet();
  removeCreationMarkerFromMap();
  if (userIsConnected) {
    document.getElementById("latteralButtons").innerHTML = creationCameraButton;
  }
};
