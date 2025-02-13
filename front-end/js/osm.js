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
  let button = document.getElementById("loginButton");
  if (userIsConnected) {
    button.ariaBusy = false;
    button.innerHTML = TEXTS.logoutButtonName;
    button.title = TEXTS.logoutButtonTitle;
    button.onclick = () => {
      OSM.logout();
      checkIfUserConnected();
    };
    button.classList.remove("secondary");
    button.classList.add("danger");
  } else {
    button.ariaBusy = false;
    button.innerHTML = TEXTS.loginButtonName;
    button.title = TEXTS.loginButtonTitle;
    button.onclick = OSMLogin;
    button.classList.remove("danger");
    button.classList.add("secondary");
  }
};

checkIfUserConnected();
