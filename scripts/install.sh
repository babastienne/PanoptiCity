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
    # Echo warning : ".env file not found, creating it..."
    echo -e "\033[0;33mWarning: .env file not found. Creating a new one\033[0m" >&2
    cp .env.dist .env
fi

# Generic function to check if a var is set in .env and if not ask the user for value
ensure_env_var() {
    local key="$1"
    local default_value="$2"
    local prompt_msg="$3"
    local env_file=".env"

    # Check if the key exists and has at least one character after '='
    if ! grep -qE "^${key}=.+" "$env_file"; then

        # Ask user for input
        read -rp "${prompt_msg} (default: ${default_value}): " user_input

        # Use default if input is empty
        user_input=${user_input:-$default_value}

        # Check if the key exists in the file (but is empty)
        if grep -q "^${key}=" "$env_file"; then
            # Replace the existing empty line
            sed -i.bak "s|^${key}=.*|${key}=${user_input}|" "$env_file"
        else
            # Key is completely missing, append it

            # Ensure file ends with a newline before appending
            if [ -n "$(tail -c1 "$env_file" 2>/dev/null)" ]; then
                echo "" >> "$env_file"
            fi

            echo "${key}=${user_input}" >> "$env_file"
        fi

        echo -e "\033[0;32m-> ${key} has been added to ${env_file}\033[0m"
    else
        echo -e "\033[0;32m${key} already set in ${env_file}\033[0m"
    fi
}

ensure_env_var "POSTGRES_DB" "postgres" "Enter the name of the Postgres database to create"
ensure_env_var "POSTGRES_USER" "postgres" "Enter the name of the database user to create"
ensure_env_var "POSTGRES_PASSWORD" "postgres" "Enter the password for the database user to create"
ensure_env_var "POSTGRES_PORT" "5452" "Enter the port you want to use to access your database"
ensure_env_var "FRONTEND_DOMAIN_NAME" "example.org" "Enter the domain name that will be used for your frontend application"
ensure_env_var "BACKEND_DOMAIN_NAME" "api.example.org" "Enter the domain name that will be used for the backend application"
ensure_env_var "CERTBOT_EMAIL" "NO DEFAULT" "Enter the email address that will be associated with the SSL certificates"
ensure_env_var "CLIENT_ID_OSM_APP" "NO DEFAULT" "Enter the client ID of your OSM app to allow users to connect to OSM"

# Generate a secret key and add it in .env file
GENERATED_SECRET=$(openssl rand -hex 32)
ensure_env_var "SECRET_KEY" "$GENERATED_SECRET" "Do you want to override the generated secret key ?"


# Load environment variables from .env into the script
set -o allexport
if ! source .env; then
    echo -e "\033[0;31mError: failed to source .env\033[0m" >&2
    exit 1
fi
set +o allexport

# Get number of cores on machine to speed up camera import (limit to 32 to avoid overload)
NUM_CORES=$(nproc --all || echo 1)
if [ "$NUM_CORES" -gt 32 ]; then
    NUM_CORES=32
fi

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
docker compose run --remove-orphans --rm web ./manage.py load_cameras --recreate -w "$NUM_CORES" /osm-data/$OSM_FILE_NAME

# TODO: Create nginx configuration

echo -e "\033[0;32m--- Configuration of replication and update of data ---\033[0m"
# Generation of the sequence state and grep the replication server URL at the same time
REPLICATION_SERVER_URL=$(docker compose run --rm web pyosmium-get-changes -O /osm-data/$OSM_FILE_NAME  -f /osm-data/sequence.state.txt -v 2>&1 | grep -oP 'Using replication server at \K\S+')
# Add this variable to .env file so it can be used during update command
if grep -q "^REPLICATION_SERVER_URL=" .env; then
    sed -i.bak "s|^REPLICATION_SERVER_URL=.*|REPLICATION_SERVER_URL=$REPLICATION_SERVER_URL|" .env
else
    # Check if the file ends with a newline.
    if [ -n "$(tail -c1 .env 2>/dev/null)" ]; then
        echo "" >> .env
    fi
    echo "REPLICATION_SERVER_URL=$REPLICATION_SERVER_URL" >> .env
fi
echo -e "\033[0;32m-> Replication URL has been added to .env file\033[0m"

# Nginx configuration section
echo -e "\033[0;32m--- Working on server configuration (NGINX) ---\033[0m"
echo -e "\033[0;32m-> Starting Nginx in HTTP mode for challenge...\033[0m"
cp templates/nginx.http.template nginx.conf.template
docker compose up -d nginx web postgis

sleep 5

echo -e "\033[0;32m-> Requesting Let's Encrypt certificate for $FRONTEND_DOMAIN_NAME and $BACKEND_DOMAIN_NAME...\033[0m"

# Join domains for certbot
domains="-d $FRONTEND_DOMAIN_NAME -d $BACKEND_DOMAIN_NAME"
if docker compose run --rm --entrypoint "certbot" certbot certonly \
    --webroot --webroot-path=/var/www/certbot \
    --email "$CERTBOT_EMAIL" --agree-tos --no-eff-email \
    --non-interactive \
    -d "$FRONTEND_DOMAIN_NAME" -d "$BACKEND_DOMAIN_NAME"; then
    CERT_SUCCESS=0
else
    CERT_SUCCESS=$?
fi

if [ "$CERT_SUCCESS" -eq 0 ]; then
    echo -e "\033[0;32m-> SUCCESS: Certificates obtained.\033[0m"
    echo -e "\033[0;32m-> Switching to SSL configuration...\033[0m"
    cp templates/nginx.ssl.template nginx.conf.template
else
    echo -e "\033[0;32m-> FAILURE: Certbot could not obtain certificates.\033[0m"
    echo -e "\033[0;32m-> KEEPING HTTP-ONLY configuration as fallback...\033[0m"
    cp templates/nginx.http.template nginx.conf.template
fi
docker compose down

echo -e "\033[0;32m--- Generating the config.js file ---\033[0m"
if [ "$CERT_SUCCESS" -eq 0 ]; then
    API_PROTOCOL="https"
else
    API_PROTOCOL="http"
fi
export API_PROTOCOL
envsubst '$BACKEND_DOMAIN_NAME $FRONTEND_DOMAIN_NAME $CLIENT_ID_OSM_APP $API_PROTOCOL' \
    < templates/config.js.template \
    > front-end/CONFIG.js


# TODO: Run the website and configure the auto-update of cameras
echo -e "\033[0;32m--- Installation complete! You can now run the application using 'docker compose up -d' ---\033[0m"
echo -e "\033[0;32m--- To update the database with latests changes from OSM you can run 'make update' ---\033[0m"
