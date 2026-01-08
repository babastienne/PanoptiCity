import { activeCameraId } from "./camera.js";

export const DataTileLayer = L.GridLayer.extend({
  includes: L.Evented.prototype,

  url: null,
  _abortControllers: {}, // Track controllers per tile

  // Layers and tracking
  markersLayer: null, // Standard LayerGroup replacing MarkerClusterGroup
  displayedCamerasList: null, // Set to prevent duplicates across tiles
  createCameraIcon: null, // Function to create icon
  oms: null, // Overlapping Marker Spiderfier instance

  initialize(url, options) {
    this.url = url;
    this.onCameraClick = options.onCameraClick;
    this.createCameraIcon = options.createCameraIcon;
    this.displayedCamerasList = new Set();
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

    this.oms.addListener("click", this.onCameraClick);

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
    var url = L.Util.template(this.url, coords);

    // Handle abortion of request in case of tile removing
    const key = this._tileCoordsToKey(coords);
    const controller = new AbortController();
    this._abortControllers[key] = controller;

    // Use fetch for modern implementation
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        // If the map moved/zoomed while we were fetching, DISCARD this data.
        if (!this._map || coords.z !== this._map.getZoom()) {
          return;
        }
        this._processData(data, coords.z);
        done(null, tile);
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          // Silent catch for intended cancellations
          return;
        }
        console.error("Error loading tile data", err);
        done(err, tile);
      })
      .finally(() => {
        delete this._abortControllers[key];
      });

    return tile;
  },

  _processData(responseData, zoom) {
    // Extra safety: double check zoom again before looping
    if (zoom !== this._map.getZoom()) return;

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
      const isSelected = camera.id === activeCameraId;
      let icon = this.createCameraIcon(camera.marker);
      const marker = L.marker(latlng, {
        icon: icon,
        id: camera.id,
      });

      if (isSelected) {
        // We use a small timeout to ensure Leaflet has finished
        // putting the element in the DOM
        setTimeout(() => {
          if (marker._icon) marker._icon.classList.add("active-marker");
        }, 10);
      }

      this.oms.addMarker(marker);

      marker.addTo(this.markersLayer);
      this.displayedCamerasList.add(camera.id);
    } catch (e) {
      console.error(`Error displaying camera ${camera.id}`, e);
    }
  },

  _removeTile(key) {
    if (this._abortControllers[key]) {
      this._abortControllers[key].abort();
      delete this._abortControllers[key];
    }
    L.GridLayer.prototype._removeTile.call(this, key);
  },

  _clearLayers() {
    // Abort all pending fetches
    Object.values(this._abortControllers).forEach((c) => c.abort());
    this._abortControllers = {};
    // Clean everything
    this.markersLayer.clearLayers();
    this.displayedCamerasList.clear();

    if (this.oms) {
      this.oms.clearMarkers();
    }
  },
});

export const dataTileLayerCamera = (url, options) => {
  return new DataTileLayer(url, options);
};
