## Installation

Thank you for your interest in this project. This section will guide you to facilitate the installation, configuration and run of the project on your server.

If you encounter any problem feel free to [open an issue](http://TODO.org) to ask for support.

### Download the project and requirements

To run this application you'll need docker.

1. If not done already, [install docker](https://docs.docker.com/engine/install/) on the server.
2. Download this project : `git clone https://github.com/babastienne/TODO`
3. Go to the downloaded folder : `cd TODO`

### Initialize database

Define some variables used by the application by editing environment variables :

- `cp .env.dist .env`
- Then edit the `.env` file and replace the variables values by the ones you want to use.

It is now time to launch the project for the first time :

1. Initialize the database by running `docker compose run --rm postgis`. When you see `database system is ready to accept connections` you can exit by doing `ctr+c` (should not take more than a few seconds).
2. Then create the database structure by applying Django migration. To do so run: `docker compose run --rm web ./manage.py migrate`

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

<!-- This mechanism is fundamental for this project to work. In the following sections we will need two files to work with:

- One data file, in pbf format (usually formated as `<region>.osm.pbf`)
- One sequence state file, in txt format (usually formated as `<region>.state.txt`) -->

We will refer at your downloaded pbf file as `<my-pbf-file>` and in the next commands.

#### Steps to import data

1. Download both your desired pbf and state files and put them in the `osm-data` folder. (_If you want to use sample data you can skip this step_)

2. Import the buildings in the database (can take some time depending of your area) by running the following command:

```
   docker compose run osm2pgsql -O flex -S /data/buildings.lua /data/osm-data/<my-pbf-file>
```

3. Load cameras (usually takes more time than the previous command):

```
   docker compose run --rm web ./manage.py load_cameras /osm-data/<my-pbf-file>
```

#### Steps to update the cameras

- Generate your state file from your original data file. To do so run the command: `docker compose run --rm web pyosmium-get-changes -O /osm-data/<my-pbf-file> -f /osm-data/sequence.state.txt -v`. It will create a state file in `osm-data/sequence.state.txt`.

> After this step, if you don't want to update your buildings in the future and want to save some space on your server you can download your original data file.

- This last command should have prompted something an URL on the terminal. Probably in the format `INFO: Using replication server at <URL_OF_THE_REPLICATION_SERVER>` This is the URL that will be used to get diffs. Copy it and then you can run the following lines to update your cameras (replace with your url):

1. `docker compose run --rm web pyosmium-get-changes --server <URL_OF_THE_REPLICATION_SERVER> -f /osm-data/sequence.state.txt -o /osm-data/diff.osc.gz` > This command creates a diff file (the file `osm-data/diff.osc.gz`) that contains every differences between the original data file and the last version of OSM data on the replication server. The command also edit the sequence.state.txt file to update the sequence number with the last version fetched on the server.
2. `docker compose run --rm web ./manage.py load_cameras -d -u /osm-data/diff.osc.gz` > This command updates the camera database with the differences.
3. (Optionnal) the `osm-data/diff.osc.gz` can be removed. It will otherwise be overwrite next time so this is not mandatory.

> Note: If you want to stay up to date, the last three commands can easily by put into a bash script and then launched regularly with a cron depending of your update frequency (minute, hour, day). The file `update-cameras.sh` is an example of something that can be done to automatize the process (it could be improved with log monitoring).

#### Steps to update the buildings

> Because of the volume of the building database, we recommand not to update those objects too often. The process consist of completely reloading the database from scratch so it is time consuming and therefore need to be done only occasionaly.

> To update your building database without having to completely re-download your data, you need to keep on your server your original data file. This file well be updated by the process.

1. `docker compose run --rm web pyosmium-up-to-date /osm-data/<my-pbf-file>` > This command will fetch the diffs since the last version of your file and apply them to your data file. This command can take some time depending of the last time you did the operation.
2. Re-create the building database : `docker compose run osm2pgsql -O flex -S /data/buildings.lua /data/osm-data/<my-pbf-file>`
3. (Option) Re-compute camera field of views (can be long) :

```
   docker compose run --rm web ./manage.py shell
   > from cameras.models import Camera
   > for elem in Camera:
   > elem.save()
   >
   > # This operation will be long
   >
   > exit()
   exit
```

We don't recommand to automatize this operation.
