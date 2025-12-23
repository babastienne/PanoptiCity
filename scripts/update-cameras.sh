#!/bin/sh
set -euo pipefail
trap 'rc=$?; echo -e >&2 "\033[0;31mError: Command \"${BASH_COMMAND}\" exited with status $rc\033[0m"; exit $rc' ERR

# Check if .env file exists. If not exit with an error.
if [ ! -f .env ]; then
    echo -e "\033[0;31mError: .env file not found.\033[0m" >&2
    exit
fi

# Load environment variables from .env into the script
set -o allexport
if ! source .env; then
    echo -e "\033[0;31mError: failed to source .env\033[0m" >&2
    exit 1
fi
set +o allexport

# Get diff from distant server
echo -e "\033[0;32m--- Fetching diffs from replication server to get lasts updates ---\033[0m"
# If diff.osc.gz already exists, delete it
rm -f osm-data/diff.osc.gz

if ! docker compose run --rm web pyosmium-get-changes -vv \
    --server ${REPLICATION_SERVER_URL} \
    -f /osm-data/sequence.state.txt \
    -o /osm-data/diff.osc.gz; then
    echo -e "\033[0;31mError: Failed to fetch diffs from replication server. Is your OSM file recent enough ?\033[0m" >&2
    exit 1
fi

echo -e "\033[0;32m--- Applying diffs on the database ---\033[0m"
echo -e "\033[0;33m->You can follow logs in back-end/update_cameras.log\033[0m"
docker compose run --rm web ./manage.py update_cameras_with_api /osm-data/diff.osc.gz -y -d

# echo -e "\033[0;32m--- Saving the new state file sequence ---\033[0m"
# docker compose run --rm web pyosmium-get-changes -O /osm-data/diff.osc.gz  -f /osm-data/sequence.state.txt

echo -e "\033[0;32m--- Clearing diff file ---\033[0m"
rm -f osm-data/diff.osc.gz

echo -e "\033[0;32m--- Instance is up to date ! ---\033[0m"
