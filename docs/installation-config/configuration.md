---
title: Configuration
parent: Installation and configuration
nav_order: 2
---

# Configuration

Somes parameters can be changed to customize your instance.

## Basic configuration

### Map settings

When launching the website, by default the view will set you to Paris and you will be able to navigate everywhere in the world. you can edit this by updating the file `front-end/CONFIG.js`, especially the *Map configuration* section.

```js
export const MAP_INITIAL_CENTER = [48.8566, 2.3522]; // LatLng object (see: https://leafletjs.com/reference.html#latlng)
export const MAP_MAX_BBOX = [
  [-90, -180],
  [90, 180],
]; // If set, the user can't go out of this bbox on the map
export const MAP_INITIAL_ZOOM = 11;
export const MAP_MIN_ZOOM = 3;
```

The variables `MAP_INITIAL_CENTER` and `MAP_INITIAL_ZOOM` will define the initial viewbox when the user first visit the site (currently set to Paris).

The variables `MAP_MAX_BBOX` and `MAP_MIN_ZOOM` will force the user to stay in the delimited area and not outside. Usefull if you want to display only data for a specific place (country, city, etc.).

#### Map layers

It is currently not possible to easily configure the layers of the project. It is not difficult to improve and a contribution is welcome on this subject.

If you really want to change the layers you should edit them in two places : `front-end/src/js/map.js` and `front-end/src/js/sidebar.js`.

### .env

During the installation process, a .env file is generated and fill with values (domain name, database credentials, etc.).

**If you want to edit the env settings, you can manually edit the `.env` file a the root of the project.**

This is the list of used variables :

```
POSTGRES_DB
POSTGRES_USER
POSTGRES_PASSWORD
POSTGRES_PORT
BACKEND_DOMAIN_NAME
FRONTEND_DOMAIN_NAME
CLIENT_ID_OSM_APP
UPDATE_WITH_OVERPASS
CERTBOT_EMAIL
REPLICATION_SERVER_URL
# -- Do not edit secret keys after the install --
SECRET_KEY
NGINX_CACHE_SECRET_KEY
```

## Translations

Every content displayed in the website is translated. The website currently support only English and French but feel free to contribute with other languages if you can.

All translations are stored into `front-end/translations.js`. You can edit any existing key with a new value if you want, you just need to keep the keys identical (the order is not important).

If you want to add another language the easiest is to duplicated the `en` section, and add it at the end of the `TRANSLATIONS` object. You can then change the `en` to the language code of your choice and edit the keys accordingly. If you don't translate everything the website with fallback to the english version for the missing key.

If you want to edit the menu, all related translations are located into the sub-object `menuContent`.

The website automatically detect the browser or system language of the user and display the language corresponding if it exists, otherwise english by default.

If you want to add a new language for the website and are a bit lost feel free to reach for help and assistance.

## Advanced configuration

In both the front-end and the back-end some constants are defined (for the scenarios parameters, the values to parse or to display in the forms, etc.). 

It is not required to edit those files but if you want to customize more deeply the application you can.

### Backend

For the backend you should edit the `back-end/cameras/constants.py` file.

The main attributes are :
- `MAX_CLUSTER_ZOOM`: define the zoom level at which the map stop to display clusters and displays instead all cameras (default: 15)
- The fields values for cameras attributes: cannot be changed without complete re-install.
- The mathematical constants used for scenarios and field of view computation: will be applied to new computations only. If you want the changes to be applied to all cameras you'll need to re-import them.

### Frontend

For the frontend, two files contains configuration values.

#### Menu configuration

The file `front-end/src/js/menu/menuConfig.js` contains the entire dynamic configuration for the burger menu of the website. By editing this sections you can remove menu entries, add new ones, change the content, etc. It is the place to change the "editorial" sections of the website.

The good practice is to use translationKeys and put the translated content into the `translations.js` file.

#### Camera configuration

The file `front-end/src/js/cameraConfig.js` contains :
- `levelsCameraConfiguration`: the graphic configuration of fields of view displayed when clicking on a camera detail (color, opacity, etc.)
- Every step detail for the camera creation form. It is possible to edit images, attributes names, add other attributes to the form, etc.

## Updating the project after modifications

If you ave modified any backend or env configuration file, you'll need to rebuild the project for the modifications to be taken into consideration. To do so you need to run :

```bash
make stop   # Only if your instance was up and running
make build  # Will recreate the buld of the backend application
make start  # Retard the application
```

If you only modified a front-end configuration file the change will be made instantly without having to reload the application. You only need to refresh your browser.
