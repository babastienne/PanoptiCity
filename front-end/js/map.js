var map;
var layerSwitcherLight;
var layerSwitcherDark;

function initMap() {
  var esriTiles = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      maxNativeZoom: 19,
      maxZoom: 21,
      attribution:
        'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community | <a href="https://github.com/babastienne" target="_blank">Babastienne</a>',
      label: "Satellite",
    }
  );

  var CartoDB_DarkMatter = L.tileLayer(
    "//{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    {
      maxNativeZoom: 19,
      maxZoom: 21,
      subdomains: "abcd",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a> | <a href="https://github.com/babastienne" target="_blank">Babastienne</a>',
    }
  );

  var CartoDB_Voyager = L.tileLayer(
    "//{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | &copy; <a href="https://carto.com/attributions">CARTO</a> | <a href="https://github.com/babastienne" target="_blank">Babastienne</a>',
      subdomains: "abcd",
      maxZoom: 20,
      label: "Map",
    }
  );

  // Define dark map theme
  var baseDarkMaps = [CartoDB_DarkMatter, esriTiles];
  layerSwitcherLight = L.control.basemaps({
    basemaps: baseDarkMaps,
    tileX: 15,
    tileY: 10,
    tileZ: 5,
  });
  layerSwitcherLight.setPosition("bottomright");

  // Define light map theme
  var baseLightMaps = [CartoDB_Voyager, esriTiles];
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
  });
  map.fitBounds(getInitialBBox());
  map.on("moveend", updateBBox);
  map.attributionControl.setPosition("bottomright");
  map.attributionControl.setPrefix(false);

  // By default add light switcher (override after by themeSwitcher)
  map.addControl(layerSwitcherLight);

  // Create overlay layer with cameras
  const tilesCams = new L.dataTileLayerCamera(
    `${BASE_URL_API}/cameras.json?tile={z}/{x}/{y}`,
    {
      // minZoom: 4,
      display: true,
    }
  );
  // const overlayMaps = {
  //   Cameras: tilesCams,
  // };
  map.addLayer(tilesCams); // Add this layer after initialization because it need to know map to init itself

  // Leaflet locate button
  L.control.locate().addTo(map);
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
