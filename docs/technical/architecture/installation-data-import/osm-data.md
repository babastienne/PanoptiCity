---
title: Data from OpenStreetMap
nav_order: 2
parent: Data import and management
---

# OpenStreetMap data usage
{: .no_toc }


## Table of contents
{: .no_toc .text-delta }

- TOC
{:toc}

---

## OpenStreetMap objects and tags used in PanoptiCity

PanoptiCity imports **surveillance cameras** and **buildings** from OpenStreetMap to compute camera fields of view. The project extracts camera nodes tagged with `man_made=surveillance` and building polygons for FOV calculations.

### Objects imported

**Cameras**: OSM nodes with the `man_made=surveillance` tag

**Buildings**: OSM ways and relations with `building` tag (excluding `building=roof`)

### Camera tags used

The project processes these OSM tags for cameras:

**Core camera properties**:
- `camera:type` - Camera type (fixed, dome, panning, panorama)
- `camera:mount` - Mount type (wall, pole, ceiling, etc.)
- `camera:direction` - Viewing direction in degrees
- `camera:angle` - Tilt angle of the camera
- `height` or `ele` - Camera height in meters

**Surveillance information**:
- `surveillance:type` - Type of surveillance (camera, ALPR)
- `surveillance` - Surveillance context (indoor, outdoor, public, etc.)
- `surveillance:zone` - Area being monitored (traffic, town, entrance, etc.)
- `surveillance:direction` - Alternative direction tag

**Metadata tags**:
- `operator` - Entity operating the camera
- `source` - Data source
- `name` - Camera name
- `addr:street` - Street address
- `contact:webcam` - Webcam URL
- `check_date`, `survey:date` - Last verification dates

### Information storage

All OSM tags are preserved in the database through the `CameraTags` model, ensuring no data is lost during import. The camera's OSM node ID becomes the primary key in the database, and the location is stored as a Point geometry.

For buildings only the geometry is used and the dabase is regularly flushed to save storage.

## Notes

The project uses a sophisticated tag normalization system to handle various input formats for direction, angle, and height values, converting them to standardized numeric values for FOV computation. Buildings are imported selectively based on their intersection with camera fields of view to optimize database size and computation performance.
