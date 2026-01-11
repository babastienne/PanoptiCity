import { BASE_URL_API, MAP_INITIAL_CENTER, MAP_MAX_BBOX, MAP_INITIAL_ZOOM, MAP_MIN_ZOOM } from "../../CONFIG.js";
import { TEXTS } from "./language.js";
import { createCameraIcon, displayCameraDetails } from "./camera.js";
import { dataTileLayerCamera } from "./leaflet.data.tilelayer.js";

/**
 * CONFIGURATION & CONSTANTS
 */
const FOV_STYLES = {
  1: { fillColor: "#ff3131", fillOpacity: 0.4, stroke: false, fill: true }, // Identification
  2: { fillColor: "#ffbf00", fillOpacity: 0.4, stroke: false, fill: true }, // Recognition
  3: { fillColor: "#00b300", fillOpacity: 0.4, stroke: false, fill: true }, // Observation
};

export const ICONS_MAPPING = {
  traffic: "images/cameras/traffic.png",
  cam: "images/cameras/cam.png",
  fixed: "images/cameras/fixed.png",
  panning: "images/cameras/panning.png",
  dome: "images/cameras/dome.png",
  trafficIncomplete: "images/cameras/traffic.png",
  camIncomplete: "images/cameras/cam.png",
  fixedIncomplete: "images/cameras/fixed.png",
  panningIncomplete: "images/cameras/panning.png",
  domeIncomplete: "images/cameras/dome.png",
  trafficMissing: "images/cameras/trafficRed.png",
  camMissing: "images/cameras/camRed.png",
  fixedMissing: "images/cameras/fixedRed.png",
  panninMissing: "images/cameras/panningRed.png",
  domeMissing: "images/cameras/domeRed.png",
};

/**
 * STATE MANAGEMENT (Map Instance & Controls)
 */
let map, currentBaseLayer;
export let fovLayer, locateControl, layers;
let currentBaseLayerId = "osm";

/**
 * LAYERS FUNCTIONS
 */
export let setBaseLayer = (layerId) => {
  if (!baseLayersConfig[layerId]) return;

  // Remove old layer
  if (currentBaseLayer) {
    map.removeLayer(currentBaseLayer);
  }

  // Add new layer
  currentBaseLayer = baseLayersConfig[layerId];
  currentBaseLayerId = layerId;
  currentBaseLayer.addTo(map);
};

export const getActiveBaseLayerId = () => currentBaseLayerId;

export const baseLayersConfig = {
  osm: L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxNativeZoom: 19,
    maxZoom: 21,
    subdomains: "abc",
    className: "dark-map-tiles",
    label: "Map",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    name: TEXTS.layerStandard,
  }),
  hot: L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
    maxZoom: 21,
    maxNativeZoom: 19,
    className: "dark-map-tiles",
    attribution: '&copy; OSM | <a href="https://www.hotosm.org/">HOT</a>',
    name: TEXTS.layerHot,
  }),
  esri: L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    maxNativeZoom: 19,
    maxZoom: 21,
    className: "dark-map-tiles",
    attribution: "Tiles &copy; Esri",
    label: "Satellite",
    name: TEXTS.layerSatellite,
  }),
};

/**
 * VIEW STATE LOGIC (Zoom/Lat/Lng)
 */
let getInitialView = () => {
  const hash = window.location.hash;

  if (hash.startsWith("#map=")) {
    const parts = hash.replace("#map=", "").split("/");
    if (parts.length === 3) {
      const zoom = parseFloat(parts[0]);
      const lat = parseFloat(parts[1]);
      const lng = parseFloat(parts[2]);
      if (!isNaN(zoom) && !isNaN(lat) && !isNaN(lng)) {
        return { center: [lat, lng], zoom: zoom };
      }
    }
  }

  const cached = localStorage.getItem("map-view");
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      return { center: [parsed.lat, parsed.lng], zoom: parsed.zoom };
    } catch (e) {
      console.error("Error parsing cached view", e);
    }
  }

  return {
    center: MAP_INITIAL_CENTER,
    zoom: MAP_INITIAL_ZOOM,
  };
};

let updateViewHash = () => {
  const center = map.getCenter();
  const zoom = map.getZoom();

  // Format coordinates to 2 decimal places for a clean URL
  const precision = 4;
  const lat = center.lat.toFixed(precision);
  const lng = center.lng.toFixed(precision);
  const z = zoom % 1 === 0 ? zoom : zoom.toFixed(2); // Keep decimals only if zoom is fractional

  const viewString = `${z}/${lat}/${lng}`;

  // Update URL Hash without triggering a page reload
  window.location.hash = `map=${viewString}`;

  // Update LocalStorage
  localStorage.setItem(
    "map-view",
    JSON.stringify({
      lat: center.lat,
      lng: center.lng,
      zoom: zoom,
    })
  );
};

/**
 * MAIN INITIALIZATION
 */
export let initMap = () => {
  // 1. Initialize Map Instance
  map = L.map("map", {
    zoom: MAP_INITIAL_ZOOM,
    minZoom: MAP_MIN_ZOOM,
    maxBounds: MAP_MAX_BBOX,
    zoomControl: false,
  });

  currentBaseLayer = baseLayersConfig[currentBaseLayerId];
  currentBaseLayer.addTo(map);

  // 2. Setup Panes
  map.createPane("fovPane");
  map.getPane("fovPane").style.zIndex = 450;

  // 3. Add UI Controls
  map.attributionControl
    .setPosition("bottomright")
    .setPrefix('<a href="https://github.com/babastienne" target="_blank">Babastienne</a>');

  locateControl = L.control
    .locate({
      showPopup: false,
    })
    .addTo(map);

  // 4. Add Data Layers
  fovLayer = L.vectorGrid
    .protobuf(`${BASE_URL_API}/focus/{z}/{x}/{y}/mean/`, {
      minZoom: 14,
      maxNativeZoom: 16,
      maxZoom: 21,
      pane: "fovPane",
      interactive: true,
      extent: 4096,
      rendererFactory: L.svg.tile,
      vectorTileLayerStyles: {
        fov_layer: (props) => FOV_STYLES[props.type] || {},
      },
    })
    .addTo(map);

  const tilesCams = dataTileLayerCamera(`${BASE_URL_API}/cameras.json?tile={z}/{x}/{y}`, {
    display: true,
    onCameraClick: displayCameraDetails,
    createCameraIcon: createCameraIcon,
    maxNativeZoom: 15,
  });
  map.addLayer(tilesCams);

  // 5. Initial View Positioning & Events
  const initialView = getInitialView();
  map.setView(initialView.center, initialView.zoom);
  map.on("moveend", updateViewHash);

  // 6. Init event listener to change theme layers
  window.addEventListener("themeChanged", (e) => {
    const theme = e.detail.theme;
    const root = document.documentElement;
    if (theme === "dark") {
      root.style.setProperty("--dark-map-filter", "brightness(0.7) contrast(1.2)");
    } else {
      root.style.setProperty("--dark-map-filter", "none");
    }
  });

  return map;
};
