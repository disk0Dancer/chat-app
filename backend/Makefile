.PHONY: help install up test lint

PORT:=8000

help: ## List all commands with comments
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$|^[a-zA-Z_-]+:.*$$' $(MAKEFILE_LIST) | \
    awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install: ## Install Python and Cloud Composer for local environment.
	if [! command -v uv &> /dev/null]; then \
	    curl -LsSf https://astral.sh/uv/install.sh | sh; \
	fi;
	uv venv
	uv sync
	

api-up: ## Start backend
	uv run main.py

pubsub-up: ## Start Pub/Sub emulator
	@$(shell $(export PUBSUB_EMULATOR_HOST=localhost:8085))
	@echo "Starting Pub/Sub emulator..."
    
	PROJECT="chat"; \
    PS_START_TRIES=0; \
    docker run --rm -d \
        -p 8085:8085 \
        --name gcp-pubsub-emulator \
        google/cloud-sdk:emulators \
        /bin/bash -c "gcloud beta emulators pubsub start \
        	--project=$$PROJECT \
            --host-port='0.0.0.0:8085'"; \
    until curl -s http://0.0.0.0:8085/ > /dev/null; do \
        sleep 2; \
        echo "Waiting for Pub/Sub emulator to start..."; \
    done;
    
	@echo "Pub/Sub emulator started at http://0.0.0.0:8085"

up: ## Start local env
	@$(MAKE) pubsub-up
	@$(MAKE) api-up &
	@wait
	@echo "\nLocal enviroments started"

prod: ## Start production environment
	@$(MAKE) pubsub-up &
	@uv run main.py
	@wait

down: ## Stop local env
	docker stop gcp-pubsub-emulator &
	kill $(shell lsof -ti ":$(PORT)") &
	@wait
	@echo "\nLocal enviroments stopped"

test: ## Run tests
	uv run python -m unittest discover

lint: ## Lint the code
	uv run ruff check

lint.fix: ## Lint the code and fix issues
	uv run ruff check --fix

format: ## Format the code
	uv run ruff format
