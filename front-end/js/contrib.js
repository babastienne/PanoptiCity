var currentPositionMarker = new L.marker(map.getCenter(), {});
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

// -- Functions to display forms / ask user information --
displayChoicesForUser = (choices) => {
  let modalContent = `
        <div class="pico modal-div">
            <h4 class="modal-title">${choices.title}</h4>
            <div class="modal-grid">
    `;
  for (elem in choices.options) {
    modalContent =
      modalContent +
      `<div class="modal-cell" onclick="nextStep()">
        <img class="modal-image" src="${choices.options[elem].picture}" />
        ${choices.options[elem].name}
        </div>`;
  }
  modalContent =
    modalContent +
    `</div>
        <button
            class="outline secondary modal-button"
            onclick="nextStep()"
        >${TEXTS.iDontKnowButton}</button></div>`;
  let additionalHeight = computeRenderedImageWidth(
    100,
    5,
    Object.keys(choices.options).length,
    200
  );
  updateBottomModalContent(modalContent, additionalHeight);
  showBottomModal();
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
nextStep = () => {
  console.log("TODO BPO");
};

// displayChoicesForUser(choicesCameraType);
