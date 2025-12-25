---
title: Data import and management
nav_order: 2
parent: Architecture
---

# Data import and management
{: .no_toc }


## Table of contents
{: .no_toc .text-delta }

- TOC
{:toc}

---

This document provides a high-level overview of PanoptiCity's data import and management system, including the strategies, components, and workflows for synchronizing surveillance camera data from OpenStreetMap (OSM). 

---

## Import strategy overview

PanoptiCity implements two distinct data import strategies that differ in how building geometries are stored and accessed during FOV (Field of View) calculations.

### Local buildings mode

In this mode, building geometries from OpenStreetMap are permanently stored in the `cameras_building` table using `osm2pgsql`. Camera FOV calculations query this local database, enabling fast updates but requiring significant storage space.

**Characteristics:**

* Full building database stored locally in PostGIS
* Faster camera updates (no external API calls)
* Larger database footprint (depends on geographic coverage)
* Uses `load_cameras` management command for updates
* Suitable for production environments with ample storage

{: .note }
This strategy is recommanded for low instances (small areas like countries or cities). It is heavier on the disk but way faster.

### Overpass API mode

In this mode, the `cameras_building` table remains empty. For each camera update, the system queries the Overpass API to fetch only the buildings needed for that specific camera's FOV calculation. Buildings are temporarily stored during processing and then dropped.

**Characteristics:**

* Minimal database storage (no persistent building data)
* Slower camera updates (external API calls per camera)
* Requires reliable internet connection to Overpass API
* Uses `update_cameras_with_api` management command
* Suitable for resource-constrained environments

{: .note }
This strategy is recommanded for large instances (entire worls areas, or continents) or very small servers. It is lighter on the disk but way slower.

---

## System architecture

```mermaid
flowchart TD

OSM_PBF["OpenStreetMap<br>PBF Files"]
OSM_DIFF["OSM Replication<br>Diff Files (.osc.gz)"]
Overpass["Overpass API<br>Building Queries"]
pyosmium["pyosmium-get-changes<br>Diff Fetching"]
osm2pgsql["osm2pgsql<br>Building Import"]
buildings_lua["buildings.lua<br>Flex Configuration"]
load_cameras["load_cameras<br>Parallel Import"]
update_api["update_cameras_with_api<br>Overpass Integration"]
camera_creation["camera_creation.py<br>Batch Processing"]
process_batch["process_camera_batch()<br>Worker Function"]
create_camera["create_camera()<br>Camera Object Factory"]
PostGIS["PostGIS Database"]
camera_table["cameras_camera"]
focus_table["cameras_camerafocus"]
tags_table["cameras_cameratags"]
building_table["cameras_building"]
tile_table["cameras_tile"]
nginx_cache["Nginx Cache"]
purge_utils["purge_camera_tiles()<br>purge_focus_tiles()"]

pyosmium -.-> load_cameras
pyosmium -.-> update_api
Overpass -.->|"Temporary Buildings"| building_table

subgraph subGraph5 ["Cache Layer"]
    nginx_cache
    purge_utils
end

subgraph subGraph4 ["Database Layer"]
    PostGIS
    camera_table
    focus_table
    tags_table
    building_table
    tile_table
end

subgraph subGraph3 ["Processing Layer"]
    camera_creation
    process_batch
    create_camera
end

subgraph subGraph2 ["Django Management Commands"]
    load_cameras
    update_api
end

subgraph subGraph1 ["Import Tools"]
    pyosmium
    osm2pgsql
    buildings_lua
    osm2pgsql -.->|"Updates"| buildings_lua
end

subgraph subGraph0 ["External Data Sources"]
    OSM_PBF
    OSM_DIFF
    Overpass
end
```

This diagram illustrates the complete data import pipeline, showing how data flows from external OSM sources through various import tools and processing layers into the database, with nginx cache invalidation occurring as a final step.

---

## Cache invalidation strategy

A strong cache strategy is used to help serving faster results during production phase.

All import operations must therefore invalidate Nginx cache entries for affected map tiles to ensure users see updated camera data immediately.

```mermaid
flowchart TD

CameraUpdate["Camera Updated<br>or Created"]
GetCameraTiles["get_containing_tiles()<br>Z=4 to Z=21"]
GetFocusTiles["get_tiles_for_polygon()<br>FOV polygon extent"]
CameraPurge["purge_camera_tiles()<br>GET with X-Purge-Token"]
FocusPurge["purge_focus_tiles()<br>Per scenario/level"]
CameraJSON["/api/cameras.json?tile=z/x/y"]
DetailJSON["/api/cameras/{id}.json"]
FocusEndpoint["/api/focus/z/x/y/{scenario}/"]
NginxCache["Nginx Cache<br>PURGE Operation"]

CameraUpdate -.-> GetCameraTiles
CameraUpdate -.-> GetFocusTiles
GetCameraTiles -.-> CameraPurge
GetFocusTiles -.-> FocusPurge
CameraPurge -.-> CameraJSON
CameraPurge -.-> DetailJSON
FocusPurge -.-> FocusEndpoint
CameraJSON -.-> NginxCache
DetailJSON -.-> NginxCache
FocusEndpoint -.-> NginxCache
```

This diagram represents the cache purging machanism.

The system uses HTTP GET requests with a special `X-Purge-Token` header to trigger Nginx cache invalidation:
