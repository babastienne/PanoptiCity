async function getCameraDetails(idCamera) {
  const url = `${BASE_URL_API}/cameras/${idCamera}.json`;
  try {
    let response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error(error.message);
  }
}

async function displayCameraDetails(e) {
  // Function called onClick on a camera Marker
  idCamera = e.target.options.id;
  let cameraDetails = await getCameraDetails(idCamera);
  addCameraDetailsData(e.target, cameraDetails);
}

// Add camera popup to camera marker.
function addCameraDetailsData(plotMarker, plot) {
  let { lat, lng } = plotMarker.getLatLng();
  let listAttributes = [];
  popupDataTable = `<div class="pico modal-div">
  <table class="pico modal-table">
      <thead>
        <tr>
          <th>Camera id</th>
          <th>
              <a target="blank" href="https://www.openstreetmap.org/node/${plot.id}">${plot.id}</a>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>latitude</td><td>${lat}</td>
        </tr>
        <tr>
          <td>longitude</td><td>${lng}</td>
        </tr>`;
  for (x in plot) {
    if (!["", "null"].includes(String(plot[x])) && !["id"].includes(x)) {
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
      listAttributes.push(x);
    }
  }
  popupDataTable = popupDataTable + "</tbody></table>";
  if (OSM.isLoggedIn()) {
    if (
      listAttributes.length < 6 ||
      (["fixed", "panning"].includes(plot["camera_type"]) && listAttributes < 8)
    ) {
      popupDataTable =
        popupDataTable +
        `
        <div class="modal-flex-buttons">
          <button
              class="outline primary modal-button"
              onclick="completeExistingCameraMissingAttributes(${plot.id})"
          >${TEXTS.completeCameraButton}</button>
        </div>
      `;
    }
  }

  popupDataTable = popupDataTable + "</div>";
  cancelCameraCreation();
  updateBottomModalContent(popupDataTable);
  showBottomModal();
}
