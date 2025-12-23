delete_database:
	docker compose down
	docker volume rm panopticity_postgis_data panopticity_certbot_etc panopticity_nginx_cache panopticity_certbot_var

install:
	/bin/bash ./scripts/install.sh

update:
	/bin/bash ./scripts/update-cameras.sh

start:
	docker compose up -d

stop:
	docker compose down
