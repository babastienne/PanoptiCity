var map;
const BASE_URL_API = "http://localhost:8000/api";

// Draw the map for the first time.
function initMap() {
  // osmTiles = new L.TileLayer(
  //   "//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  //   {
  //     minZoom: 4,
  //     maxNativeZoom: 19,
  //     maxZoom: 21,
  //     attribution:
  //       '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> | <a href="https://github.com/babastienne" target="_blank">Babastienne</a>',
  //     label: "OpenStreetMap",
  //   }
  // );

  var alidaeTiles = L.tileLayer(
    "//tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.jpg",
    {
      maxNativeZoom: 19,
      maxZoom: 21,
      attribution:
        '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> | <a href="https://github.com/babastienne" target="_blank">Babastienne</a>',
      label: "Satellite",
    }
  );

  // var osmBrightTiles = L.tileLayer(
  //   "//tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.jpg",
  //   {
  //     maxNativeZoom: 19,
  //     maxZoom: 21,
  //     attribution:
  //       '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> | <a href="https://github.com/babastienne" target="_blank">Babastienne</a>',
  //   }
  // );

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

  var baseMaps = [
    CartoDB_Voyager,
    alidaeTiles,
    // osmTiles,
    // osmBrightTiles: osmBrightTiles,
  ];

  // Set up the map.
  map = new L.map("map", {
    center: [43.60139, 1.440207],
    zoom: 16,
    minZoom: 4,
  });
  map.attributionControl.setPosition("bottomright");
  map.attributionControl.setPrefix(false);
  var layerSwitcher = L.control.basemaps({
    basemaps: baseMaps,
    tileX: 15,
    tileY: 10,
    tileZ: 5,
  });
  layerSwitcher.setPosition("bottomright");
  map.addControl(layerSwitcher);
  map.zoomControl.setPosition("topleft");

  // Create overlay layer with cameras
  const tiles_cams = new L.dataTileLayerCamera(
    `${BASE_URL_API}/cameras.json?tile={z}/{x}/{y}`,
    {
      minZoom: 12,
      display: true,
    }
  );
  // const overlayMaps = {
  //   Cameras: tiles_cams,
  // };
  map.addLayer(tiles_cams); // Add this layer after initialization because it need to know map to init itself

  // Leaflet locate button
  L.control.locate().addTo(map);
}

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

// Add camera popup to camera marker.
function addCameraDetailsData(plotMarker, plot) {
  let { lat, lng } = plotMarker.getLatLng();
  popupDataTable =
    `<table class="popup-content"><tr><td>id</td><td>` +
    `<a href="https://www.openstreetmap.org/node/${plot.id}">${plot.id}</a>` +
    `</td></tr>` +
    `<tr><td>latitude</td><td>${lat}</td></tr>` +
    `<tr><td>longitude</td><td>${lng}</td></tr>`;
  for (x in plot) {
    if (!["", "null"].includes(String(plot[x])) && !["id"].includes(x)) {
      popupDataTable = popupDataTable + "<tr><td>" + x + "</td><td>";
      var descr = String(plot[x]);
      if (descr.substring(0, 4) == "http") {
        var suffix = descr.slice(-3).toLowerCase();
        if (suffix == "jpg" || suffix == "gif" || suffix == "png") {
          popupDataTable = `${popupDataTable}<a href="${descr}"><img alt="Link" src="${descr}" width="200"/></a>`;
        } else {
          popupDataTable = `${popupDataTable}<a href="${descr}">Link</a>`;
        }
      } else {
        popupDataTable = popupDataTable + plot[x];
      }
      popupDataTable = popupDataTable + "</td></tr>";
    }
  }
  popupDataTable = popupDataTable + "</table>";
  plotMarker.bindPopup(popupDataTable, { autoPan: false, maxWidth: 400 });
  plotMarker.openPopup();
}

initMap();
