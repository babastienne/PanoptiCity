var currentPositionMarker = new L.marker(map.getCenter(), {});
var sliderValue = 0;
choicesCameraType = {
  title: TEXTS.cameraTypeQuestion,
  tagName: "camera:type",
  options: {
    dome: {
      name: TEXTS.cameraTypeDome,
      picture: "images/contrib/type-dome.svg",
    },
    fixed: {
      name: TEXTS.cameraTypeFixed,
      picture: "images/contrib/type-fixed.svg",
    },
    panning: {
      name: TEXTS.cameraTypePanning,
      picture: "images/contrib/type-fixed.svg",
    },
  },
};

choicesSurveillanceType = {
  title: TEXTS.cameraSurveillanceQuestion,
  tagName: "surveillance",
  options: {
    public: {
      name: TEXTS.cameraSurveillancePublic,
      picture: "images/contrib/type-public.svg",
    },
    outdoor: {
      name: TEXTS.cameraSurveillanceOutdoor,
      picture: "images/contrib/type-outdoor.svg",
    },
    indoor: {
      name: TEXTS.cameraSurveillanceIndoor,
      picture: "images/contrib/type-indoor.svg",
    },
  },
};

choicesCameraMount = {
  title: TEXTS.cameraMountQuestion,
  tagName: "camera:mount",
  options: {
    wall: {
      name: TEXTS.cameraMountWall,
      picture: "images/contrib/mount-wall.jpg",
    },
    pole: {
      name: TEXTS.cameraMountPole,
      picture: "images/contrib/mount-pole.jpg",
    },
    ceiling: {
      name: TEXTS.cameraMountCeiling,
      picture: "images/contrib/mount-ceiling.jpg",
    },
    street_lamp: {
      name: TEXTS.cameraMountStreetLamp,
      picture: "images/contrib/mount-streetlamp.jpg",
    },
    traffic_signals: {
      name: TEXTS.cameraMountTrafficSignal,
      picture: "images/contrib/mount-trafficlights.jpg",
    },
    doorbell: {
      name: TEXTS.cameraMountDoorbell,
      picture: "images/contrib/type-fixed.svg",
    },
    atm: {
      name: TEXTS.cameraMountAtm,
      picture: "images/contrib/type-fixed.svg",
    },
  },
};

choicesCameraZone = {
  title: TEXTS.cameraZoneQuestion,
  tagName: "surveillance:zone",
  options: {
    traffic: {
      name: TEXTS.cameraZoneTraffic,
      picture: "images/contrib/zone-traffic.svg",
    },
    town: {
      name: TEXTS.cameraZoneTown,
      picture: "images/contrib/zone-city.jpg",
    },
    entrance: {
      name: TEXTS.cameraZoneEntrance,
      picture: "images/contrib/zone-entrance.png",
    },
    shop: {
      name: TEXTS.cameraZoneShop,
      picture: "images/contrib/zone-store.jpg",
    },
    bank: {
      name: TEXTS.cameraZoneBank,
      picture: "images/contrib/zone-bank2.svg",
    },
    building: {
      name: TEXTS.cameraZoneBuilding,
      picture: "images/contrib/zone-building.svg",
    },
    parking: {
      name: TEXTS.cameraZoneParking,
      picture: "images/contrib/zone-parking.svg",
    },
    public_transport_platform: {
      name: TEXTS.cameraZonePublicTransportPlatform,
      picture: "images/contrib/zone-transport.jpg",
    },
  },
};

choicesCameraHeight = {
  title: TEXTS.cameraHeightQuestion,
  tagName: "height",
  defaultValue: 4,
  minValue: 1,
  maxValue: 16,
  step: 0.5,
};

choicesCameraDirection = {
  title: TEXTS.cameraDirectionQuestion,
  tagName: "camera:direction",
  additionalTransform: 0,
  defaultValue: 0,
  minValue: 0,
  maxValue: 355,
  step: 5,
};

choicesCameraAngle = {
  title: TEXTS.cameraAngleQuestion,
  tagName: "camera:angle",
  additionalTransform: 90,
  defaultValue: 15,
  minValue: 0,
  maxValue: 90,
  step: 5,
};

choicesCameraLocation = {
  title: TEXTS.cameraLocationQuestion,
  tagName: "camera:position",
};

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

updateSliderDistanceValue = (value) => {
  sliderValue = value;
  document.getElementById("sliderValue").innerHTML =
    value <= 1
      ? `${value} ${TEXTS.distanceUnit}`
      : `${value} ${TEXTS.distanceUnitPlural}`;
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

rotateArrowForDirection = (value, optionnalTransformation = 0) => {
  sliderValue = Number(value);
  let arrow = document.getElementById("modal-arrow-direction");
  arrow.style.transform = `rotate(${
    Number(value) + optionnalTransformation
  }deg)`;
  document.getElementById("sliderValue").innerHTML = `${value}°`;
};

displayDirectionFormForUser = (choices) => {
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

// -- Functions to get location of point from user --
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
    if (value != null) {
      currentCamera.tags[tagName] = sliderValue;
    } else {
      currentCamera.tags[tagName] = null;
    }
    console.log(currentCamera.tags[tagName]);
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
    displayDirectionFormForUser(choicesCameraAngle);
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
  document.getElementById("latteralButtons").innerHTML = creationCameraButton;
};
