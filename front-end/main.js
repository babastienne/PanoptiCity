var map;

// Draw the map for the first time.
function initMap() {
  osmTiles = new L.TileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      minZoom: 4,
      maxNativeZoom: 19,
      maxZoom: 21,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> | <a href="https://github.com/babastienne" target="_blank">Babastienne</a>',
    }
  );

  var esriTiles = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      maxNativeZoom: 19,
      maxZoom: 21,
      attribution:
        '&copy; <a href="https://doc.arcgis.com/en/data-appliance/latest/maps/world-imagery.htm" targer="_blank">Esri</a> | <a href="https://github.com/babastienne" target="_blank">Babastienne</a>',
    }
  );

  cartoTiles = new L.TileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
    {
      minZoom: 4,
      maxZoom: 21,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | &copy; <a href="https://carto.com/attribution">CARTO</a> | <a href="https://github.com/babastienne" target="_blank">Babastienne</a>',
    }
  );

  var baseMaps = {
    OpenStreetMap: osmTiles,
    Satellite: esriTiles,
    Carto: cartoTiles,
  };

  const tiles_cams = new L.dataTileLayerCamera(
    "http://localhost:8000/api/cameras.json?tile={z}/{x}/{y}",
    {
      minZoom: 13,
      display: true,
    }
  );

  const overlayMaps = {
    Cameras: tiles_cams,
  };

  // Set up the map.
  map = new L.map("map", {
    center: [43.60139, 1.440207],
    zoom: 16,
  });
  map.zoomControl.setPosition("topleft");
  map.attributionControl.setPosition("bottomright");
  L.control.layers(baseMaps, overlayMaps).addTo(map);
  map.addLayer(osmTiles); // Add this layer after initialization because it need to know map to init itself
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
