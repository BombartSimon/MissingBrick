.PHONY: build run start-backend start-frontend install-frontend-deps clean test deps help

# Start backend only (foreground)
start-backend:
	@cd backend && go run cmd/main.go

# Start frontend only (foreground)
start-frontend:
	@cd frontend && npm run dev

# Install frontend dependencies
install-frontend-deps:
	@cd frontend && npm install

# Help
help:
	@echo "Available commands:"
	@echo "  run                          - Start backend (background) and frontend (foreground)"
	@echo "  start-backend                - Start backend only (foreground)"
	@echo "  start-frontend               - Start frontend only (foreground)"
	@echo "  install-frontend-deps        - Run 'npm install' in frontend"
	@echo "  clean                        - (no-op) placeholder"
