.PHONY: help

help: ## List all commands with comments
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$|^[a-zA-Z_-]+:.*$$' $(MAKEFILE_LIST) | \
	awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
	
install:
	@echo "Installing dependencies..."
	$(MAKE) -C ps-chat-fastapi install
	$(MAKE) -C ps-chat-vite-react install
	@echo "Dependencies installed."

up: ## Start local environment
	@echo "Starting local environment..."
	$(MAKE) -C ps-chat-fastapi up &
	$(MAKE) -C ps-chat-vite-react up &
	@wait
	@echo "Local environment started."

down: ## Stop local environment
	@echo "Stopping local environment..."
	$(MAKE) -C ps-chat-fastapi down
	$(MAKE) -C ps-chat-vite-react down
	@echo "Local environment stopped."

test: ## Run tests
	@echo "Running tests..."
	$(MAKE) -C ps-chat-fastapi test
	$(MAKE) -C ps-chat-vite-react test
	@echo "Tests run."

lint: ## Lint the code
	@echo "Linting the code..."
	$(MAKE) -C ps-chat-fastapi lint
	$(MAKE) -C ps-chat-vite-react lint
	@echo "Code linted."

format: ## Format the code
	@echo "Formatting the code..."
	$(MAKE) -C ps-chat-fastapi format
	$(MAKE) -C ps-chat-vite-react format
	@echo "Code formatted."
