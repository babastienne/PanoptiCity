import { CLIENT_ID_OSM_APP, DOMAIN_NAME } from "../../CONFIG.js";
import { TEXTS } from "./language.js";

export let userIsConnected;

export let OSMLogin = async () => {
  let button = document.getElementById("loginButton");
  button.title = TEXTS.inProgressLabel;
  button.innerHTML = TEXTS.inProgressLabel;
  button.ariaBusy = true;
  OSM.login({
    mode: "popup",
    clientId: CLIENT_ID_OSM_APP,
    redirectUrl: `${DOMAIN_NAME}/src/land.html`,
    scopes: ["write_api", "openid", "write_notes"],
  })
    .then(() => {
      checkIfUserConnected();
    })
    .catch((e) => {
      console.error(e);
      console.log("User cancelled the login, or there was an error");
      checkIfUserConnected();
    });

  await OSM.authReady;
};

export let checkIfUserConnected = () => {
  userIsConnected = OSM.isLoggedIn();
  let buttonLogin = document.getElementById("loginButton");
  if (userIsConnected) {
    buttonLogin.ariaBusy = false;
    buttonLogin.innerHTML = TEXTS.logoutButtonName;
    buttonLogin.title = TEXTS.logoutButtonTitle;
    buttonLogin.onclick = () => {
      logout();
    };
    buttonLogin.classList.remove("secondary");
    buttonLogin.classList.add("danger");
  } else {
    buttonLogin.ariaBusy = false;
    buttonLogin.innerHTML = TEXTS.loginButtonName;
    buttonLogin.title = TEXTS.loginButtonTitle;
    buttonLogin.onclick = OSMLogin;
    buttonLogin.classList.remove("danger");
    buttonLogin.classList.add("secondary");
  }
};

export let logout = () => {
  OSM.logout();
  checkIfUserConnected();
};

export let getCamera = async (id) => {
  let [fetchedCamera] = await OSM.getFeature("node", id);
  console.log(fetchedCamera);
  return fetchedCamera;
};

let cleanObject = (camera) => {
  for (let elem in camera.tags) {
    if (camera.tags[elem] == null) {
      delete camera.tags[elem];
    }
  }
  return camera;
};

export let createCamera = async (camera) => {
  camera.type = "node";
  camera.id = -1; // Negative ID for new features
  camera.uid = -1;
  camera.changeset = -1;
  camera.timestamp = "";
  camera.user = "";
  camera.version = 0;
  camera = cleanObject(camera);

  console.log(camera);

  let p = await OSM.uploadChangeset(
    { created_by: "PanoptiCity", comment: "Adding a new camera" },
    { create: [camera], modify: [], delete: [] }
  );
};

export let updateCamera = async (camera) => {
  camera = cleanObject(camera);
  console.log(camera);
  await OSM.uploadChangeset(
    { created_by: "PanoptiCity", comment: "Editing an existing camera" },
    { create: [], modify: [camera], delete: [] }
  );
};
