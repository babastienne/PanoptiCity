import { BASE_URL_API } from "../../CONFIG.js";
import { TEXTS } from "./language.js";
import { showBottomModal, updateBottomModalContent } from "./bottomModal.js";
import { cancelCameraCreation } from "./contrib.js";
import { fovLayer } from "./map.js";
import { levelsCameraConfiguration, tagsListCamera } from "./cameraConfig.js";

let map;
let cameraDetails = {};
let cameraDetailsPlots = [];
let cameraDetailsSelectedScenario = "mean";

export let initCamera = (mapInstance) => {
  map = mapInstance;
  window._displayCameraFOV = _displayCameraFOV;
};

let getCameraDetails = async (idCamera) => {
  const url = `${BASE_URL_API}/cameras/${idCamera}.json`;
  try {
    let response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error(error.message);
  }
};

export let displayCameraDetails = async (marker) => {
  // Function called onClick on a camera Marker
  let idCamera = marker.options.id;
  cameraDetails = await getCameraDetails(idCamera);
  addCameraDetailsData(marker, cameraDetails);
  _displayCameraFOV("mean");
  if (map.hasLayer(fovLayer)) {
    fovLayer.removeFrom(map);
  }
};

const _transformTagContentInHtml = (content) => {
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
};

const _createTableEntry = (key, value) => {
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
};

// Add camera popup to camera marker.
const addCameraDetailsData = (plotMarker, plot) => {
  let { lat, lng } = plotMarker.getLatLng();
  let listAttributes = [];
  let popupDataTable = `<div class="pico modal-div">

  ${_generateContentFOV()}

  <h4 class="modal-title">${TEXTS.tagsDetails}</h4>
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
  for (let x in plot.tags) {
    if (Object.keys(tagsListCamera).includes(x)) {
      if (tagsListCamera[x].display) {
        if (tagsListCamera[x]?.options?.[plot.tags[x]]) {
          popupDataTable =
            popupDataTable + _createTableEntry(tagsListCamera[x].name, tagsListCamera[x].options[plot.tags[x]].name);
        } else {
          popupDataTable = popupDataTable + _createTableEntry(tagsListCamera[x].name, plot.tags[x]);
        }
      }
    } else {
      popupDataTable = popupDataTable + _createTableEntry(x, plot.tags[x]);
    }
    listAttributes.push(x);
  }

  popupDataTable += `</tbody></table>${_displayEditionButton(listAttributes)}</div>`;

  cancelCameraCreation();
  updateBottomModalContent(popupDataTable);
  showBottomModal({
    overlayClickHideModal: true,
    authorizeMoveBehindModal: true,
    authorizeDragModal: true,
    defaultHeight: 50,
  });
};

// Camera edition methods
const _displayEditionButton = (listAttributes) => {
  let content = "";
  if (OSM.isLoggedIn()) {
    if (
      listAttributes.length < 7 ||
      (["fixed", "panning"].includes(cameraDetails["camera_type"]) && listAttributes.length < 9)
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
};

// Camera Field of view methods
const _generateContentFOV = () => {
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
};

export const removeCameraFOVDetail = () => {
  if (cameraDetailsPlots.length) {
    for (let elem in cameraDetailsPlots) {
      map.removeLayer(cameraDetailsPlots[elem]);
    }
    cameraDetailsPlots = [];
  }
  try {
    let button = document.getElementById(`button-${cameraDetailsSelectedScenario}`);
    button.classList.add("secondary");
  } catch (e) {}
};

const _displayCameraFOV = (scenario) => {
  removeCameraFOVDetail();
  cameraDetailsSelectedScenario = scenario;
  try {
    let button = document.getElementById(`button-${scenario}`);
    button.classList.remove("secondary");
  } catch (e) {}
  let plotDetail;
  let previousPolygon = [];
  for (let elem in cameraDetails.fov[scenario]) {
    if (cameraDetails.fov[scenario][elem]) {
      plotDetail = new L.Polygon(
        [
          previousPolygon, // Outer ring substraction
          cameraDetails.fov[scenario][elem], // Polygon to display
        ],
        {
          color: levelsCameraConfiguration[elem].color,
          weight: levelsCameraConfiguration[elem].weight,
          fillOpacity: levelsCameraConfiguration[elem].fill,
        }
      );
      map.addLayer(plotDetail);
      cameraDetailsPlots.push(plotDetail);
      previousPolygon = cameraDetails.fov[scenario][elem];
    }
  }
};
