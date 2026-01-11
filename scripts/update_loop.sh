#!/bin/bash
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

echo -e "\033[0;32m--- Starting OSM Replication Service ---\033[0m"

while true; do
    # Clean up previous diffs
    rm -f osm-data/diff.osc.gz

    # Fetch changes
    echo -e "\033[0;34m--- Fetching diffs from replication server... ---\033[0m"
    
    # Temporarily disable 'exit on error' to handle the return code manually
    set +e 
    docker compose run --rm web pyosmium-get-changes -vv \
        --server "${REPLICATION_SERVER_URL}" \
        -f /osm-data/sequence.state.txt \
        -o /osm-data/diff.osc.gz
    
    FETCH_STATUS=$?
    set -e # Re-enable strict mode

    # Handle Exit Codes
    if [ $FETCH_STATUS -eq 3 ]; then
        # Status 3 = No new data available
        echo -e "\033[0;33mNo new data available. Sleeping for 1 minute...\033[0m"
        sleep 60
        continue
    elif [ $FETCH_STATUS -ne 0 ]; then
        # Any error other than 0 (Success) or 3 (Empty) is a real error
        echo -e "\033[0;31mError: Failed to fetch diffs (Exit Code: $FETCH_STATUS). Is your OSM file recent enough?\033[0m" >&2
        exit $FETCH_STATUS
    fi

    # --- If we are here, FETCH_STATUS was 0 (Success) ---

    echo -e "\033[0;32m--- Applying diffs on the database ---\033[0m"
    echo -e "\033[0;33m->You can follow logs in back-end/update_cameras.log\033[0m"
    docker compose run --rm web ./manage.py update_cameras_with_api /osm-data/diff.osc.gz -y -d

    # echo -e "\033[0;32m--- Saving the new state file sequence ---\033[0m"
    # docker compose run --rm web pyosmium-get-changes -O /osm-data/diff.osc.gz -f /osm-data/sequence.state.txt

    echo -e "\033[0;32m--- Update complete. Checking for next batch immediately... ---\033[0m"
    # We do not sleep here; we loop immediately to catch up if there are multiple diffs pending.
    # It will eventually hit Exit Code 3 and sleep when fully caught up.
done
