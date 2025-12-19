(function () {
  L.dataTileLayer = L.GridLayer.extend({
    includes: L.Evented.prototype,

    url: null,
    MIN_ZOOM_TO_DISPLAY_FOCUS: 16,

    // Layers and tracking
    markersLayer: null, // Standard LayerGroup replacing MarkerClusterGroup
    displayedCamerasList: null, // Set to prevent duplicates across tiles
    displayedFocusList: null, // Array to track polygons
    oms: null, // Overlapping Marker Spiderfier instance

    initialize(url, options) {
      this.url = url;
      this.displayedCamerasList = new Set();
      this.displayedFocusList = [];
      this.markersLayer = L.layerGroup();
      L.GridLayer.prototype.initialize.call(this, options);
    },

    onAdd(map) {
      this.markersLayer.addTo(map);

      this.oms = new OverlappingMarkerSpiderfier(map, {
        keepSpiderfied: true, // Keep markers spread out after one is clicked
        nearbyDistance: 20, // Pixel radius to consider markers "overlapping"
        legWeight: 3, // Weight in px of the line going to the point
      });

      this.oms.addListener("click", displayCameraDetails);

      // Clear markers on zoom to prevent "ghost" clusters from previous zoom levels
      map.on("zoomstart", this._clearLayers.bind(this));
      L.GridLayer.prototype.onAdd.call(this, map);
    },

    onRemove(map) {
      this._clearLayers();
      map.removeLayer(this.markersLayer);
      map.off("zoomstart", this._clearLayers.bind(this));
      L.GridLayer.prototype.onRemove.call(this, map);
    },

    createTile(coords, done) {
      var tile = L.DomUtil.create("div", "leaflet-tile");
      var url = this._expandUrl(this.url, coords);

      // Use fetch for modern implementation
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          this._processData(data, coords.z);
          done(null, tile);
        })
        .catch((err) => {
          console.error("Error loading tile data", err);
          done(err, tile);
        });

      return tile;
    },

    _processData(responseData, zoom) {
      responseData.forEach((item) => {
        if (item.count) {
          this._displayCluster(item, zoom);
        } else {
          this._displayCamera(item, zoom);
        }
      });
    },

    _displayCluster(cluster, zoom) {
      const latlng = L.latLng(cluster.lat, cluster.lon);
      const count = cluster.count;
      const sizeClass = count < 10 ? "small" : count < 100 ? "medium" : "large";

      const clusterMarker = L.marker(latlng, {
        icon: L.divIcon({
          html: `<div><span>${count}</span></div>`,
          className: `marker-cluster marker-cluster-${sizeClass}`,
          iconSize: [40, 40],
        }),
      });

      clusterMarker.on("click", () => {
        this._map.setView(latlng, zoom + 2);
      });

      clusterMarker.addTo(this.markersLayer);
    },

    _displayCamera(camera, zoom) {
      // Prevent duplicates if a camera is on a tile boundary
      if (this.displayedCamerasList.has(camera.id)) return;

      const latlng = L.latLng(camera.lat, camera.lon);

      try {
        const marker = L.marker(latlng, {
          icon: eval(camera.marker + "Icon"),
          id: camera.id,
        });

        this.oms.addMarker(marker);

        marker.addTo(this.markersLayer);
        this.displayedCamerasList.add(camera.id);

        // andle focus display
        if (zoom >= this.MIN_ZOOM_TO_DISPLAY_FOCUS && camera.focus) {
          const focusPolygon = L.polygon(camera.focus, {
            color: camera.color || "red",
            weight: 1,
            fillOpacity: 0.1,
            interactive: false, // Don't block camera clicks
          }).addTo(this._map);

          this.displayedFocusList.push(focusPolygon);
        }
      } catch (e) {
        console.error(`Error displaying camera ${camera.id}`, e);
      }
    },

    _clearLayers() {
      // Clean everything
      this.markersLayer.clearLayers();
      this.displayedCamerasList.clear();

      this.displayedFocusList.forEach((polygon) => {
        this._map.removeLayer(polygon);
      });
      this.displayedFocusList = [];
    },

    _expandUrl(template, coords) {
      let url = L.Util.template(template, coords);
      // Add focus param if high zoom
      if (coords.z >= this.MIN_ZOOM_TO_DISPLAY_FOCUS) {
        url += (url.includes("?") ? "&" : "?") + "focus=1";
      }
      return url;
    },
  });

  L.dataTileLayerCamera = function (url, options) {
    return new L.dataTileLayer(url, options);
  };
})();
