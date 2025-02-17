// -- Back-end configuration --
const BASE_URL_API = "https://api.panopticity.fr/api";

// -- OpenStreetMap App configuration (for contributions) --
const OSM_API_URL = "https://api.openstreetmap.org";
const CLIENT_ID_OSM_APP = "JXdkNYv_vIMAMdFMW6sobS2gZI-aIw8mDdk6gwHmxWM";
const DOMAIN_NAME = "https://panopticity.fr";

// -- Map configuration --
const MAP_INITIAL_BBOX = [
  [51.48138, 9.45922],
  [42.11452, -5.7019],
]; // LatLngBounds object (see: https://leafletjs.com/reference.html#latlngbounds)
const MAP_MAX_BBOX = [
  [55.71473, 16.17187],
  [37.03763, -14.15039],
]; // If set, the user can't go out of this bbox on the map
const MAP_INITIAL_ZOOM = 9;
const MAP_MIN_ZOOM = 6;
