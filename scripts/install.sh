#!/usr/bin/env bash
set -euo pipefail
trap 'rc=$?; echo -e >&2 "\033[0;31mError: Command \"${BASH_COMMAND}\" exited with status $rc\033[0m"; exit $rc' ERR

# Check if docker is installed. If not throw an error and exit.
if ! [ -x "$(command -v docker)" ]; then
    echo -e '\033[0;31mError: docker is not installed. Please install docker before running this script\033[0m' >&2
    exit
fi

# Check if .env file exists. If not exit with an error.
if [ ! -f .env ]; then
    echo -e "\033[0;31mError: .env file not found. Please create a .env file based on .env.dist and fill it before running this script.\033[0m" >&2
    exit
fi

# TODO: If no .env file ask user questions about it's instance and create it

# Load environment variables from .env into the script
set -o allexport
if ! source .env; then
    echo -e "\033[0;31mError: failed to source .env\033[0m" >&2
    exit 1
fi
set +o allexport

# Ensure required postgres variables are set and provide sensible defaults if not.
: "${POSTGRES_USER:=postgres}"
: "${POSTGRES_PASSWORD:=postgres}"
: "${POSTGRES_DB:=postgres}"

# Get number of cores on machine to speed up camera import (limit to 32 to avoid overload)
NUM_CORES=$(nproc --all || echo 1)
if [ "$NUM_CORES" -gt 32 ]; then
    NUM_CORES=32
fi

# TODO: Ask user and auto-generate the front-end configuration file

# Ensure the directory from which this script is run is the project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT_DIR" || { echo -e "\033[0;31mError: Failed to change directory to project root.\033[0m"; exit 1; }

# Ask the user the name of the OSM file to import
read -rp "Enter the names to the OSM file to import (located in osm-data folder): " OSM_FILE_NAME
# Check if the file exists
if [ ! -f "osm-data/$OSM_FILE_NAME" ]; then
    echo -e "\033[0;31mError: File osm-data/$OSM_FILE_NAME not found. Please make sure the file exists before running this script.\033[0m" >&2
    exit
fi

# Build backend container
echo -e "\033[0;32m--- Building the docker image for backend container ---\033[0m"
docker compose build

# Build and start the docker containers
echo -e "\033[0;32m--- Building the database and the containers ---\033[0m"
# Run postgis until it displays "database system is ready to accept connections"
docker compose up -d --build postgis

echo -e "\033[0;33mWaiting for PostGIS to initialize...\033[0m"
sleep 5
until docker compose logs postgis 2>&1 | grep -q "database system is ready to accept connections"; do
    sleep 1
done

echo -e "\033[0;32m--- Creating the database structure ---\033[0m"
docker compose run --remove-orphans --rm web ./manage.py migrate

echo -e "\033[0;32m--- Importing tile structure ---\033[0m"
zcat back-end/cameras/sql/tiles.sql.gz | docker compose run --rm -e PGPASSWORD=$POSTGRES_PASSWORD postgis psql -h postgis -p 5432 -U $POSTGRES_USER -d $POSTGRES_DB

echo -e "\033[0;32m--- Load cameras (without buildings to speed up focus computation) ---\033[0m"
docker compose run --remove-orphans --rm web ./manage.py load_cameras -w "$NUM_CORES" /osm-data/$OSM_FILE_NAME

# Import buildings and create tile structure to optimize queries
echo -e "\033[0;32m--- Importing buildings from osm-data/$OSM_FILE_NAME ---\033[0m"
echo -e "\033[0;33m(Warning: This can be long depending on the covered area)\033[0m"
docker compose run --remove-orphans osm2pgsql -O flex -S /data/buildings.lua /osm-data/$OSM_FILE_NAME
# docker compose exec -T postgis psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "CREATE EXTENSION IF NOT EXISTS postgis_sfcgal;"

# Import cameras
echo -e "\033[0;32m--- Import cameras and compute their focus ---\033[0m"
echo -e "\033[0;33m(Warning: This can be long depending on the covered area)\033[0m"
echo -e "\033[0;33mTo speed up the process we're using multi-processing with $NUM_CORES cores.\033[0m"
docker compose run --remove-orphans --rm web ./manage.py load_cameras --update -w "$NUM_CORES" /osm-data/$OSM_FILE_NAME

# TODO: Create nginx configuration

# TODO: Run the website and configure the auto-update of cameras
echo -e "\033[0;32m--- Installation complete! You can now run the application using 'docker compose up -d' ---\033[0m"
