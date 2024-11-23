.PHONY: help install up test lint

PORT=8000

help: ## List all commands with comments
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$|^[a-zA-Z_-]+:.*$$' $(MAKEFILE_LIST) | \
    awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install: # Install Python and Cloud Composer for local environment.
	if [! command -v uv &> /dev/null]; then \
	    curl -LsSf https://astral.sh/uv/install.sh | sh; \
	fi;
	uv venv
	if [ -f requirements.txt ]; then \
	    uv pip install -r requirements.txt; \
	fi;
	

api-up: # Start backend
	uv run uvicorn \
		main:app \
		--host 0.0.0.0 \
		 --port $$PORT \
		 --reload

pubsub-up: # Start Pub/Sub emulator
	@echo "Starting Pub/Sub emulator..."; \
    PROJECT="chat"; \
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
    done; \
    for TOPIC in chat test; do \
        curl -X PUT http://0.0.0.0:8085/v1/projects/$$PROJECT/topics/$$TOPIC; \
        curl -H 'content-type: application/json' -X PUT \
             -d "{\"topic\": \"projects/$$PROJECT/topics/$$TOPIC\"}" \
             "http://localhost:8085/v1/projects/$$PROJECT/subscriptions/$${TOPIC}_sub"; \
    done; \
    curl -X POST \
        -H "Content-Type: application/json" \
        -d '{"messages":[{"data": "SGVsbG8gd29ybGQ=","attributes": {"key1": "value1"}}]}' \
        http://localhost:8085/v1/projects/$$PROJECT/topics/test:publish
	@sleep 5 && echo "Pub/Sub emulator started at http://0.0.0.0:8085"

up: # Start local env
	@$(MAKE) pubsub-up &
	@$(MAKE) api-up &
	@wait
	@echo "\nLocal enviroments started"

down: # Stop local env
	docker stop gcp-pubsub-emulator &
	@kill -9 $(lsof -t -i:$$PORT) &
	@wait
	@echo "\nLocal enviroments stopped"

test:
	uv run python -m unittest discover

lint:
	uv run ruff check

lint.fix:
	uv run ruff check --fix

format:
	uv run ruff format
