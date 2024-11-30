.PHONY: help install up down test lint format

PORT:=3000

help: ## List all commands with comments
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$|^[a-zA-Z_-]+:.*$$' $(MAKEFILE_LIST) | \
	awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
	
install: # Install Node.js and Vite for local environment
	@# Check if Node.js is installed
	@if ! command -v node &> /dev/null; then \
		echo "Node.js is not installed. Please install Node.js: https://nodejs.org/"; \
		exit 1; \
	fi

	@# Check if Vite is installed
	@if ! command -v vite &> /dev/null; then \
		echo "Vite is not installed. Installing Vite..."; \
		npm install -g create-vite; \
	fi

	@# Install the project dependencies
	npm install

up: # Start local environment
	@# Start the Vite server
	npm run dev
	if [ -z $(PUBLIC) ]; then \
	    @echo "Local running at http://localhost:$$PORT"; \
   		else \
	    	@echo "Public running at $(PUBLIC)"; \
	    	ngrok http --url=sheep-artistic-sadly.ngrok-free.app $$PORT &; \
	fi
    

down: # Stop local environment
	@# Stop the Vite server
	@echo "Stopping Vite server..."
	kill $(shell lsof -ti ":$(PORT)") &

test: # Run tests
	@# Run the tests
	npm run test

lint: # Lint the code
	@# Lint the code
	npm run lint

lint.fix: # Lint the code and fix issues
	npm run lint:fix

format: # Format the code
	@# Format the code
	npm run format
