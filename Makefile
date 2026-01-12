delete_database:
	docker compose down
	docker volume rm panopticity_postgis_data panopticity_certbot_etc panopticity_nginx_cache panopticity_certbot_var

install:
	/bin/bash ./scripts/install.sh

update:
	/bin/bash ./scripts/update-cameras.sh

PROJECT_DIR := $(shell pwd)
SCRIPT_NAME := scripts/update_loop.sh
LOG_FILE := $(PROJECT_DIR)/replication.log
CRON_JOB := @reboot sleep 60 && cd $(PROJECT_DIR) && ./$(SCRIPT_NAME) >> $(LOG_FILE) 2>&1

install_update:
	@echo "--- Installing Cron Job ---"
	@chmod +x $(SCRIPT_NAME)
	@(crontab -l 2>/dev/null | grep -v "$(SCRIPT_NAME)" || true; echo "$(CRON_JOB)") | crontab -
	@echo "✅ Cron job installed."
	@echo "   - Trigger: @reboot (System Startup)"
	@echo "   - Delay: 60 seconds (waiting for Docker daemon)"
	@echo "   - Log file: $(LOG_FILE)"

start:
	docker compose up -d

stop:
	docker compose down
	docker volume rm panopticity_nginx_cache

build:
	docker compose build
