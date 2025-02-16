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
      picture: "images/contrib/type-dome.svg",
    },
    outdoor: {
      name: TEXTS.cameraSurveillanceOutdoor,
      picture: "images/contrib/type-fixed.svg",
    },
    indoor: {
      name: TEXTS.cameraSurveillanceIndoor,
      picture: "images/contrib/type-fixed.svg",
    },
  },
};

choicesCameraMount = {
  title: TEXTS.cameraMountQuestion,
  tagName: "camera:mount",
  options: {
    wall: {
      name: TEXTS.cameraMountWall,
      picture: "images/contrib/type-dome.svg",
    },
    pole: {
      name: TEXTS.cameraMountPole,
      picture: "images/contrib/type-fixed.svg",
    },
    ceiling: {
      name: TEXTS.cameraMountCeiling,
      picture: "images/contrib/type-fixed.svg",
    },
    street_lamp: {
      name: TEXTS.cameraMountStreetLamp,
      picture: "images/contrib/type-dome.svg",
    },
    traffic_signals: {
      name: TEXTS.cameraMountTrafficSignal,
      picture: "images/contrib/type-fixed.svg",
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
      picture: "images/contrib/type-dome.svg",
    },
    town: {
      name: TEXTS.cameraZoneTown,
      picture: "images/contrib/type-fixed.svg",
    },
    entrance: {
      name: TEXTS.cameraZoneEntrance,
      picture: "images/contrib/type-fixed.svg",
    },
    shop: {
      name: TEXTS.cameraZoneShop,
      picture: "images/contrib/type-dome.svg",
    },
    bank: {
      name: TEXTS.cameraZoneBank,
      picture: "images/contrib/type-fixed.svg",
    },
    building: {
      name: TEXTS.cameraZoneBuilding,
      picture: "images/contrib/type-fixed.svg",
    },
    parking: {
      name: TEXTS.cameraZoneParking,
      picture: "images/contrib/type-fixed.svg",
    },
    public_transport_platform: {
      name: TEXTS.cameraZonePublicTransportPlatform,
      picture: "images/contrib/type-fixed.svg",
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
nextStep = (tagName, value = null) => {
  console.log(tagName);
  console.log(value);
  hideBottomSheet();
  if (tagName == choicesCameraLocation.tagName) {
    position = removeCreationMarkerFromMap();
    currentCamera.lat = position.lat;
    currentCamera.lon = position.lng;
    displaySelectChoicesForUser(choicesCameraType);
  } else if (tagName == choicesCameraType.tagName) {
    if (value != null) {
      currentCamera.tags[tagName] = value;
      if (value == "fixed" || value == "panning") {
        displayDirectionFormForUser(choicesCameraDirection);
      } else {
        displaySelectChoicesForUser(choicesSurveillanceType);
      }
    } else {
      displaySelectChoicesForUser(choicesSurveillanceType);
    }
  } else if (tagName == choicesCameraDirection.tagName) {
    if (value != null) {
      currentCamera.tags[tagName] = sliderValue;
    }
    displayDirectionFormForUser(choicesCameraAngle);
  } else if (tagName == choicesCameraAngle.tagName) {
    if (value != null) {
      currentCamera.tags[tagName] = sliderValue;
    }
    displaySelectChoicesForUser(choicesSurveillanceType);
  } else if (tagName == choicesSurveillanceType.tagName) {
    if (value != null) {
      currentCamera.tags[tagName] = value;
    }
    displaySelectChoicesForUser(choicesCameraMount);
  } else if (tagName == choicesCameraMount.tagName) {
    if (value != null) {
      currentCamera.tags[tagName] = value;
    }
    displaySelectChoicesForUser(choicesCameraZone);
  } else if (tagName == choicesCameraZone.tagName) {
    if (value != null) {
      currentCamera.tags[tagName] = value;
    }
    displaySliderForUser(choicesCameraHeight);
  } else {
    createCamera(currentCamera);
    cancelCameraCreation();
  }
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
  addCreationMarkerOnMap();
  displayMapFormForUser(choicesCameraLocation);
};

cancelCameraCreation = () => {
  hideBottomSheet();
  removeCreationMarkerFromMap();
  document.getElementById("latteralButtons").innerHTML = creationCameraButton;
};
