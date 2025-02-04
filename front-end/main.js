var map;

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
        '&copy; CNES, Distribution Airbus DS, &copy; Airbus DS, &copy; PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> | <a href="https://github.com/babastienne" target="_blank">Babastienne</a>',
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
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
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
  });
  map.attributionControl.setPosition("bottomright");
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
    "http://localhost:8000/api/cameras.json?tile={z}/{x}/{y}",
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

// Things to do when a marker has been clicked.
function onClick(e) {
  e.target.openPopup();
}

// Add camera popup to camera marker.
function addCameraDetailsData(plotMarker, plot) {
  popupDataTable =
    `<table class="popup-content"><tr><td>id</td><td>` +
    `<a href="https://www.openstreetmap.org/node/${plot.id}">${plot.id}</a>` +
    `</td></tr>` +
    `<tr><td>latitude</td><td>${plot.lat}</td></tr>` +
    `<tr><td>longitude</td><td>${plot.lon}</td></tr>`;
  for (x in plot) {
    if (
      !["", "null"].includes(String(plot[x])) &&
      ![
        "multi",
        "id",
        "userid",
        "lat",
        "lon",
        "color",
        "marker",
        "focus",
      ].includes(x)
    ) {
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

  plotMarker.on("click", onClick);
}

initMap();
