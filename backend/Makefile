.PHONY: up down build logs clean dev

# Start all services
up:
	docker-compose up -d

# Start with build
up-build:
	docker-compose up -d --build

# Stop all services
down:
	docker-compose down

# Stop and remove volumes
clean:
	docker-compose down -v

# Build all services
build:
	docker-compose build

# View logs
logs:
	docker-compose logs -f

# View specific service logs
logs-gateway:
	docker-compose logs -f gateway

logs-market:
	docker-compose logs -f market

logs-trading:
	docker-compose logs -f trading

logs-vault:
	docker-compose logs -f vault

logs-user:
	docker-compose logs -f user

# Start only infrastructure (for development)
dev-infra:
	docker-compose up -d postgres redis

# Restart a specific service
restart-%:
	docker-compose restart $*

# Health check
health:
	curl -s http://localhost:8080/health | jq .

# Test market API
test-market:
	curl -s http://localhost:8080/api/v1/markets | jq .

# Test ticker
test-ticker:
	curl -s http://localhost:8080/api/v1/markets/BTC_USDM_PERP/ticker | jq .

# Connect wallet (test)
test-connect:
	curl -s -X POST http://localhost:8080/api/v1/auth/connect \
		-H "Content-Type: application/json" \
		-d '{"wallet_address": "addr1test123"}' | jq .

# Shell into postgres
psql:
	docker-compose exec postgres psql -U hydrox -d hydrox

# Shell into redis
redis-cli:
	docker-compose exec redis redis-cli

