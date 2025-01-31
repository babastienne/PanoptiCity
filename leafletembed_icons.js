/* Label with number of composite cameras. */
var compositeCamerasIcon = L.icon({
  iconUrl: 'images/icon.png',
  iconSize: [0, 0],
  iconAnchor: [0, 0],
  labelAnchor: [-6, 0]
});

/* Gray icons for non-specific cameras and guards. */
var camIcon = L.icon({
  iconUrl: 'images/cam.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

var fixedIcon = L.icon({
  iconUrl: 'images/fixed.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

var panningIcon = L.icon({
  iconUrl: 'images/panning.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

var domeIcon = L.icon({
  iconUrl: 'images/dome.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

var guardIcon = L.icon({
  iconUrl: 'images/guard.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

var trafficIcon = L.icon({
  iconUrl: 'images/traffic.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

/* Blue icons for outdoor cameras and guards.
    Those cameras and guards surveil only private, i.e. non-public areas. */
var camBlueIcon = L.icon({
  iconUrl: 'images/camBlue.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

var fixedBlueIcon = L.icon({
  iconUrl: 'images/fixedBlue.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

var panningBlueIcon = L.icon({
  iconUrl: 'images/panningBlue.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

var domeBlueIcon = L.icon({
  iconUrl: 'images/domeBlue.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

var guardBlueIcon = L.icon({
  iconUrl: 'images/guardBlue.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

/* Green icons for indoor cameras and guards. */
var camGreenIcon = L.icon({
  iconUrl: 'images/camGreen.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

var fixedGreenIcon = L.icon({
  iconUrl: 'images/fixedGreen.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

var panningGreenIcon = L.icon({
  iconUrl: 'images/panningGreen.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

var domeGreenIcon = L.icon({
  iconUrl: 'images/domeGreen.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

var guardGreenIcon = L.icon({
  iconUrl: 'images/guardGreen.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

/* Red icons for outdoor cameras and guards.
    Those cameras and guards surveil public, i.e. non-private areas. */
var camRedIcon = L.icon({
  iconUrl: 'images/camRed.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

var fixedRedIcon = L.icon({
  iconUrl: 'images/fixedRed.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

var panningRedIcon = L.icon({
  iconUrl: 'images/panningRed.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

var domeRedIcon = L.icon({
  iconUrl: 'images/domeRed.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

var guardRedIcon = L.icon({
  iconUrl: 'images/guardRed.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

/* Gray-yellow icons for non-specific cameras and guards marked with a 'fixme' key. */
var todo_camIcon = L.icon({
  iconUrl: 'images/todo_cam.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

var todo_fixedIcon = L.icon({
  iconUrl: 'images/todo_fixed.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

var todo_panningIcon = L.icon({
  iconUrl: 'images/todo_panning.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

var todo_domeIcon = L.icon({
  iconUrl: 'images/todo_dome.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

var todo_guardIcon = L.icon({
  iconUrl: 'images/todo_guard.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

var todo_trafficIcon = L.icon({
  iconUrl: 'images/todo_traffic.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

/* Blue-yellow icons for outdoor cameras and guards marked with a 'fixme' key.
    Those cameras and guards surveil only private, i.e. non-public areas. */
var todo_camBlueIcon = L.icon({
  iconUrl: 'images/todo_camBlue.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

var todo_fixedBlueIcon = L.icon({
  iconUrl: 'images/todo_fixedBlue.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

var todo_panningBlueIcon = L.icon({
  iconUrl: 'images/todo_panningBlue.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

var todo_domeBlueIcon = L.icon({
  iconUrl: 'images/todo_domeBlue.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

var todo_guardBlueIcon = L.icon({
  iconUrl: 'images/todo_guardBlue.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

/* Green-yellow icons for indoor cameras and guards marked with a 'fixme' key. */
var todo_camGreenIcon = L.icon({
  iconUrl: 'images/todo_camGreen.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

var todo_fixedGreenIcon = L.icon({
  iconUrl: 'images/todo_fixedGreen.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

var todo_panningGreenIcon = L.icon({
  iconUrl: 'images/todo_panningGreen.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

var todo_domeGreenIcon = L.icon({
  iconUrl: 'images/todo_domeGreen.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

var todo_guardGreenIcon = L.icon({
  iconUrl: 'images/todo_guardGreen.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

/* Red-yellow icons for outdoor cameras and guards marked with a 'fixme' key.
    Those cameras and guards surveil public, i.e. non-private areas. */
var todo_camRedIcon = L.icon({
  iconUrl: 'images/todo_camRed.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

var todo_fixedRedIcon = L.icon({
  iconUrl: 'images/todo_fixedRed.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

var todo_panningRedIcon = L.icon({
  iconUrl: 'images/todo_panningRed.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

var todo_domeRedIcon = L.icon({
  iconUrl: 'images/todo_domeRed.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});

var todo_guardRedIcon = L.icon({
  iconUrl: 'images/todo_guardRed.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor : [0, -10]
});
