OSM.configure({ apiUrl: OSM_API_URL });

var userIsConnected;

async function fetchOSMNode() {
  let p = await OSM.getFeature("way", 23906749);
  console.log(p);
  console.log("It doesn't work with sandbox server, that's ok");
}

async function OSMLogin() {
  let button = document.getElementById("loginButton");
  button.title = TEXTS.inProgressLabel;
  button.innerHTML = TEXTS.inProgressLabel;
  button.ariaBusy = true;
  OSM.login({
    mode: "popup",
    clientId: CLIENT_ID_OSM_APP,
    redirectUrl: `${DOMAIN_NAME}/land.html`,
    scopes: ["write_api", "openid", "write_notes"],
  })
    .then(() => {
      checkIfUserConnected();
    })
    .catch(() => {
      console.log("User cancelled the login, or there was an error");
      checkIfUserConnected();
    });

  await OSM.authReady;
}

checkIfUserConnected = () => {
  userIsConnected = OSM.isLoggedIn();
  let buttonLogin = document.getElementById("loginButton");
  let latteralButtons = document.getElementById("latteralButtons");
  if (userIsConnected) {
    buttonLogin.ariaBusy = false;
    buttonLogin.innerHTML = TEXTS.logoutButtonName;
    buttonLogin.title = TEXTS.logoutButtonTitle;
    buttonLogin.onclick = () => {
      OSM.logout();
      checkIfUserConnected();
    };
    buttonLogin.classList.remove("secondary");
    buttonLogin.classList.add("danger");
    latteralButtons.innerHTML = creationCameraButton;
  } else {
    buttonLogin.ariaBusy = false;
    buttonLogin.innerHTML = TEXTS.loginButtonName;
    buttonLogin.title = TEXTS.loginButtonTitle;
    buttonLogin.onclick = OSMLogin;
    buttonLogin.classList.remove("danger");
    buttonLogin.classList.add("secondary");
    latteralButtons.innerHTML = "";
  }
};

createCamera = async (camera) => {
  camera.type = "node";
  camera.id = -1; // Negative ID for new features
  camera.uid = -1;
  camera.changeset = -1;
  camera.timestamp = "";
  camera.user = "";
  camera.version = 0;

  console.log(camera);

  let p = await OSM.uploadChangeset(
    { created_by: "PanoptiCity", comment: "Adding a new camera" },
    { create: [camera], modify: [], delete: [] }
  );

  console.log(p);
};

checkIfUserConnected();
