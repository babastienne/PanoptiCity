delete_database:
	docker compose down
	docker volume rm panopticity_postgis_data

install:
	/bin/bash ./scripts/install.sh

update:
	/bin/bash ./scripts/update-cameras.sh
