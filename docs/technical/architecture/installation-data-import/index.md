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

The initial import and the continuous updates use different strategies to get the buildings needed by FOV (Field of View) calculations.

### Initial import

`osm2pgsql` imports into the `cameras_building` table the buildings located near cameras (see [Initial setup & camera loading](install-architecture.md)). Once every focus is computed, the table is truncated to keep the database small.

### Continuous updates

The `replication` service (`replicate_cameras` command) follows OSM minutely diffs. Only new or moved cameras, and cameras whose focus-related tags changed, need buildings. They are requested from a **buildings provider** for the camera's largest possible focus, inserted in `cameras_building` inside the camera's transaction, used for the computation, and deleted before commit.

* `overture`: OSM buildings of the monthly Overture Maps release, read from GeoParquet files on S3. No local storage.
* `local`: the install extract, kept up to date with OSM diffs and cut with `osmium extract`. No third-party service.

If the provider is unavailable, the camera is saved with a focus without buildings and retried later (`buildings_pending`). See [Update the database](../../../installation-config/update.md) for details.

---

## System architecture

```mermaid
flowchart TD

OSM_PBF["OpenStreetMap<br>PBF Files"]
OSM_DIFF["OSM Replication<br>Diff Files (.osc.gz)"]
Provider["Buildings provider<br>Overture / local extract"]
pyosmium["pyosmium<br>Diff Fetching"]
osm2pgsql["osm2pgsql<br>Building Import"]
buildings_lua["buildings.lua<br>Flex Configuration"]
load_cameras["load_cameras<br>Parallel Import"]
update_api["replicate_cameras<br>Replication service"]
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
Provider -.->|"Temporary Buildings"| building_table

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
    Provider
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
