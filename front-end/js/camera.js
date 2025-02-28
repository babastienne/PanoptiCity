var cameraDetails = {};
var cameraDetailsPlots = [];
var cameraDetailsSelectedScenario = "mean";

levelsCameraConfiguration = {
  identification: {
    color: "red",
    weight: 0.5,
    fill: 0.4,
  },
  recognition: {
    color: "orange",
    weight: 0.5,
    fill: 0.4,
  },
  observation: {
    color: "green",
    weight: 0.5,
    fill: 0.4,
  },
};

choicesCameraType = {
  title: TEXTS.cameraTypeQuestion,
  name: TEXTS.cameraTypeName,
  display: true,
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
      picture: "images/contrib/type-panning-arrow.svg",
    },
  },
};

choicesSurveillanceType = {
  title: TEXTS.cameraSurveillanceQuestion,
  name: TEXTS.cameraSurveillanceName,
  display: true,
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
  name: TEXTS.cameraMountName,
  display: true,
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
  name: TEXTS.cameraZoneName,
  display: true,
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
  name: TEXTS.cameraHeightName,
  display: true,
  tagName: "height",
  defaultValue: 4,
  minValue: 1,
  maxValue: 16,
  step: 0.5,
};

choicesCameraDirection = {
  title: TEXTS.cameraDirectionQuestion,
  name: TEXTS.cameraDirectionName,
  display: true,
  tagName: "camera:direction",
  additionalTransform: 0,
  defaultValue: 0,
  minValue: 0,
  maxValue: 355,
  step: 5,
};

choicesCameraAngle = {
  title: TEXTS.cameraAngleQuestion,
  name: TEXTS.cameraAngleName,
  display: true,
  tagName: "camera:angle",
  additionalTransform: 90,
  defaultValue: 15,
  minValue: 0,
  maxValue: 90,
  step: 5,
};

choicesCameraLocation = {
  title: TEXTS.cameraLocationQuestion,
  name: TEXTS.cameraLocationName,
  display: false,
  tagName: "camera:position",
};

last_date = {
  name: TEXTS.cameracheckDateName,
  display: true,
};

tagsListCamera = {
  man_made: { display: false },
  "surveillance:type": { display: false },
  check_date: last_date,
  "survey:date": last_date,
  source: {
    name: TEXTS.source,
    display: true,
  },
  operator: {
    name: TEXTS.operator,
    display: true,
  },
  "contact:webcam": {
    name: TEXTS.cameraWebcamName,
    display: true,
  },
  "addr:street": {
    name: TEXTS.address,
    display: true,
  },
  name: {
    name: TEXTS.name,
    display: true,
  },
  "camera:type": choicesCameraType,
  surveillance: choicesSurveillanceType,
  "camera:mount": choicesCameraMount,
  "surveillance:zone": choicesCameraZone,
  height: choicesCameraHeight,
  ele: choicesCameraHeight,
  "camera:angle": choicesCameraAngle,
  "camera:position": choicesCameraLocation,
  "camera:direction": choicesCameraDirection,
  "surveillance:direction": choicesCameraDirection,
  direction: choicesCameraDirection,
};

async function getCameraDetails(idCamera) {
  const url = `${BASE_URL_API}/cameras/${idCamera}.json`;
  try {
    let response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error(error.message);
  }
}

async function displayCameraDetails(e) {
  // Function called onClick on a camera Marker
  idCamera = e.target.options.id;
  cameraDetails = await getCameraDetails(idCamera);
  addCameraDetailsData(e.target, cameraDetails);
  _displayCameraFOV("mean");
}

function _transformTagContentInHtml(content) {
  let descr = String(content);
  if (descr.substring(0, 4) == "http") {
    var suffix = descr.slice(-3).toLowerCase();
    if (suffix == "jpg" || suffix == "gif" || suffix == "png") {
      return `<a href="${descr}"><img alt="Link" src="${descr}" width="200"/></a>`;
    } else {
      return `<a href="${descr}">${TEXTS.link}</a>`;
    }
  } else {
    return content;
  }
}

function _createTableEntry(key, value) {
  let preparedValue = _transformTagContentInHtml(value);
  return `
        <tr>
          <td>
            ${key}
          </td>
          <td>
            ${preparedValue}
          </td>
        <td>
      `;
}

