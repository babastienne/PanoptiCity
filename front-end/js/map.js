/**
 * CONFIGURATION & CONSTANTS
 */
const FOV_STYLES = {
  1: { fillColor: "#ff0000", fillOpacity: 0.5, stroke: false, fill: true }, // Identification
  2: { fillColor: "#ffae00", fillOpacity: 0.4, stroke: false, fill: true }, // Recognition
  3: { fillColor: "#00ff00", fillOpacity: 0.2, stroke: false, fill: true }, // Surveillance
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
 * BBOX & STORAGE LOGIC
 */
function getInitialBBox() {
  const hash = window.location.hash;
  if (hash.includes("mapBBox")) {
    const regexBBox = /\[\[\d*.\d+,\d*.\d+\],\[\d*.\d+,\d*.\d+\]\]/g;
    return JSON.parse(hash.match(regexBBox)[0]);
  }
  const cached = localStorage.getItem("map-bbox");
  return cached ? JSON.parse(cached) : MAP_INITIAL_BBOX;
}

function updateBBox() {
  const b = map.getBounds();
  const bboxStr = `[[${b.getSouthWest().lat},${b.getSouthWest().lng}],[${b.getNorthEast().lat},${
    b.getNorthEast().lng
  }]]`;
  localStorage.setItem("map-bbox", bboxStr);
  window.location.hash = `mapBBox=${bboxStr}`;
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
  map.fitBounds(getInitialBBox());
  map.on("moveend", updateBBox);
}

// Startup
initMap();
