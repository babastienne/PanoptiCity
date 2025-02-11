var map;
var layerSwitcherLight;
var layerSwitcherDark;

// Draw the map for the first time.
function initMap() {
  // osmTiles = new L.TileLayer("//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  //   minZoom: 4,
  //   maxNativeZoom: 19,
  //   maxZoom: 21,
  //   attribution:
  //     '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> | <a href="https://github.com/babastienne" target="_blank">Babastienne</a>',
  //   label: "OpenStreetMap",
  // });

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
    center: [43.60139, 1.440207],
    zoom: 16,
    minZoom: 4,
  });
  map.attributionControl.setPosition("bottomright");
  map.attributionControl.setPrefix(false);

  // By default add light switcher (override after by themeSwitcher)
  map.addControl(layerSwitcherLight);

  // Create overlay layer with cameras
  const tilesCams = new L.dataTileLayerCamera(
    `${BASE_URL_API}/cameras.json?tile={z}/{x}/{y}`,
    {
      minZoom: 4,
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
