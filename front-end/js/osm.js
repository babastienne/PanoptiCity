OSM.configure({ apiUrl: "https://master.apis.dev.openstreetmap.org" });

async function fetchOSMNode() {
  let p = await OSM.getFeature("way", 23906749);
  console.log(p);
  console.log("It doesn't work with sandbox server, that's ok");
}

async function OSMLogin() {
  OSM.login({
    mode: "popup",
    clientId: CLIENT_ID_OSM_APP,
    redirectUrl: `${DOMAIN_NAME}/land.html`,
    scopes: ["write_api", "openid", "write_notes"],
    // see the type definitions for other options
  })
    .then(() => {
      console.log("User is now logged in!");
    })
    .catch(() => {
      console.log("User cancelled the login, or there was an error");
    });

  await OSM.authReady;
  // you can check if a user is logged in using
  let connected = OSM.isLoggedIn();

  console.log(connected);
}
