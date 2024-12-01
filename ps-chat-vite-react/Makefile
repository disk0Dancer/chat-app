.PHONY: help install up down test lint format

PORT:=5173

help: ## List all commands with comments
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$|^[a-zA-Z_-]+:.*$$' $(MAKEFILE_LIST) | \
	awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
	
install: ## Install Node.js and Vite for local environment
	@if ! command -v node &> /dev/null; then \
  		@echo "Installing Node.js and NPM"; \
		curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash; \
        nvm install 22; \
        node -v; \
        npm -v; \
	fi

	@if ! command -v vite &> /dev/null; then \
		@echo "Installing Vite"; \
		npm install -g vite; \
	fi

	npm install

ngrok: ## Publish
    ngrok http --url=sheep-artistic-sadly.ngrok-free.app $(PORT) &

up: ngrok ## Start local environment
	npm run dev
	@if [ -z $(PUBLIC) ]; then \
	    @echo "Local running at http://localhost:$$PORT"; \
   		else \
	    	@echo "Public running at $(PUBLIC)"; \
	    	ngrok http --url=sheep-artistic-sadly.ngrok-free.app $$PORT &; \
	fi

down: ## Stop local environment
	@kill $(shell lsof -ti ":$(PORT)")
	@echo "Stopped Vite server..."

test: ## Run tests
	npm run test

lint: ## Lint the code
	npm run lint

lint.fix: ## Lint the code and fix issues
	npm run lint:fix

format: ## Format the code
	npm run format
