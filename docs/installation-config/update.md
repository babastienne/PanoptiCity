---
title: Update the database
parent: Installation and configuration
nav_order: 3
---

# Update the database
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

- TOC
{:toc}

---

## How it works

After the installation, cameras are kept in sync with OpenStreetMap by the `replication` service declared in `docker-compose.yml`. It starts with `docker compose up -d` (or `make start`) and restarts automatically with docker, there is no cron to install.

Every minute the service:

1. downloads the new OSM replication diffs (minutely diffs from `planet.osm.org` by default, or the diffs of your extract provider);
2. keeps only the nodes that are, or were, cameras (`man_made=surveillance`);
3. applies each change to the database:

| Change in OSM                                                                 | What the service does                                      | Buildings needed |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------- | ---------------- |
| New camera                                                                    | Create the camera and compute its focus                    | Yes              |
| Camera moved, or `camera:type`, direction, `camera:angle`, height, `surveillance` changed | Recompute the focus                            | Yes              |
| Other tags only (`camera:mount`, `surveillance:zone`, ...)                    | Update fields and tags, keep the existing focus            | No               |
| Node deleted, or `man_made=surveillance` removed                              | Delete the camera                                          | No               |

Each camera is processed in its own database transaction: an error never deletes or corrupts an existing camera. The last applied sequence is stored in the database (`cameras_replicationstate` table). Processing a batch twice is harmless, so a crash or a restart never loses or duplicates changes.

Logs are written to `back-end/replication.log` and can be followed with `make replication_logs`.

{: .note }
On the first start, the service reads the sequence number from `osm-data/sequence.state.txt` (written by the install script). Afterwards the state lives in the database.

## Buildings providers

To compute the field of view of a new or moved camera, the buildings around it are needed. The database does **not** store the buildings of the whole covered area (that would be tens of gigabytes for the planet). Instead, a *buildings provider* is asked for the buildings inside the camera's largest possible focus. They are used for the computation and discarded.

Choose the provider with the `BUILDINGS_PROVIDER` variable in `.env`:

| Provider             | Source                                                                                                           | Storage                   | Buildings freshness | Best for                                  |
| -------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------- | ------------------- | ----------------------------------------- |
| `overture` (default) | OSM buildings republished every month by the [Overture Maps Foundation](https://overturemaps.org) as GeoParquet files on S3 | None (a small file index) | About one month     | Any area, including the planet            |
| `local`              | The `.osm.pbf` extract used for the install, kept up to date daily with the official OSM diffs                   | The extract file          | One day             | Cities, regions, countries; no third-party service |
| `none`               | No buildings                                                                                                     | None                      | -                   | Tests                                     |

**If the provider cannot be reached**, the camera is still created or updated within the minute, with a focus computed without buildings. It is flagged `buildings_pending` and retried every 10 minutes until the provider answers.

### Overture provider

- Only buildings coming from OpenStreetMap are used (Overture also contains buildings detected by machine learning; set `BUILDINGS_OVERTURE_OSM_ONLY=false` to use them as well).
- The release is looked up once a day in the [Overture STAC catalog](https://stac.overturemaps.org). Only the files covering the camera are read, through HTTP range requests (typically one file: a few seconds per camera, about 15 seconds for a dome camera in a dense city centre).
- `BUILDINGS_OVERTURE_RELEASE` can pin a release (e.g. `2026-10-21.0`), `latest` by default.

### Local provider

- Set `BUILDINGS_LOCAL_PBF` to the path of the extract inside the container (e.g. `/osm-data/france-latest.osm.pbf`). The install script does it when you choose `local`.
- The file must contain replication information (files from Geofabrik or openstreetmap.fr do). It is updated every `BUILDINGS_LOCAL_UPDATE_HOURS` hours (24 by default, `0` disables the update).
- For each batch of cameras, `osmium extract` cuts the needed areas in a single pass over the file.

## Manual commands

Apply all pending changes once, without the service (stop it first with `docker compose stop replication`, two processes must not apply diffs at the same time):

```bash
make update
```

The `replicate_cameras` command accepts other options:

```
usage: manage.py replicate_cameras [--once] [--osc OSC_FILE] [--init-sequence INIT_SEQUENCE]
                                   [--sleep SLEEP] [--max-size MAX_SIZE] [--retry-every RETRY_EVERY]
                                   [--retry-limit RETRY_LIMIT] [--log-file LOG_FILE] [--details]

  --once                Apply all available diffs, retry pending cameras, then exit.
  --osc OSC_FILE        Apply a local change file (.osc / .osc.gz) and exit. The replication state is not modified.
  --init-sequence N     Initialise (or reset) the replication state to this sequence number.
  --sleep SLEEP         Seconds to wait when no new diff is available (default: 60).
  --max-size MAX_SIZE   Maximum unpacked size of diffs processed in one batch, in kB (default: 20480).
  --retry-every N       Minutes between two retries of cameras computed without buildings (default: 10).
  --retry-limit N       Maximum number of pending cameras retried at once (default: 200).
  --log-file, -l        Log file path (default: replication.log).
  --details, -d         Include debug logs.
```

For example, to restart from a given sequence of the minutely diffs:

```bash
docker compose run --rm replication python manage.py replicate_cameras --init-sequence 7347500 --once
```

`osm-data/test-changes.osc` contains one example of each kind of change on the cameras of `sample-data.osm.pbf` (Monaco). It is useful to check an installation made with the sample file:

```bash
docker compose run --rm replication python manage.py replicate_cameras --osc /osm-data/test-changes.osc
```

## Migrating from the former update loop

Previous versions used `scripts/update_loop.sh`, started by a cron (`make install_update`), and fetched buildings from the Overpass API. To migrate:

1. remove the `@reboot ... update_loop.sh` line from your crontab (`crontab -e`) and stop the running loop;
2. pull the new version, then run `docker compose build && docker compose run --rm web ./manage.py migrate`;
3. set `BUILDINGS_PROVIDER` (and `BUILDINGS_LOCAL_PBF` for the local provider) in `.env`;
4. start everything with `docker compose up -d`. The service picks up the sequence from `osm-data/sequence.state.txt`.
