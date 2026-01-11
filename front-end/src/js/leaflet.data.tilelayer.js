import { activeCameraId } from "./camera.js";

export const DataTileLayer = L.GridLayer.extend({
  options: {
    // MOBILE OPTIMIZATIONS:
    updateInterval: 200,    // Wait 200ms after move before fetching
    edgeBufferTiles: 1,     // Pre-load 1 tile around the viewport for smooth panning
    className: 'gpu-accelerated-layer'
  },

  initialize(url, options) {
    this.url = url;
    this.onCameraClick = options.onCameraClick;
    this.createCameraIcon = options.createCameraIcon;

    this.markersLayer = L.layerGroup();

    // Trackings
    this._loadedDataTiles = new Set();    // Tracks which "x:y:z" are loaded
    this._tileMarkers = new Map();        // Maps tileKey -> Array of marker objects
    this._abortControllers = new Map();   // Maps tileKey -> AbortController

    // This tracks how many tiles are currently "claiming" a specific marker ID
    // This prevents the "missing neighbor" glitch
    this._markerReferenceCount = new Map();
    this._idToMarkerMap = new Map();

    L.setOptions(this, options);
    L.GridLayer.prototype.initialize.call(this, options);
  },

  onAdd(map) {
    this.markersLayer.addTo(map);
    this.oms = new OverlappingMarkerSpiderfier(map, {
      keepSpiderfied: true, // Keep markers spread out after one is clicked
      nearbyDistance: 25, // Pixel radius to consider markers "overlapping"
      legWeight: 3, // Weight in px of the line going to the point
    });
    this.oms.addListener("click", this.onCameraClick);
    L.GridLayer.prototype.onAdd.call(this, map);
  },

  createTile(coords, done) {
    const tile = L.DomUtil.create("div", "leaflet-tile");
    const tileKey = this._tileCoordsToKey(coords);

    if (this._loadedDataTiles.has(tileKey)) {
      L.Util.requestAnimFrame(done);
      return tile;
    }

    // Use AbortController as requested
    const controller = new AbortController();
    this._abortControllers.set(tileKey, controller);

    const url = L.Util.template(this.url, coords);

    fetch(url, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (!this._map) return;

        const markersForThisTile = [];

        data.forEach((item) => {
          // Handle Clusters vs Cameras
          const isCluster = !!item.count;
          const uniqueId = isCluster
            ? `cluster-${item.lat}-${item.lon}`
            : `cam-${item.id}`;

          // Increment reference count for this ID
          const count = (this._markerReferenceCount.get(uniqueId) || 0) + 1;
          this._markerReferenceCount.set(uniqueId, count);

          let marker;
          if (count === 1) {
            // First time seeing this ID? Create the marker
            marker = isCluster ? this._drawCluster(item, coords.z) : this._drawCamera(item);
            this._idToMarkerMap.set(uniqueId, marker);
          } else {
            // Already on map? Just reference the existing one
            marker = this._idToMarkerMap.get(uniqueId);
          }

          if (marker) {
            markersForThisTile.push({ id: uniqueId, marker: marker });
          }
        });

        this._tileMarkers.set(tileKey, markersForThisTile);
        this._loadedDataTiles.add(tileKey);
        done(null, tile);
      })
      .catch((err) => {
        if (err.name !== "AbortError") done(err, tile);
      })
      .finally(() => {
        this._abortControllers.delete(tileKey);
      });

    return tile;
  },

  _drawCluster(cluster, zoom) {
    const latlng = [cluster.lat, cluster.lon];
    const count = cluster.count;
    const sizeClass = count < 10 ? "small" : count < 100 ? "medium" : "large";

    const marker = L.marker(latlng, {
      icon: L.divIcon({
        html: `<div><span>${count}</span></div>`,
        className: `marker-cluster marker-cluster-${sizeClass}`,
        iconSize: [40, 40],
      }),
    });

    marker.on("click", () => {
      this._map.setView(latlng, zoom + 2, { animate: true });
    });

    marker.addTo(this.markersLayer);
    return marker;
  },

  _drawCamera(camera) {
    const latlng = [camera.lat, camera.lon];
    const isSelected = camera.id === activeCameraId;
    const icon = this.createCameraIcon(camera.marker);
    const marker = L.marker(latlng, { icon, id: camera.id });

    // CSS Hardware Acceleration for Mobile
    if (marker.options.icon.options) {
        marker.options.icon.options.className += ' leaf-device-optim';
    }

    if (isSelected) {
      setTimeout(() => {
        if (marker._icon) marker._icon.classList.add("active-marker");
      }, 10);
    }

    this.oms.addMarker(marker);
    marker.addTo(this.markersLayer);
    return marker;
  },

  _removeTile(key) {
    // Abort fetch if still pending
    if (this._abortControllers.has(key)) {
      this._abortControllers.get(key).abort();
      this._abortControllers.delete(key);
    }

    // Cleanup markers using reference counting
    const tileData = this._tileMarkers.get(key);
    if (tileData) {
      tileData.forEach(({ id, marker }) => {
        const count = this._markerReferenceCount.get(id) - 1;

        if (count <= 0) {
          // No more visible tiles contain this marker, safe to remove
          this.oms.removeMarker(marker);
          this.markersLayer.removeLayer(marker);
          this._markerReferenceCount.delete(id);
          this._idToMarkerMap.delete(id);
        } else {
          // Other tiles still show this marker, just decrement the count
          this._markerReferenceCount.set(id, count);
        }
      });
      this._tileMarkers.delete(key);
    }

    this._loadedDataTiles.delete(key);
    L.GridLayer.prototype._removeTile.call(this, key);
  },

  onRemove(map) {
    this._clearLayers();
    map.removeLayer(this.markersLayer);
    L.GridLayer.prototype.onRemove.call(this, map);
  },

  _clearLayers() {
    this._abortControllers.forEach((c) => c.abort());
    this._abortControllers.clear();
    this.markersLayer.clearLayers();
    this._loadedDataTiles.clear();
    this._tileMarkers.clear();
    this._markerReferenceCount.clear();
    this._idToMarkerMap.clear();
    if (this.oms) this.oms.clearMarkers();
  }
});

export const dataTileLayerCamera = (url, options) => {
  return new DataTileLayer(url, options);
};
