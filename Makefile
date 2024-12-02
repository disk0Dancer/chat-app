.PHONY: help install up down test lint lint.fix format

help: ## List all commands with comments
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$|^[a-zA-Z_-]+:.*$$' $(MAKEFILE_LIST) | \
	awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
	
install: ## Install dependencies
	@echo "Installing dependencies..."
	@$(MAKE) -C backend install &
	@$(MAKE) -C frontend install &
	@wait
	@echo "Dependencies installed."

up: ## Start local environment
	@echo "Starting local environment..."
	@$(MAKE) -C backend up &
	@$(MAKE) -C frontend up &
	@wait
	@echo "Local environment started."

prod: ## Start production environment
	@echo "Starting production environment..."
	@$(MAKE) -C backend prod &
	@$(MAKE) -C frontend prod &
	@wait
	@echo "Production environment started."

down: ## Stop local environment
	@echo "Stopping local environment..."
	@$(MAKE) -C backend down &
	@$(MAKE) -C frontend down &
	@wait
	@echo "Local environment stopped."

test: ## Run tests
	@echo "Running tests..."
	@$(MAKE) -C backend test &
	@$(MAKE) -C frontend test &
	@wait
	@echo "Tests run."

lint: ## Lint the code
	@echo "Linting the code..."
	@$(MAKE) -C backend lint &
	@$(MAKE) -C frontend lint &
	@wait
	@echo "Code linted."

lint.fix: ## Lint the code and fix issues
	@echo "Linting the code and fixing issues..."
	@$(MAKE) -C backend lint.fix
	@$(MAKE) -C frontend lint.fix
	@echo "Code linted and issues fixed."


format: ## Format the code
	@echo "Formatting the code..."
	@$(MAKE) -C backend format
	@$(MAKE) -C frontend format
	@echo "Code formatted."
