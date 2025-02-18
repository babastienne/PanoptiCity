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
      picture: "images/contrib/type-fixed.svg",
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
  let cameraDetails = await getCameraDetails(idCamera);
  addCameraDetailsData(e.target, cameraDetails);
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
  <table class="pico modal-table">
      <thead>
        <tr>
          <th>${TEXTS.identifier}</th>
          <th>
              <a target="blank" href="https://www.openstreetmap.org/node/${plot.id}">${plot.id}</a>
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
  console.log(plot);
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
  popupDataTable = popupDataTable + "</tbody></table>";
  if (OSM.isLoggedIn()) {
    if (
      listAttributes.length < 7 ||
      (["fixed", "panning"].includes(plot["camera_type"]) && listAttributes < 9)
    ) {
      popupDataTable =
        popupDataTable +
        `
        <div class="modal-flex-buttons">
          <button
              class="outline primary modal-button"
              onclick="completeExistingCameraMissingAttributes(${plot.id})"
          >${TEXTS.completeCameraButton}</button>
        </div>
      `;
    }
  }

  popupDataTable = popupDataTable + "</div>";
  cancelCameraCreation();
  updateBottomModalContent(popupDataTable);
  showBottomModal();
}
