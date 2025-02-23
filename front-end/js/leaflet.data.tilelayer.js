(function () {
  L.dataTileLayer = L.GridLayer.extend({
    includes: L.Evented.prototype,

    url: null,
    displayedFocusList: null,
    displayedCamerasList: null,
    displayCameras: null,
    displayCamerasFocus: null,
    MIN_ZOOM_TO_DISPLAY_FOCUS: null,
    markersCluster: null,

    initialize(url, options) {
      // Function called one time when creating our object
      this.url = url;
      this.MIN_ZOOM_TO_DISPLAY_FOCUS = 17;
      this.displayedFocusList = [];
      this.displayedCamerasList = [];
      this.displayCameras = false;
      this.displayCamerasFocus = false;
      L.GridLayer.prototype.initialize.call(this, options);
      this.markersCluster = L.markerClusterGroup({
        disableClusteringAtZoom: 16,
        spiderfyOnMaxZoom: false,
        removeOutsideVisibleBounds: true,
      });
    },

    onAdd() {
      // Called when layer is added to the map
      map.on("zoomend", this._onZoomAnim.bind(this));
      let currentMapZoom = map.getZoom();
      if (currentMapZoom >= this.MIN_ZOOM_TO_DISPLAY_FOCUS) {
        this.displayCamerasFocus = true;
      } else {
        this.displayCamerasFocus = false;
      }
      if (!this.displayCameras && localStorage.length) {
        // If there is nothing currently displayed on map and something in local storage
        this._displayAllCameras(); // Then we display it
        map.addLayer(this.markersCluster); // We add the layer containing cameras position (+ cluster management)
      }
      this.displayCameras = true;
      L.GridLayer.prototype.onAdd.call(this, map);
    },

    onRemove(map) {
      // Called when layer is removed from map
      map.removeLayer(this.markersCluster);
      for (i = 0; i < this.displayedFocusList.length; i++) {
        map.removeLayer(this.displayedFocusList[i]); // We remove the focus from map
      }
      this.displayedFocusList = []; // We re-init the displayed focus list
      L.GridLayer.prototype.onRemove.call(this, map);
    },

    createTile(coords, done) {
      // Called each time a tile is created / called
      var tile = L.DomUtil.create("div", "leaflet-tile");
      var url = this._expandUrl(this.url, coords);
      // if (localStorage.getItem(this._generateCoordsString(coords))) {
      //   // Tile already in cache so already displayed
      //   done(null, tile);
      // } else {
      this._ajaxRequest(
        "GET",
        url,
        this._updateCache.bind(this, done, coords, tile)
      );
      // }
      return tile;
    },

    // INTERNAL METHODS
    _ajaxRequest: function (method, url, callback) {
      // Function handling api requests. Called by createTile method.
      let request = new XMLHttpRequest();
      request.open(method, url, true);
      request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
          let response = JSON.parse(request.responseText);
          callback(response); // Callback function is '_updateCache'
        }
      };
      request.send();
      return request;
    },

    _updateCache: function (done, coords, tile, responseData) {
      // localStorage.setItem(this._generateCoordsString(coords), "-");  // Store seen tile coordinates in localStorge
      for (let i = 0; i < responseData.length; i++) {
        let cameraInLocalStorage = localStorage.getItem(
          `data-${responseData[i].id}`
        );
        if (this.displayCameras) {
          this._displayCamera(responseData[i]);
        }
        if (
          responseData[i]?.focus &&
          !JSON.parse(cameraInLocalStorage)?.focus
        ) {
          // If there is focus in the response and no focus currently stored in localStorage for this camera
          // Basically we store every camera detail with focus but not cameras with only points
          localStorage.setItem(
            `data-${responseData[i].id}`,
            JSON.stringify(responseData[i])
          );
          if (this.displayCamerasFocus) {
            this._displayFocus(responseData[i]);
          }
        }
      }
      if (!map.hasLayer(this.markersCluster)) {
        map.addLayer(this.markersCluster);
      }
      done(null, tile);
    },

    _displayCamera(camera) {
      let plotLatLng;
      let plotMarker = "";
      if (!this.displayedCamerasList.includes(camera.id)) {
        // Only if not already displayed
        try {
          plotLatLng = new L.LatLng(camera.lat, camera.lon);
          // Add camera icon
          plotMarker = new L.Marker(plotLatLng, {
            icon: eval(camera.marker + "Icon"),
            id: camera.id,
          });
          // Add camera details to camera marker.
          plotMarker.on("click", displayCameraDetails);
          if (plotMarker !== "") {
            this.markersCluster.addLayer(plotMarker);
            // We add displayed cameras to the temporary list
            this.displayedCamerasList.push(camera.id);
          }
        } catch (e) {
          console.error(
            `Error while trying to display the camera ${camera.id}`
          );
        }
      }
    },

    _displayFocus(camera) {
      try {
        // Draw fixed camera's field of view and add it to map.
        if (camera.focus != null && this.displayCamerasFocus) {
          // Only if focus exists for the camera and if able to display it
          // Draw camera's field of view and add it to map.
          var plotFocus = new L.Polygon(camera.focus, {
            color: camera.color,
            weight: 1,
            fillOpacity: 0.1,
          });
          map.addLayer(plotFocus);
          this.displayedFocusList.push(plotFocus);
        }
      } catch (e) {
        console.error(
          `Error while trying to display the focus of camera ${camera.id}`
        );
      }
    },

    _displayAllCameras: function () {
      // Function called to display all cameras in LocalStorage
      for (let i = 0; i < localStorage.length; i++) {
        if (localStorage.key(i).substring(0, 4) == "data") {
          let camera = JSON.parse(localStorage.getItem(localStorage.key(i)));
          this._displayCamera(camera);
          // When we display all cameras we always try to display also the focus
          this._displayFocus(camera);
        }
      }
    },

    _displayAllFocus: function () {
      // Called to display all focus of cameras in local storage
      // This function is called when cameras are already displayed but not their associated focus
      for (let i = 0; i < localStorage.length; i++) {
        if (localStorage.key(i).substring(0, 4) == "data") {
          let camera = JSON.parse(localStorage.getItem(localStorage.key(i)));
          // When we display all cameras we always try to display also the focus
          this._displayFocus(camera);
        }
      }
    },

    _onZoomAnim: function (e) {
      let currentMapZoom = map.getZoom();
      if (
        this.displayCamerasFocus &&
        currentMapZoom < this.MIN_ZOOM_TO_DISPLAY_FOCUS
      ) {
        // If we currently display camera focus and the zoom is below minimum for displaying focus
        for (let i = 0; i < this.displayedFocusList.length; i++) {
          map.removeLayer(this.displayedFocusList[i]); // Then we remove the focus from map (if there is some)
        }
        this.displayedFocusList = []; // We re-init the displayed focus list
        this.displayCamerasFocus = false;
      }
      if (
        (this.options.maxZoom && currentMapZoom > this.options.maxZoom) || // If map zoom if greater than maxZoom
        (this.options.minZoom && currentMapZoom < this.options.minZoom) // Or if map zoom is lower than minZoom
      ) {
        map.removeLayer(this.markersCluster);
        for (let i = 0; i < this.displayedFocusList.length; i++) {
          map.removeLayer(this.displayedFocusList[i]); // And we also remove their focus
        }
        this.displayedFocusList = []; // We re-init the displayed focus list
        this.displayCameras = false;
        this.displayCamerasFocus = false;
      } else {
        if (!this.displayCameras && localStorage.length) {
          // If there is nothing currently displayed on map and something in local storage
          map.addLayer(this.markersCluster); // Then we display the cameras / cluster
          this.displayCameras = true; // We store we can display cameras
        }
        if (currentMapZoom >= this.MIN_ZOOM_TO_DISPLAY_FOCUS) {
          // when zoom is less than 16 the focus can't be seen so we avoid displaying it to save performances
          this.displayCamerasFocus = true;
          if (!this.displayedFocusList.length && localStorage.length) {
            this._displayAllFocus(); // If there is no focus currently displayed on map and something in local storage, we display it
          }
        }
      }
    },

    // UTILS FUNCTIONS
    _expandUrl: function (template, coords) {
      let url = L.Util.template(template, coords);
      url += coords.z >= this.MIN_ZOOM_TO_DISPLAY_FOCUS ? "&focus=1" : "";
      return url;
    },

    _generateCoordsString: function (coords) {
      return `${coords.z}/${coords.x}/${coords.y}`;
    },
  });

  L.dataTileLayerCamera = function (url, options) {
    return new L.dataTileLayer(url, options);
  };
})();
