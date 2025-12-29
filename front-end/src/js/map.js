/**
 * CONFIGURATION & CONSTANTS
 */
const FOV_STYLES = {
  1: { fillColor: "red", fillOpacity: 0.5, stroke: false, fill: true }, // Identification
  2: { fillColor: "orange", fillOpacity: 0.4, stroke: false, fill: true }, // Recognition
  3: { fillColor: "#00b300", fillOpacity: 0.2, stroke: false, fill: true }, // Observation
};

const LEGEND_GRADES = [
  { label: "Identification", color: FOV_STYLES[1].fillColor },
  { label: "Recognition", color: FOV_STYLES[2].fillColor },
  { label: "Observation", color: FOV_STYLES[3].fillColor },
];

/**
 * STATE MANAGEMENT (Map Instance & Controls)
 */
let map;
let layerSwitcherLight, layerSwitcherDark, zoomControl, locateControl, fovLayer, tilesCams;

/**
 * LAYER FACTORIES
 */
const createBaseLayers = () => {
  const esriTiles = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      maxNativeZoom: 19,
      maxZoom: 21,
      attribution: "Tiles &copy; Esri",
      label: "Satellite",
    }
  );

  const cartoDbDark = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxNativeZoom: 19,
    maxZoom: 21,
    subdomains: "abc",
    className: "dark-map-tiles",
    label: "Map",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> | &copy; <a href="https://carto.com/">CARTO</a>',
  });

  const cartoDbVoyager = L.tileLayer("//{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    subdomains: "abcd",
    maxNativeZoom: 20,
    maxZoom: 21,
    label: "Map",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> | &copy; <a href="https://carto.com/">CARTO</a>',
  });

  const osmHot = L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
    maxZoom: 21,
    maxNativeZoom: 19,
    attribution: '&copy; OSM | <a href="https://www.hotosm.org/">HOT</a>',
  });

  return { esriTiles, cartoDbDark, cartoDbVoyager, osmHot };
};

/**
 * CUSTOM CONTROLS
 */
const createScenarioControl = (fovLayer) => {
  const control = L.control({ position: "topright" });
  control.onAdd = () => {
    const div = L.DomUtil.create("div", "leaflet-bar scenario-picker");
    Object.assign(div.style, { backgroundColor: "white", padding: "10px" });

    div.innerHTML = `
      <label for="scenario-select" style="display:block; font-weight:bold; margin-bottom:5px;">Quality Scenario:</label>
      <select id="scenario-select" style="width: 100%;">
          <option value="best">Scenario 1: Bad Quality</option>
          <option value="mean" selected>Scenario 2: Average Quality</option>
          <option value="worst">Scenario 3: Best Quality</option>
      </select>`;

    L.DomEvent.disableClickPropagation(div);

    // Internal listener for the select element
    setTimeout(() => {
      document.getElementById("scenario-select").addEventListener("change", (e) => {
        const newUrl = `${BASE_URL_API}/focus/{z}/{x}/{y}/${e.target.value}/`;
        fovLayer.setUrl(newUrl);
      });
    }, 0);

    return div;
  };
  return control;
};

const createLegendControl = () => {
  const legend = L.control({ position: "bottomleft" });
  legend.onAdd = () => {
    const div = L.DomUtil.create("div", "map_legend info legend");
    div.innerHTML = "<h4>FOV Levels</h4>";
    LEGEND_GRADES.forEach((item) => {
      div.innerHTML += `<i style="background: ${item.color}"></i> ${item.label}<br>`;
    });
    return div;
  };
  return legend;
};

/**
 * VIEW STATE LOGIC (Zoom/Lat/Lng)
 */
function getInitialView() {
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
}

function updateViewHash() {
  const center = map.getCenter();
  const zoom = map.getZoom();

  // Format coordinates to 2 decimal places for a clean URL
  const precision = 2;
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
}

/**
 * MAIN INITIALIZATION
 */
function initMap() {
  const layers = createBaseLayers();

  // 1. Initialize Map Instance
  map = L.map("map", {
    zoom: MAP_INITIAL_ZOOM,
    minZoom: MAP_MIN_ZOOM,
    maxBounds: MAP_MAX_BBOX,
    zoomControl: false,
  });

  // 2. Setup Panes
  map.createPane("fovPane");
  map.getPane("fovPane").style.zIndex = 450;

  // 3. Configure BaseMap Switchers
  const commonSwitcherCfg = { tileX: 15, tileY: 10, tileZ: 5 };

  layerSwitcherLight = L.control
    .basemaps({
      basemaps: [layers.cartoDbDark, layers.osmHot, layers.esriTiles],
      ...commonSwitcherCfg,
    })
    .setPosition("bottomright");

  layerSwitcherDark = L.control
    .basemaps({
      basemaps: [layers.cartoDbVoyager, layers.osmHot, layers.esriTiles],
      ...commonSwitcherCfg,
    })
    .setPosition("bottomright");

  // 4. Add UI Controls
  map.attributionControl
    .setPosition("bottomright")
    .setPrefix('<a href="https://github.com/babastienne" target="_blank">Babastienne</a>');

  zoomControl = L.control
    .zoom({
      zoomOutTitle: TEXTS.mapZoomOut,
      zoomInTitle: TEXTS.mapZoomIn,
    })
    .addTo(map);

  locateControl = L.control
    .locate({
      strings: { title: TEXTS.mapLocateButton },
    })
    .addTo(map);

  map.addControl(layerSwitcherLight);

  // 5. Add Data Layers
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

  tilesCams = new L.dataTileLayerCamera(`${BASE_URL_API}/cameras.json?tile={z}/{x}/{y}`, {
    display: true,
  });
  map.addLayer(tilesCams);

  // 6. Add Custom Logic Controls
  createScenarioControl(fovLayer).addTo(map);
  createLegendControl().addTo(map);

  // 7. Initial View Positioning & Events
  const initialView = getInitialView();
  map.setView(initialView.center, initialView.zoom);
  map.on("moveend", updateViewHash);
}

// Startup
initMap();
