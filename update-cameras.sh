#!/bin/sh

# Get diffs from server (change the URL with your replication server url)
docker compose run --rm web pyosmium-get-changes --server URL_OF_THE_REPLICATION_SERVER -f /osm-data/sequence.state.txt -o /osm-data/diff.osc.gz

# Apply diffs on the database
docker compose run --rm web ./manage.py load_cameras -d -u /osm-data/diff.osc.gz

# Remove diff file
rm -f osm-data/diff.osc.gz
