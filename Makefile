.PHONY: help install up down test lint lint.fix format

help: ## List all commands with comments
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$|^[a-zA-Z_-]+:.*$$' $(MAKEFILE_LIST) | \
	awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
	
install: ## Install dependencies
	@echo "Installing dependencies..."
	@$(MAKE) -C ps-chat-fastapi install &
	@$(MAKE) -C ps-chat-vite-react install &
	@wait
	@echo "Dependencies installed."

up: ## Start local environment
	@echo "Starting local environment..."
	@$(MAKE) -C ps-chat-fastapi up &
	@$(MAKE) -C ps-chat-vite-react up &
	@wait
	@echo "Local environment started."

down: ## Stop local environment
	@echo "Stopping local environment..."
	@$(MAKE) -C ps-chat-fastapi down &
	@$(MAKE) -C ps-chat-vite-react down &
	@wait
	@echo "Local environment stopped."

test: ## Run tests
	@echo "Running tests..."
	@$(MAKE) -C ps-chat-fastapi test &
	@$(MAKE) -C ps-chat-vite-react test &
	@wait
	@echo "Tests run."

lint: ## Lint the code
	@echo "Linting the code..."
	@$(MAKE) -C ps-chat-fastapi lint &
	@$(MAKE) -C ps-chat-vite-react lint &
	@wait
	@echo "Code linted."

lint.fix: ## Lint the code and fix issues
	@echo "Linting the code and fixing issues..."
	@$(MAKE) -C ps-chat-fastapi lint.fix
	@$(MAKE) -C ps-chat-vite-react lint.fix
	@echo "Code linted and issues fixed."


format: ## Format the code
	@echo "Formatting the code..."
	@$(MAKE) -C ps-chat-fastapi format
	@$(MAKE) -C ps-chat-vite-react format
	@echo "Code formatted."