// Add camera popup to camera marker.
function addCameraDetailsData(plotMarker, plot) {
  let { lat, lng } = plotMarker.getLatLng();
  let listAttributes = [];
  popupDataTable = `<div class="pico modal-div">

  ${_generateContentFOV()}

  <h4 class="modal-title">${TEXTS.tagsDetails}</h4>
  <table class="pico modal-table">
      <thead>
        <tr>
          <th>${TEXTS.identifier}</th>
          <th>
              <a target="blank" href="https://www.openstreetmap.org/node/${
                plot.id
              }">${plot.id}</a>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Latitude</td><td>${lat}</td>
        </tr>
        <tr>
          <td>Longitude</td><td>${lng}</td>
        </tr>`;
  for (x in plot.tags) {
    if (Object.keys(tagsListCamera).includes(x)) {
      if (tagsListCamera[x].display) {
        if (tagsListCamera[x]?.options?.[plot.tags[x]]) {
          popupDataTable =
            popupDataTable +
            _createTableEntry(
              tagsListCamera[x].name,
              tagsListCamera[x].options[plot.tags[x]].name
            );
        } else {
          popupDataTable =
            popupDataTable +
            _createTableEntry(tagsListCamera[x].name, plot.tags[x]);
        }
      }
    } else {
      popupDataTable = popupDataTable + _createTableEntry(x, plot.tags[x]);
    }
    listAttributes.push(x);
  }

  popupDataTable += `</tbody></table>${_displayEditionButton(
    listAttributes
  )}</div>`;

  cancelCameraCreation();
  updateBottomModalContent(popupDataTable);
  showBottomModal(
    (overlayClickHideModal = true),
    (authorizeMoveBehindModal = true),
    (authorizeDragModal = true),
    (defaultHeight = 50)
  );
}

// Camera edition methods
function _displayEditionButton(listAttributes) {
  content = "";
  if (OSM.isLoggedIn()) {
    if (
      listAttributes.length < 7 ||
      (["fixed", "panning"].includes(cameraDetails["camera_type"]) &&
        listAttributes.length < 9)
    ) {
      content = `
        <div class="modal-flex-buttons">
          <button
              class="outline primary modal-button"
              onclick="completeExistingCameraMissingAttributes(${cameraDetails.id})"
          >${TEXTS.completeCameraButton}</button>
        </div>
      `;
    }
  }
  return content;
}

// Camera Field of view methods
function _generateContentFOV() {
  let content = `<h4 class="modal-title">
    ${TEXTS.simulateFOV}
    <sup><a href="https://github.com/babastienne/PanoptiCity?tab=readme-ov-file#calculation-methods-for-field-of-view" target="_blank">
      <img class="info-bubble" src="images/cameras/info-circle.svg" />
    </a></sup>
  </h4>`;
  if (cameraDetails.fov.mean.identification) {
    content += `
      <div class="modal-flex-buttons-fov" role="group">
        <button
          class="secondary modal-button-fov button-group"
          id="button-best"
          onclick="_displayCameraFOV('best')"
        >${TEXTS.bestScenario}</button>
        <button
          class="modal-button-fov button-group"
          id="button-mean"
          onclick="_displayCameraFOV('mean')"
        >${TEXTS.meanScenario}</button>
        <button
          class="secondary modal-button-fov button-group"
          id="button-worst"
          onclick="_displayCameraFOV('worst')"
        >${TEXTS.worstScenario}</button>
      </div>
    `;
  } else {
    content += `<p>${TEXTS.noFOV}</p>`;
  }
  return content;
}

function removeCameraFOVDetail() {
  if (cameraDetailsPlots.length) {
    for (elem in cameraDetailsPlots) {
      map.removeLayer(cameraDetailsPlots[elem]);
    }
    cameraDetailsPlots = [];
  }
  try {
    let button = document.getElementById(
      `button-${cameraDetailsSelectedScenario}`
    );
    button.classList.add("secondary");
  } catch (e) {}
}

function _displayCameraFOV(scenario) {
  removeCameraFOVDetail();
  cameraDetailsSelectedScenario = scenario;
  try {
    let button = document.getElementById(`button-${scenario}`);
    button.classList.remove("secondary");
  } catch (e) {}
  let plotDetail;
  for (elem in cameraDetails.fov[scenario]) {
    if (cameraDetails.fov[scenario][elem]) {
      plotDetail = new L.Polygon(cameraDetails.fov[scenario][elem], {
        color: levelsCameraConfiguration[elem].color,
        weight: levelsCameraConfiguration[elem].weight,
        fillOpacity: levelsCameraConfiguration[elem].fill,
      });
      map.addLayer(plotDetail);
      cameraDetailsPlots.push(plotDetail);
    }
  }
}
