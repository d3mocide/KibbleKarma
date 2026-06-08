# KibbleKarma — project automation
# Run `make` or `make help` to see all available commands.

COMPOSE ?= docker compose
BACKEND  := backend
FRONTEND := frontend

.DEFAULT_GOAL := help
.PHONY: help setup env install dev-backend dev-frontend build typecheck \
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
setup: env install db-generate ## First-time local setup (env files, deps, Prisma client)
	@echo "✅ Setup complete. Next: 'make up' (Docker) or 'make dev-backend' + 'make dev-frontend'."

env: ## Create .env files from examples if they don't exist
	@test -f .env || (cp .env.example .env && echo "Created .env")
	@test -f $(BACKEND)/.env || (cp $(BACKEND)/.env.example $(BACKEND)/.env && echo "Created backend/.env")
	@echo "Env files ready."

install: ## Install backend and frontend dependencies
	cd $(BACKEND) && npm install
	cd $(FRONTEND) && npm install

##@ Local development
dev-backend: ## Run the API in watch mode (http://localhost:4000)
	cd $(BACKEND) && npm run dev

dev-frontend: ## Run the web app dev server (http://localhost:5173)
	cd $(FRONTEND) && npm run dev

build: ## Type-check and build backend + frontend
	cd $(BACKEND) && npm run build
	cd $(FRONTEND) && npm run build

typecheck: ## Type-check both packages without emitting
	cd $(BACKEND) && npx tsc --noEmit
	cd $(FRONTEND) && npx tsc --noEmit

##@ Database (local, uses backend/.env)
db-generate: ## Generate the Prisma client
	cd $(BACKEND) && npx prisma generate

db-migrate: ## Create & apply a dev migration (optional: NAME=description)
	cd $(BACKEND) && npx prisma migrate dev $(if $(NAME),--name $(NAME),)

db-deploy: ## Apply pending migrations (production-style)
	cd $(BACKEND) && npx prisma migrate deploy

db-seed: ## Load demo data (pet, foods, weights, meals)
	cd $(BACKEND) && npm run seed

db-reset: ## Drop, recreate, migrate and re-seed the database
	cd $(BACKEND) && npx prisma migrate reset

db-studio: ## Open Prisma Studio to browse data
	cd $(BACKEND) && npx prisma studio

##@ Docker
up: ## Build images and start all services in the background
	$(COMPOSE) up -d --build
	@echo "🐾 KibbleKarma is up: web http://localhost:8080  ·  api http://localhost:4000"

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
