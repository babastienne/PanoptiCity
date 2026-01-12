# CHANGELOG

All notable changes to this project will be documented in this file. This project adheres to **[SemVer](https://semver.org/)**.

---

## [1.0.0] - 2026-01-12 - 🚀 First release

- **Stability**: Reached the first stable production milestone.
- **💫 Improvements**:
    - Major improvements to map navigation for smartphone users (touch-friendly interactions).
    - Add editorial content for website to use as "user manual".
- **✨ Feature**: Add a new loop_pdate command installed by CRON to ensure good upgrades of data
- **🏗️ Maintenance**:
    - Added a **restart policy** for docker containers to ensure high availability.
    - Optimized Python requirements and environment variables.
- **🐛 Bug fixes**: 
    - Fixed SSL certificate generation workflow.
    - Fixed directory mounting in docker to enable proper log creation.
    - Fixed a critical loop exit bug that occurred while waiting for file changes.
- **📝 Documentation**: 
    - Finalize documentation missing documentation sections (architecture)
    - Add screenshots to README
    - Updated documentation for the update section
    - Finalized performance metrics and planet-scale deployment guides.

---

## [0.8.0] - 2026-01-11 - 🎨 Major UI/UX overhaul

- **✨ Features**:
    - **Refactored header & menu**: Complete visual redesign of the navigation system.
    - **New login flow**: Moved login to a popup in the top right; now fetches the OSM username of the connected user.
    - **Dynamic menu**: Implemented `menuConfig` allowing for complex views (images, accordions, titles) via a new `contentRenderer`.
- **💫 Improvements**:
    - Migrated editorial content from README to internal translated website pages.
    - Split translations into smaller, manageable chunks.
- **🐛 Bug fixes**:
    - Fixed a regression that incorrectly labeled ALPR cameras as having missing attributes.
    - Fixed FOV level display order (z-index) to ensure correct visibility.
    - Reset scroll position when switching between different modals.

---

## [0.7.0] - 2026-01-06 - 🗺️ Vector tiles & search

- **✨ Features**:
    - **Vector tiles**: Integrated backend support for vector tiles (zooms 14-16) to display Field of Views (FOV) scenarios.
    - **Search**: Added a search bar powered by **Nominatim** to find locations globally.
    - **Welcome modal**: Added a popup for new users upon their first visit.
- **💫 Improvements**:
    - **Iconography**: Complete refresh of map icons and simplified color schemes.
    - **Map interaction**: Added "auto-centering" when clicking on objects and "click-outside" logic to close modals.
    - **Performance**: Switched to a more robust Overpass instance to bypass API limitations.
- **🏗️ Maintenance**: Handled camera deletion logic when updating the master database.

---

## [0.6.0] - 2025-12-30 - ♻️ Architecture modernization

- **Refactor**: Huge migration from traditional script loading to **ES modules**.
- **💫 Improvements**:
    - Frontend server now serves as a fallback for nginx configurations.
    - Localized dependencies in `packages/` instead of fetching from remote CDNs.
- **🐛 Bug fixes**: Fixed bugs related to map location storage and URL parsing.

---

## [0.5.0] - 2025-12-17 - ⚡ Performance & scalability

- **✨ Features**:
    - **QuadTiles**: Implemented a QuadKey-based spatial grid to optimize building lookups.
    - **Multiprocessing**: Added parallel processing support for loading cameras, adapting automatically to the CPU core count.
- **⚡ Performances**:
    - **SQL optimization**: **Reduced SQL requests by 10x and execution time by 50% using a new ratio-comparison algorithm for collision detection.**
    - **Bulk operations**: Implemented bulk updates for `CameraFocus`, `CameraTags`, and `Cameras`.
    - **Caching**: Added a sophisticated nginx caching strategy with invalidation support.
- **🐛 Bug fixes**: Fixed `Self-intersection` errors in GEOS and corrected QuadTile border calculations.

---

## [0.4.0] - 2025-02-27 - 📐 Advanced FOV modeling

- **✨ Features**:
    - **Multi-scenario FOV**: Added zones for *Identification*, *Recognition*, and *Observation*.
    - **PWA support**: Added Progressive Web App manifest to allow installation on mobile devices.
    - **Visual editing**: Users can now set camera direction by rotating a marker directly on the map.
- **💫 Improvements**:
    - **Indoor logic**: FOV for indoor cameras no longer bleeds through exterior walls.
    - **Panning cameras**: Added specific iconography and FOV logic for rotating/panning cameras.
- **🎨 Style**: Improved dark mode visibility by applying CSS filters to map tile layers.

---

## [0.3.0] - 2025-02-14 - 🤝 OSM community integration

- **✨ Features**:
    - **OSM OAuth**: Implemented full login/logout flow via OpenStreetMap.
    - **Contribution forms**: Created a first version of the camera contribution form (direction, angle, sliders).
    - **Internationalization (i18n)**: Built a translation mechanism into the frontend.
- **📝 Documentation**: Major update to installation procedures and todo lists.
- **🐛 Bug fixes**: Resolved bugs in theme management and local storage history.

---

## [0.2.0] - 2025-02-10 - 🏗️ Project foundation & docker

- **✨ Features**:
    - **Renaming**: Project officially rebranded.
    - **License**: Adopted the **CNPLv7+ license**.
    - **Dockerization**: Full containerization of Django, PostgreSQL/PostGIS, and `osm2pgsql`.
- **🎨 Style**:
    - Added the first version of the side-menu (burger menu).
    - Initial dark mode implementation.
- **💫 Improvements**: Switched building import procedure to use `osm2pgsql` for better handling of complex geometries.

---

## [0.1.0] - 2025-01-31 - 🚀 First version

- **Initial MVP**:
    - Core Python logic for calculating FOV against building limits.
    - Spatial database structure (PostgreSQL/PostGIS).
    - Clustering logic for displaying large datasets fluently.
    - TMS management for backend requests.
    - Basic local storage caching for performance.