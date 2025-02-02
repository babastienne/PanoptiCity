(function() {

    L.dataTileLayer = L.GridLayer.extend({

        includes: L.Evented.prototype,

        url: null,
        map: null,
        dataCache: null,
        tileCache: null,
        plotLayers: null,
        infoPopup: null,
        displayCameras: null,

        initialize(url, options) {
            this.url = url;
            this.dataCache = new Map();
            this.tileCache = {};
            this.plotLayers = [];
            this.displayCameras = true;
            L.GridLayer.prototype.initialize.call(this, options);

            // Create info minZoom popup
            L.Control.textbox = L.Control.extend({
                onAdd: function(map) { 
                    var text = L.DomUtil.create('div');
                    text.id = "minZoomRequired";
                    text.innerHTML = "Trop éloigné ! Zoomer pour afficher le contenu"
                    return text;
                },
                onRemove: function(map) {
                    // Nothing to do here
                }
            });
            L.control.textbox = function(opts) { return new L.Control.textbox(opts);}
            this.infoPopup = L.control.textbox({ position: 'bottomleft' });
        },

        createTile(coords, done) {
            var tile = L.DomUtil.create('div', 'leaflet-tile');
            var url = this._expandUrl(this.url, coords);
            if (this.tileCache[coords]) {
                // Tile already in cache so already displayed
                done(null, tile);
            } else {
                this._ajaxRequest('GET', url, this._updateCache.bind(this, done, coords, tile));
            }
            return tile;
        },

        _displayCamera(camera) {
            var plotLatLng;
            var plotMarker = '';
                
            try {
                plotLatLng = new L.LatLng(camera.lat, camera.lon);
                // Add camera icon
                plotMarker = new L.Marker(plotLatLng, {icon : eval(camera.marker + 'Icon')});
                
                // Draw fixed camera's field of view and add it to map.
                if (camera.focus != null) {
                    // Draw camera's field of view and add it to map.
                    var  plotFocus = new L.Polygon(camera.focus, { color: camera.color, weight: 1, fillOpacity: 0.1 })
                    this.map.addLayer(plotFocus);
                    this.plotLayers.push(plotFocus);
                }
            
                // Add camera details to camera marker.
                addCameraDetailsData(plotMarker, camera);
            } catch(e) {
            }

            if (plotMarker !== '') {
                this.map.addLayer(plotMarker);
                this.plotLayers.push(plotMarker);
            }
        },

        onAdd() {
            map.on('zoomend', this._onZoomAnim.bind(this));
            L.GridLayer.prototype.onAdd.call(this, map);
            this.map = map;
            if(!this.plotLayers.length && this.dataCache.size) {
                this.dataCache.forEach((value, _) => {
                    this._displayCamera(value)
                });
            }
        },

        onRemove(map) {
            map.on('zoomend', this._onZoomAnim.bind(this));
            for (i=0; i<this.plotLayers.length; i++) {
                map.removeLayer(this.plotLayers[i]);
            }
            this.plotLayers=[];
            L.GridLayer.prototype.onRemove.call(this, map);
        },

        _expandUrl: function(template, coords) {
            return L.Util.template(template, coords);
        },

        _updateCache: function(done, coords, tile, responseData) {
            this.tileCache[coords] = true;
            for(let i = 0; i < responseData.length; i++) {
                if(!this.dataCache.has(responseData[i].id)) {
                    this.dataCache.set(responseData[i].id, responseData[i]);
                    if(this.displayCameras) {
                        this._displayCamera(responseData[i]);
                    }
                }
            }
            done(null, tile)
        },

        _ajaxRequest: function(method, url, callback) {
            var request = new XMLHttpRequest();
            request.open(method, url, true);
            request.onreadystatechange = function() {
                if (request.readyState === 4 && request.status === 200) {
                    response = JSON.parse(request.responseText);
                    callback(response.results);
                    if(response.next) {
                        request.open(method, response.next, true);
                        request.send()
                    }
                }
            };
            request.send();
            return request;
        },

        _onZoomAnim: function (e) {
            var zoom = map.getZoom();
            if ((this.options.maxZoom && zoom > this.options.maxZoom) ||
                (this.options.minZoom && zoom < this.options.minZoom)) {
                for (i=0; i<this.plotLayers.length; i++) {
                    map.removeLayer(this.plotLayers[i]);
                }
                this.plotLayers=[];
                this.infoPopup.addTo(map);
                this.displayCameras = false;
            } else {
                this.infoPopup.remove();
                this.displayCameras = true;
                if(!this.plotLayers.length && this.dataCache.size) {
                    this.dataCache.forEach((value, _) => {
                        this._displayCamera(value)
                    });
                }
            }
        }
    });

    L.dataTileLayerCamera = function (url, options) {
        return new L.dataTileLayer(url, options);
    };

})();