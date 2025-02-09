## Installation

### Install and launch

TODO: Declare variables in .env file

1. Initialize the databse by running `docker compose run --rm postgis`. When you see `database system is ready to accept connections` you can exit by doing `ctr+c` (should not take more than a few seconds).
2. Create the database structure by applying Django migration. To do so run: `docker compose run --rm web ./manage.py migrate`

### Import initial data and update

To import data to your project, you need to download file corresponding to the area you want to cover. This file will be used to import cameras as well as buildings (needed to compute the field of view of each camera). After this initial update you have two options :

1. Keep on your server the original file : it'll be used to replicate future modifications done in OpenStreetMap. Usefull if you want to keep your building database up to date with new modifications.
2. Remove the original file : you'll still have the possiblity to get updates for cameras but not for the buildings.

> By default this project come with sample data so you can follow the import procedure without having to download any file (usefull if you just want to test or develop on the project).

In OpenStreetMap, there is multiple ways of keeping informations up to date. On this project we choose to import data from [PBF files](https://wiki.openstreetmap.org/wiki/PBF_Format). To keep change of the updates we use [diff files](https://wiki.openstreetmap.org/wiki/Planet.osm/diffs) that are generated regularly. It can by : daily / hourly / minutely.

Depending on the frequency of updates you want and the area you wish to cover, you'll need to choose where to download your data file. Few suggestions :

- https://planet.openstreetmap.org/ : Official source with possiblity to keep change daily / hourly / minutely. It is only for the entire planet therefore the file size can be important and the database for buldings may not be able to keep up without good resources.
- https://download.openstreetmap.fr/ : Daily extracts and minutely diffs. Files are splits into continents / countries / states. Very usefull to download specific region and keep up with the changes almost in real time.

You can find an up to date list of mirrors on the [OpenStreetMap dedicated wiki page](https://wiki.openstreetmap.org/wiki/Planet.osm) to explore more options. If you want to keep your data up to date you'll need to find one that handle diffs.

**Steps to import data**

1. Download both pbf and state files (usually formated `<region>.osm.pb` and `<region>.state.txt`) and put them in the `back-end/osm-data` folder. (_If you want to use sample data you can skip this step_)
2. Import the buildings in the database (can take some time) by running the following command:

   docker compose run osm2pgsql -O flex -S /data/buildings.lua /data/osm-data/<my-pbf-file>

3. Load cameras:

   docker compose run --rm web ./manage.py load_cameras /osm-data/<my-pbf-file>

**Steps to configure regularly updates**
