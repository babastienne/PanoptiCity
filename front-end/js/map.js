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

  var CartoDB_DarkVoyage = L.tileLayer(
    "//{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    {
      maxNativeZoom: 20,
      maxZoom: 21,
      subdomains: "abcd",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | &copy; <a href="https://carto.com/attributions">CARTO</a>',
      className: "dark-map-tiles",
      label: "Map",
    }
  );

  var CartoDB_Voyager = L.tileLayer(
    "//{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxNativeZoom: 20,
      maxZoom: 21,
      label: "Map",
    }
  );

  var OpenStreetMap_HOT = L.tileLayer(
    "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
    {
      maxZoom: 21,
      maxNativeZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | <a href="https://www.hotosm.org/" target="_blank">Humanitarian OSM Team</a>',
    }
  );

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
  map.attributionControl.setPrefix(
    '<a href="https://github.com/babastienne" target="_blank">Babastienne</a>'
  );

  // By default add light switcher (override after by themeSwitcher)
  map.addControl(layerSwitcherLight);

  // Create overlay layer with cameras
  const tilesCams = new L.dataTileLayerCamera(
    `${BASE_URL_API}/cameras.json?tile={z}/{x}/{y}`,
    {
      display: true,
    }
  );
  // const overlayMaps = {
  //   Cameras: tilesCams,
  // };
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
  let stringBBox = `[[${currentBounds.getSouthWest().lat},${
    currentBounds.getSouthWest().lng
  }],[${currentBounds.getNorthEast().lat},${
    currentBounds.getNorthEast().lng
  }]]`;
  localStorage.setItem("map-bbox", stringBBox);
  window.location.hash = `mapBBox=${stringBBox}`;
}

initMap();
