---
title: Update the database
parent: Installation and configuration
nav_order: 3
---

# Update the database

After the installation, a sequence file has been created in the `osm-data` folder. It contains the url of the server to ask for updates and the last modification sequence of the imported file. Using this sequence file, we are able to fetch for new modifications.

The entire processus is automatic, you just need to call the command `make update` and it will execute a script to do it. The script will get the last modifications from OpenStreetMap and will then parse it to fin any CCTV modification to import into the database.

If a modification is found, it will fetch nearby buildings to be able to compute field of view.

The recommandation is to launch an auto-update on a regular basis. Depending on your needs you can run it every day, every hour or every couple of minutes. If you want to install a CRON that auto-run an update of your database you can run `make install_update`. It will start an infinite loop to follow OSM modifications and upgrade your database. The script will auto-start on system reboot. The auto-update logs are stored in `$PROJECT_DIR/replication.log`.

It is recommanded to use this script because it will automatically fetch modifications from server and update the sequence state. In the background it will call the backend command `update_cameras_with_api` that will insert modification into the database.

If you really want to run this command without using the script (not recommanded), this is the documentation of the command that you can call using `docker compose run --rm web update_cameras_with_api` : 


<details markdown="block" title="Update command documentation"><sumary>Update command documentation</sumary>

```
usage: manage.py update_cameras_with_api [-h] [--details] [--log-file LOG_FILE] [--ignore-prompt] [--version]
                                         camera_file

Update cameras from osm file, querying overpass API to get surrounding buildings. This command is to be used after initial import, to update the camera table if you want to get rid of
buildings in your database.

positional arguments:
  camera_file           Mandatory parameter: path to file to import (osm.pbf or .osm format) [eg: /osm-data/sample-data.osm.pbf]

options:
  -h, --help            show this help message and exit
  --details, -d         If parameter is set, include detailed logs in the log file
  --log-file, -l LOG_FILE
                        Path to the output log file (default: load_cameras.log)
  --ignore-prompt, -y   If set, no prompt will be displayed to user. Warning: this wil automatically drop your Buildings database !
  --version             Show program's version number and exit.
```

</details>
