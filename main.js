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
            maxNativeZoom: 19,
            maxZoom: 21,
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
    map.setView([43.5952783, 1.4189609], 19);
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
async function getCameras() {
    let result = []
    let bounds = map.getBounds();

    try {
        result = await fetch(
            `http://localhost:8000/api/cameras.json?in_bbox=${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`
        ).then(
            (data)=>data.json()
        )
        console.log("POINTS");
        console.log(result);
    } catch (error) {
        throw new Error("Error while trying to fetch data from backend");
    }

    return result?.results || result;
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
    plotList = await getCameras();
    // buildings = await getBuildings();
    
    removeMarkers();
    for (i=0; i<plotList.length; i++) {
        var plotLatLng;
        var plotMarker = '';
        
        try {
            plotLatLng = new L.LatLng(plotList[i].lat, plotList[i].lon);
            // Add camera icon
            plotMarker = new L.Marker(plotLatLng, {icon : eval(plotList[i].marker + 'Icon')});
            
            // Draw fixed camera's field of view and add it to map.
            if (plotList[i].focus != null) {
                // Draw camera's field of view and add it to map.
                var  plotFocus = new L.Polygon(plotList[i].focus, { color: plotList[i].color, weight: 1, fillOpacity: 0.1 })
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

// Add camera popup to camera marker.
function addCameraDetailsData(plotMarker, plot) {
    popupDataTable = '<table class="popup-content">'
    + '<tr><td>id</td><td><a href="https://www.openstreetmap.org/node/' + (plot.id) + '">' + (plot.id) + '</a></td></tr>'
    + '<tr><td>latitude</td><td>' + (plot.lat) + '</td></tr>'
    + '<tr><td>longitude</td><td>' + (plot.lon) + '</td></tr>';
    for (x in plot) {
        if (!(['', 'null'].includes(String(plot[x]))) && 
        !(['multi', 'id', 'userid', 'lat', 'lon', 'color', 'marker', 'focus'].includes(x))) {
            popupDataTable = popupDataTable + '<tr><td>' + x + '</td><td>';
            var descr = String(plot[x]);
            if (descr.substr(0, 4) == 'http') {
                var suffix = descr.slice(-3).toLowerCase();
                if (suffix == 'jpg' || suffix == 'gif' || suffix == 'png') {
                    popupDataTable = popupDataTable + '<a href="' + descr + '"><img alt="Link" src="' + descr + '" width="200"/></a>';
                } else {
                    popupDataTable = popupDataTable + '<a href="' + descr + '">Link</a>';
                }
            } else {
                popupDataTable = popupDataTable + plot[x];
            }
            popupDataTable = popupDataTable + '</td></tr>';
        }
    }
    popupDataTable = popupDataTable +'</table>';
    
    plotMarker.bindPopup(popupDataTable, {autoPan:false, maxWidth:400});
    
    plotMarker.on('click', onClick);
}

initMap()
