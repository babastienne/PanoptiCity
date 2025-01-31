var map;
var plotList;
var plotLayers = [];
var footprintPolygon;
var infoPopup;


// Draw the map for the first time.
function initMap() {
    osmTiles = new L.TileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
            minZoom: 4, 
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> | Babastienne'
        }
    );

    cartoTiles = new L.TileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        {
            minZoom: 4, 
            maxZoom: 21,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attribution">CARTO</a> | Babastienne'
        }
    );
    
    var baseMaps = {
        "OpenStreetMap": osmTiles,
        "Carto": cartoTiles
    };

    // Set up the map.
    map = new L.Map('map');
    map.setView([43.582, 1.451], 14);
    map.zoomControl.setPosition('topleft');
    map.attributionControl.setPosition('bottomright');
    map.addLayer(osmTiles);
    L.control.layers(baseMaps).addTo(map);

    addPlots();
    map.on('moveend', onMapMoved);

    // Leaflet locate button
    L.control.locate().addTo(map);


    // Handle min zoom to optimize queries
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
    infoPopup = L.control.textbox({ position: 'bottomleft' });
}

// Fetch data
async function overpassCall() {
    let result = []
    let bounds = map.getBounds();

    try {
        result = await fetch(
            "https://overpass-api.de/api/interpreter",
            {
                method: "POST",
                body: "data="+ encodeURIComponent(`
                    [out:json]
                    [timeout:25]
                    ;
                    node["man_made"="surveillance"]
                    (
                        ${bounds.getSouth()}, ${bounds.getWest()}, ${bounds.getNorth()}, ${bounds.getEast()}
                    );
                    out geom;
                `)
            },
        ).then(
            (data)=>data.json()
        )
    } catch (error) {
        throw new Error("Error while trying to fetch data from overpass api");
    }

    return result?.elements || result;
}

// Remove all markers from map.
function removeMarkers() {
    for (i=0; i<plotLayers.length; i++) {
        map.removeLayer(plotLayers[i]);
    }
    if (footprintPolygon != null) {
        map.removeLayer(footprintPolygon);
    }
    plotLayers=[];
}

// Things to do when the map has been moved.
function onMapMoved(e) {
    checkDisplay();
}

// Things to do when a marker has been clicked.
function onClick(e) {
    e.target.openPopup();
}

function checkDisplay() {
    if(map.getZoom() > 11) {
        addPlots();
        infoPopup.remove();
    } else {
        removeMarkers();
        infoPopup.addTo(map);
    }
}

async function addPlots() {
    plotList = await overpassCall();
    
    removeMarkers();
    for (i=0; i<plotList.length; i++) {
        var plotLatLng;
        var plotMarker = '';
        
        try {
            plotLatLng = new L.LatLng(plotList[i].lat, plotList[i].lon);
            plotMarker = getPlotMarkerCamera(plotList[i].tags, plotLatLng);
            cameraColor = getColor(plotList[i].tags['surveillance'])
            
            // Get camera height to draw camera's field of view.
            var cameraHeight = getCameraHeight(plotList[i].tags);
            
            // Draw fixed camera's field of view and add it to map.
            var cameraType = plotList[i].tags['camera:type'];
            if (cameraType == 'fixed' || cameraType == 'static') {
                
                // Get camera direction to draw camera's field of view.
                var cameraDirection = getCameraDirection(plotList[i].tags);
                
                if (cameraDirection != null) {
                    // Get camera angle to draw camera's field of view.
                    var cameraAngle = getCameraAngle(plotList[i].tags);
                    
                    // Draw camera's field of view and add it to map.
                    var plotFocus = drawCameraFocusFixed(plotLatLng, plotList[i], cameraDirection, cameraHeight, cameraAngle, cameraColor);
                    map.addLayer(plotFocus);
                    plotLayers.push(plotFocus);
                }
            }
            // Draw dome's field of view and add it to map.
            else if (cameraType == 'dome' ) {
                var plotFocus = drawCameraFocusDome(plotLatLng, cameraHeight, cameraColor);
                map.addLayer(plotFocus);
                plotLayers.push(plotFocus);
            }
            
            // Add camera details to camera marker.
            addCameraDetailsData(plotMarker, plotList[i]);
        } catch(e) {
        }

        if (plotMarker !== '') {
            map.addLayer(plotMarker);
            plotLayers.push(plotMarker);
        }
    }
}

function getColor(plotSurveillanceType) {
    if (plotSurveillanceType == 'public') {
        return 'red';
    } else if (plotSurveillanceType == 'indoor' ) {
        return 'green';
    } else if (plotSurveillanceType == 'outdoor' ) {
        return 'blue';
    }
    return 'black'

}

// Add camera icon.
function getPlotMarkerCamera(plot, plotLatLng) {
    // Get icon name for current camera or guard: fixed, dome, guard
    // var iconName = 'fixed';
    var iconName = 'cam';
    if (plot['camera:type'] == 'fixed') {
        iconName = 'fixed';
    } else if (plot['camera:type'] == 'panning') {
        iconName = 'panning';
    } else if (plot['camera:type'] == 'dome') {
        iconName = 'dome';
    } else if (plot['surveillance:type'] == 'guard') {
        iconName = 'guard';
    }

    /* Add postfix for cameras and guards according to their location:
    Red (public outdoor areas), Blue (private outdoor areas), Green (indoor) */
    var type = plot['surveillance'];
    if (type == 'public') {
        iconName = iconName + 'Red';
    } else if (type == 'indoor' ) {
        iconName = iconName + 'Green';
    } else if (type == 'outdoor' ) {
        iconName = iconName + 'Blue';
    }
    
    // Get icon name for current traffic camera
    if (plot['surveillance:type'] == 'ALPR' || type == 'red_light' || type == 'level_crossing' || type == 'speed_camera') {
        iconName = 'traffic';
    }
    
    iconName = iconName + 'Icon';
    plotIcon = eval(iconName); // see leafletembed_icons.js
    return (new L.Marker(plotLatLng, {icon : plotIcon}));
}

