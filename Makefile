.PHONY: build run clean test deps

# Build the application
build:
	cd backend && go build -o bin/missing-brick cmd/main.go

# Run the application
run:
	cd backend && go run cmd/main.go

# Install dependencies
deps:
	cd backend && go mod tidy

# Clean build artifacts
clean:
	cd backend && rm -rf bin/

# Run tests
test:
	cd backend && go test ./...

# Run with example environment
run-example:
	cd backend && REBRICKABLE_API_KEY=your_api_key_here DATABASE_URL=missing_brick.db PORT=8080 go run cmd/main.go

# Help
help:
	@echo "Available commands:"
	@echo "  build        - Build the application"
	@echo "  run          - Run the application"
	@echo "  deps         - Install dependencies"
	@echo "  clean        - Clean build artifacts"
	@echo "  test         - Run tests"
	@echo "  run-example  - Run with example environment variables"
