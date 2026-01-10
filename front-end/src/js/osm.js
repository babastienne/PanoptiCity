import { CLIENT_ID_OSM_APP, DOMAIN_NAME, OSM_API_URL } from "../../CONFIG.js";
import { initAuthUI } from "./menu/authComponent.js"; // Import the UI updater

export let userIsConnected = false;
export let currentUserName = "";

const fetchUserDetails = async () => {
  try {
    const token = await OSM.getAuthToken();
    if (!token) return null;

    // We call the standard OSM API endpoint for user details
    const response = await fetch(`${OSM_API_URL}/api/0.6/user/details.json`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Could not fetch user details");

    const data = await response.json();
    return data.user; // Returns { id, display_name, img: { href }, ... }
  } catch (e) {
    console.error("Error fetching OSM user details:", e);
    return null;
  }
};

/**
 * Main initialization check called on app load
 */
export const checkIfUserConnected = async () => {
  userIsConnected = OSM.isLoggedIn();

  if (userIsConnected) {
    try {
      // Fetch user profile to get the username for the popup
      const user = await fetchUserDetails();
      currentUserName = user.display_name;
    } catch (e) {
      console.error("Failed to fetch OSM user details", e);
      currentUserName = "Unknown User";
    }
  } else {
    currentUserName = "";
  }

  // Notify the UI component to update the icons and popups
  initAuthUI(userIsConnected, currentUserName);
};

export const OSMLogin = async () => {
  // Show loading state on all auth triggers (the person icons)
  document.querySelectorAll(".auth-trigger").forEach((btn) => btn.classList.add("loading"));

  OSM.login({
    mode: "popup",
    clientId: CLIENT_ID_OSM_APP,
    redirectUrl: `${DOMAIN_NAME}/src/land.html`,
    scopes: ["openid", "read_prefs", "write_api"],
  })
    .then(async (e) => {
      await checkIfUserConnected();
    })
    .catch((e) => {
      console.error("OSM Login Error:", e);
    })
    .finally(() => {
      document.querySelectorAll(".auth-trigger").forEach((btn) => btn.classList.remove("loading"));
    });

  await OSM.authReady;
};

export const OSMLogout = () => {
  OSM.logout();
  checkIfUserConnected();
};

// --- API WRAPPERS ---

export const getCamera = async (id) => {
  const [fetchedCamera] = await OSM.getFeature("node", id);
  console.log(fetchedCamera);
  return fetchedCamera;
};

const cleanObject = (camera) => {
  for (let elem in camera.tags) {
    if (camera.tags[elem] == null) {
      delete camera.tags[elem];
    }
  }
  return camera;
};

export const createCamera = async (camera) => {
  camera.type = "node";
  camera.id = -1; // Negative ID for new features
  camera.uid = -1;
  camera.changeset = -1;
  camera.timestamp = "";
  camera.user = "";
  camera.version = 0;
  camera = cleanObject(camera);

  await OSM.uploadChangeset(
    { created_by: "PanoptiCity", comment: "Adding a new camera" },
    { create: [camera], modify: [], delete: [] }
  );
};

export const updateCamera = async (camera) => {
  camera = cleanObject(camera);
  console.log(camera);
  await OSM.uploadChangeset(
    { created_by: "PanoptiCity", comment: "Editing an existing camera" },
    { create: [], modify: [camera], delete: [] }
  );
};