// Get camera height.
function getCameraHeight(plot) {
    var cameraHeight = plot['height'];
    if (! isNumeric(cameraHeight)) {
        cameraHeight = 5;
    } else if (cameraHeight < 1.5) {
        cameraHeight = 1.5;
    } else if (cameraHeight > 12) {
        cameraHeight = 12;
    }
    return(cameraHeight);
}

// Get camera direction.
function getCameraDirection(plot) {
    var cameraDirection = plot['camera:direction'];
    if (cameraDirection == null) {
        cameraDirection = plot['direction'];
        if (cameraDirection == null) {
            cameraDirection = plot['surveillance:direction'];
        }
    }
    if (cameraDirection == 'N') {
        cameraDirection = 0;
    } else if (cameraDirection == 'NE') {
        cameraDirection = 45;
    } else if (cameraDirection == 'E') {
        cameraDirection = 90;
    } else if (cameraDirection == 'SE') {
        cameraDirection = 135;
    } else if (cameraDirection == 'S') {
        cameraDirection = 180;
    } else if (cameraDirection == 'SW') {
        cameraDirection = 225;
    } else if (cameraDirection == 'W') {
        cameraDirection = 270;
    } else if (cameraDirection == 'NW') {
        cameraDirection = 315;
    }
    if (cameraDirection !== '' && isNumeric(cameraDirection)) {
        cameraDirection = 90 - cameraDirection;
        if (cameraDirection > 180) {
            cameraDirection -= 360
        } else if (cameraDirection < -180) {
            cameraDirection += 360;
        }
        cameraDirection = (cameraDirection * 207986.0) / 11916720;
    }
    return(cameraDirection);
}

// Get camera angle.
function getCameraAngle(plot) {
    var cameraAngle = plot['camera:angle'];
    if (cameraAngle != null && isNumeric(cameraAngle)) {
        if (cameraAngle < 0) {
            cameraAngle = -cameraAngle;
        }
        if (cameraAngle <= 15) {
            cameraAngle = 1;
        } else {
            cameraAngle = Math.cos(((cameraAngle - 15) * 207986.0) / 11916720);
        }
    } else {
        cameraAngle = 1;
    }
    return(cameraAngle);
}

// Draw fixed camera focus.
function drawCameraFocusFixed(plotLatLng, plot, cameraDirection, cameraHeight, cameraAngle, cameraColor) {
    var cameraLatLng = [plotLatLng];
    var coefLat = (1.0 / Math.cos(plot.lat * 3.14159 / 180));
    for (a=-5; a<=5; a+=2) {
        var plotLatLng = new L.LatLng(
            parseFloat(plot.lat) + 0.000063 * Math.sin(cameraDirection + a / 10) * cameraHeight * cameraAngle,
            parseFloat(plot.lon) + 0.000063 * Math.cos(cameraDirection + a / 10) * coefLat * cameraHeight * cameraAngle
        );
        cameraLatLng.push(plotLatLng);
    }
    return(new L.Polygon(cameraLatLng, { color: cameraColor, weight: 1, fillOpacity: 0.1 }));
}

// Draw dome focus.
function drawCameraFocusDome(plotLatLng, cameraHeight, cameraColor) {
    return(new L.Circle(plotLatLng, 7 * cameraHeight, { color: cameraColor, weight: 1, fillOpacity: 0.1 }));
}

// Add camera popup to camera marker.
function addCameraDetailsData(plotMarker, plot) {
    popupDataTable = '<table class="popup-content">'
    + '<tr><td>id</td><td><a href="https://www.openstreetmap.org/node/' + (plot.id) + '">' + (plot.id) + '</a></td></tr>'
    // + '<tr><td>user osm</td><td>' + (plot.userid) + '</td></tr>'
    + '<tr><td>latitude</td><td>' + (plot.lat) + '</td></tr>'
    + '<tr><td>longitude</td><td>' + (plot.lon) + '</td></tr>';
    for (x in plot.tags) {
        if (plot.tags[x] !== '' && x != 'multi' && x != 'id' && x != 'userid' && x != 'lat' && x != 'lon') {
            popupDataTable = popupDataTable + '<tr><td>' + x + '</td><td>';
            var descr = plot.tags[x];
            if (descr.substr(0, 4) == 'http') {
                var suffix = descr.slice(-3).toLowerCase();
                if (suffix == 'jpg' || suffix == 'gif' || suffix == 'png') {
                    popupDataTable = popupDataTable + '<a href="' + descr + '"><img alt="Link" src="' + descr + '" width="200"/></a>';
                } else {
                    popupDataTable = popupDataTable + '<a href="' + descr + '">Link</a>';
                }
            } else {
                popupDataTable = popupDataTable + plot.tags[x];
            }
            popupDataTable = popupDataTable + '</td></tr>';
        }
    }
    popupDataTable = popupDataTable +'</table>';
    
    plotMarker.bindPopup(popupDataTable, {autoPan:false, maxWidth:400});
    
    plotMarker.on('click', onClick);
}

function isNumeric(s) {
    var intRegex = /^\d+$/;
    var floatRegex = /^((\d+(\.\d *)?)|((\d*\.)?\d+))$/;
    return ((intRegex.test(s) || floatRegex.test(s)));
}

initMap()
