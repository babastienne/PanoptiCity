delete_database:
	docker compose down
	docker volume rm panopticity_postgis_data panopticity_certbot_etc panopticity_nginx_cache panopticity_certbot_var

install:
	/bin/bash ./scripts/install.sh

# Apply all pending OSM changes once (the `replication` service does it continuously)
update:
	docker compose run --rm replication python manage.py replicate_cameras --once

# Follow the logs of the replication service
replication_logs:
	docker compose logs -f replication

start:
	docker compose up -d

stop:
	docker compose down
	docker volume rm panopticity_nginx_cache

build:
	docker compose build
