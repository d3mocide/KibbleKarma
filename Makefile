# KibbleKarma — project automation
# Run `make` or `make help` to see all available commands.

COMPOSE ?= docker compose
DEV_COMPOSE := $(COMPOSE) -f docker-compose.yml -f docker-compose.dev.yml
BACKEND  := backend
FRONTEND := frontend

.DEFAULT_GOAL := help
.PHONY: help setup env install dev dev-bg dev-down dev-logs build typecheck \
        db-generate db-migrate db-deploy db-seed db-reset db-studio \
        up up-fg down stop restart logs ps rebuild seed migrate reset-volumes \
        clean

help: ## Show this help
	@awk 'BEGIN { \
		FS = ":.*##"; \
		printf "\n\033[1mKibbleKarma\033[0m — pet wellness log\n\nUsage:\n  make \033[36m<target>\033[0m\n"; \
	} \
	/^[a-zA-Z0-9_-]+:.*?##/ { printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2 } \
	/^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) }' $(MAKEFILE_LIST)
	@echo ""

##@ Setup
setup: env install db-generate ## First-time setup (env file, local deps for type-checking, Prisma client)
	@echo "✅ Setup complete. Next: 'make dev' (hot-reload Docker) or 'make up' (production)."

env: ## Create .env from the example if it doesn't exist
	@test -f .env || (cp .env.example .env && echo "Created .env")
	@echo "Env file ready."

install: ## Install backend and frontend deps locally (for typecheck/build only)
	cd $(BACKEND) && npm install
	cd $(FRONTEND) && npm install

##@ Local development (Docker, hot reload)
dev: ## Start the dev stack with hot reload — API :4000, web :5173 (Ctrl-C to stop)
	$(DEV_COMPOSE) up --build

dev-bg: ## Same as 'dev' but detached
	$(DEV_COMPOSE) up -d --build
	@echo "🐾 Dev stack up: web http://localhost:5173 · API http://localhost:4000"

dev-down: ## Stop and remove the dev stack (keeps the database volume)
	$(DEV_COMPOSE) down

dev-logs: ## Tail logs from the dev stack
	$(DEV_COMPOSE) logs -f --tail=100

build: ## Type-check and build backend + frontend locally
	cd $(BACKEND) && npm run build
	cd $(FRONTEND) && npm run build

typecheck: ## Type-check both packages without emitting
	cd $(BACKEND) && npx tsc --noEmit
	cd $(FRONTEND) && npx tsc --noEmit

##@ Database (runs inside the dev backend container)
db-generate: ## Generate the Prisma client locally (so 'make typecheck' sees types)
	cd $(BACKEND) && npx prisma generate

db-migrate: ## Create & apply a dev migration (optional: NAME=description)
	$(DEV_COMPOSE) exec backend npx prisma migrate dev $(if $(NAME),--name $(NAME),)

db-deploy: ## Apply pending migrations (production-style)
	$(DEV_COMPOSE) exec backend npx prisma migrate deploy

db-seed: ## Load demo data (pet, foods, weights, meals)
	$(DEV_COMPOSE) exec backend npm run seed

db-reset: ## Drop, recreate, migrate and re-seed the database
	$(DEV_COMPOSE) exec backend npx prisma migrate reset

db-studio: ## Open Prisma Studio at http://localhost:5555
	$(DEV_COMPOSE) exec backend npx prisma studio

##@ Docker
up: ## Build images and start all services in the background
	$(COMPOSE) up -d --build
	@echo "🐾 KibbleKarma is up: http://localhost"

up-fg: ## Start all services in the foreground (stream logs)
	$(COMPOSE) up --build

down: ## Stop and remove containers (keeps the database volume)
	$(COMPOSE) down

stop: ## Stop services without removing them
	$(COMPOSE) stop

restart: ## Restart all services
	$(COMPOSE) restart

logs: ## Tail logs from all services
	$(COMPOSE) logs -f --tail=100

ps: ## Show service status
	$(COMPOSE) ps

rebuild: ## Rebuild images without cache
	$(COMPOSE) build --no-cache

seed: ## Seed demo data inside the running backend container
	$(COMPOSE) exec backend npm run seed

migrate: ## Apply migrations inside the running backend container
	$(COMPOSE) exec backend npx prisma migrate deploy

reset-volumes: ## Stop and DELETE all data (drops the database volume)
	$(COMPOSE) down -v

##@ Housekeeping
clean: ## Remove build artifacts and installed dependencies
	rm -rf $(BACKEND)/dist $(BACKEND)/node_modules
	rm -rf $(FRONTEND)/dist $(FRONTEND)/node_modules
	@echo "🧹 Cleaned build artifacts and node_modules."
