var map;
var layerSwitcherLight;
var layerSwitcherDark;
var zoomControl;
var locateControl;

function initMap() {
  var esriTiles = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      maxNativeZoom: 19,
      maxZoom: 21,
      attribution: "Tiles &copy; Esri",
      label: "Satellite",
    }
  );

  var CartoDB_DarkVoyage = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxNativeZoom: 19,
    maxZoom: 21,
    subdomains: "abc",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | &copy; <a href="https://carto.com/attributions">CARTO</a>',
    className: "dark-map-tiles",
    label: "Map",
  });

  var CartoDB_Voyager = L.tileLayer("//{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxNativeZoom: 20,
    maxZoom: 21,
    label: "Map",
  });

  var OpenStreetMap_HOT = L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
    maxZoom: 21,
    maxNativeZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | <a href="https://www.hotosm.org/" target="_blank">Humanitarian OSM Team</a>',
  });

  // Define dark map theme
  var baseDarkMaps = [CartoDB_DarkVoyage, OpenStreetMap_HOT, esriTiles];
  layerSwitcherLight = L.control.basemaps({
    basemaps: baseDarkMaps,
    tileX: 15,
    tileY: 10,
    tileZ: 5,
  });
  layerSwitcherLight.setPosition("bottomright");

  // Define light map theme
  var baseLightMaps = [CartoDB_Voyager, OpenStreetMap_HOT, esriTiles];
  layerSwitcherDark = L.control.basemaps({
    basemaps: baseLightMaps,
    tileX: 15,
    tileY: 10,
    tileZ: 5,
  });
  layerSwitcherDark.setPosition("bottomright");

  // Set up the map.
  map = new L.map("map", {
    zoom: MAP_INITIAL_ZOOM,
    minZoom: MAP_MIN_ZOOM,
    maxBounds: MAP_MAX_BBOX,
    zoomControl: false,
  });
  // Handle zoom buttons (translate the buttons)
  zoomControl = L.control.zoom({
    zoomOutTitle: TEXTS.mapZoomOut,
    zoomInTitle: TEXTS.mapZoomIn,
  });
  map.addControl(zoomControl);
  // Handle position of map after init
  map.fitBounds(getInitialBBox());
  map.on("moveend", updateBBox);
  // Manage attributions
  map.attributionControl.setPosition("bottomright");
  map.attributionControl.setPrefix('<a href="https://github.com/babastienne" target="_blank">Babastienne</a>');

  // By default add light switcher (override after by themeSwitcher)
  map.addControl(layerSwitcherLight);

  // Create layer to display field of view
  map.createPane("fovPane");
  map.getPane("fovPane").style.zIndex = 450; // Higher than tiles (200) but lower than markers (700)

  let fovLayer = L.vectorGrid
    .protobuf(`${BASE_URL_API}/focus/{z}/{x}/{y}/mean/`, {
      minZoom: 14,
      maxNativeZoom: 16, // Tells Leaflet to stop requesting new tiles after Z16
      maxZoom: 21, // Allows user to zoom in further using scaled Z16 data
      vectorTileLayerStyles: {
        fov_layer: (properties) => {
          const styles = {
            1: { fillColor: "#ff0000", fillOpacity: 0.5, stroke: false, fill: true },
            2: { fillColor: "#ffae00", fillOpacity: 0.4, stroke: false, fill: true },
            3: { fillColor: "#00ff00", fillOpacity: 0.2, stroke: false, fill: true },
          };
          return styles[properties.type] || {};
        },
      },
      pane: "fovPane",
      interactive: true,
      extent: 4096,
      rendererFactory: L.svg.tile,
    })
    .addTo(map);

  // Custom Leaflet Control for Scenario Switching
  const scenarioControl = L.control({ position: "topright" });

  scenarioControl.onAdd = function (map) {
    const div = L.DomUtil.create("div", "leaflet-bar scenario-picker");
    div.style.backgroundColor = "white";
    div.style.padding = "10px";

    div.innerHTML = `
        <label for="scenario-select" style="display:block; font-weight:bold; margin-bottom:5px;">Quality Scenario:</label>
        <select id="scenario-select" style="width: 100%;">
            <option value="best">Scenario 1: Bad Quality</option>
            <option value="mean" selected>Scenario 2: Average Quality</option>
            <option value="worst">Scenario 3: Best Quality</option>
        </select>
    `;

    // Prevent map clicks from passing through the control
    L.DomEvent.disableClickPropagation(div);

    return div;
  };

  scenarioControl.addTo(map);

  // Event listener for the switcher
  document.getElementById("scenario-select").addEventListener("change", function (e) {
    const newScenario = e.target.value;
    const newUrl = `${BASE_URL_API}/focus/{z}/{x}/{y}/${newScenario}/`;

    // Update the VectorGrid layer (this triggers a redraw)
    fovLayer.setUrl(newUrl);
  });

  // LEGEND
  const legend = L.control({ position: "bottomleft" });

  legend.onAdd = function (map) {
    const div = L.DomUtil.create("div", "map_legend info legend");
    const grades = [
      { label: "Identification", color: "#ff0000" },
      { label: "Recognition", color: "#ffae00" },
      { label: "Surveillance", color: "#00ff00" },
    ];

    div.innerHTML = "<h4>FOV Levels</h4>";

    // Loop through our grades and generate a label with a colored square for each interval
    grades.forEach((item) => {
      div.innerHTML += `<i style="background: ${item.color}"></i> ${item.label}<br>`;
    });

    return div;
  };

  legend.addTo(map);

  // Create overlay layer with cameras
  const tilesCams = new L.dataTileLayerCamera(`${BASE_URL_API}/cameras.json?tile={z}/{x}/{y}`, {
    display: true,
  });
  map.addLayer(tilesCams); // Add this layer after initialization because it need to know map to init itself

  // Leaflet locate button
  locateControl = L.control.locate({
    strings: {
      title: TEXTS.mapLocateButton,
    },
  });
  locateControl.addTo(map);
}

// this function check if there is a BBox in local storage (= user already visit the site)
// and if so we retrieve it so the user can see the map as he left it previously
// If there is a hash in url with BBox it is considered prioritary
function getInitialBBox() {
  if (window.location.hash.includes("mapBBox")) {
    let regexBBox = /\[\[\d*.\d+,\d*.\d+\],\[\d*.\d+,\d*.\d+\]\]/g;
    return JSON.parse(window.location.hash.match(regexBBox)[0]);
  } else if (localStorage.getItem("map-bbox")) {
    return JSON.parse(localStorage.getItem("map-bbox"));
  } else {
    return MAP_INITIAL_BBOX;
  }
}

// Function called when user move the map: it updates the local storage with current BBox
function updateBBox() {
  let currentBounds = map.getBounds();
  let stringBBox = `[[${currentBounds.getSouthWest().lat},${currentBounds.getSouthWest().lng}],[${
    currentBounds.getNorthEast().lat
  },${currentBounds.getNorthEast().lng}]]`;
  localStorage.setItem("map-bbox", stringBBox);
  window.location.hash = `mapBBox=${stringBBox}`;
}

initMap();
