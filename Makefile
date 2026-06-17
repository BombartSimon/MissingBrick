.PHONY: build run start-backend start-frontend install-frontend-deps clean test test-backend test-frontend build-backend build-frontend deps lint-check help

run:
	@$(MAKE) -j2 start-backend start-frontend

start-backend:
	@cd backend && go run cmd/main.go

start-frontend:
	@cd frontend && npm run dev

install-frontend-deps:
	@cd frontend && npm install

deps: install-frontend-deps
	@cd backend && go mod download

build: build-backend build-frontend

build-backend:
	@cd backend && go build ./...

build-frontend:
	@cd frontend && npm run build

test: test-backend test-frontend

test-backend:
	@cd backend && go test ./...

test-frontend:
	@cd frontend && npm test

lint-check:
	@cd backend && go vet ./...
	@cd frontend && npm run build

clean:
	@rm -rf frontend/dist

help:
	@echo "Available commands:"
	@echo "  run                  - Start backend and frontend"
	@echo "  start-backend        - Start backend only"
	@echo "  start-frontend       - Start frontend only"
	@echo "  deps                 - Download backend/frontend dependencies"
	@echo "  build                - Build backend and frontend"
	@echo "  test                 - Run backend and frontend tests"
	@echo "  lint-check           - Run go vet and frontend build"
	@echo "  clean                - Remove frontend build output"
