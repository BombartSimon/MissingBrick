# MissingBrick - LEGO Set and Parts Tracker

A Go-based application to track LEGO sets and missing parts using the Rebrickable API.

## Features

- Manage LEGO sets in your collection
- Track missing parts for each set
- Sync set data from Rebrickable API
- RESTful API with JSON responses
- SQLite database with GORM
- Clean architecture with repository pattern

## Prerequisites

- Go 1.24+ 
- Rebrickable API Key (get one from https://rebrickable.com/api/)

## Installation

1. Clone the repository
2. Get your Rebrickable API key from https://rebrickable.com/api/
3. Set environment variables:
   ```bash
   export REBRICKABLE_API_KEY=your_api_key_here
   export DATABASE_URL=missing_brick.db  # optional, defaults to missing_brick.db
   export PORT=8080  # optional, defaults to 8080
   ```

## Running the Application

```bash
cd backend
go mod tidy  # Install dependencies
go run cmd/main.go
```

The server will start on `http://localhost:8080`

## API Endpoints

### Sets
- `GET /api/v1/sets` - Get all sets
- `POST /api/v1/sets` - Create a new set
- `GET /api/v1/sets/:id` - Get set by ID
- `PUT /api/v1/sets/:id` - Update set
- `DELETE /api/v1/sets/:id` - Delete set
- `GET /api/v1/sets/by-num/:setNum` - Get set by set number
- `POST /api/v1/sets/sync` - Sync set from Rebrickable
- `GET /api/v1/sets/:id/missing-parts` - Get set with missing parts

### Health Check
- `GET /health` - Health check endpoint

## Example Usage

### Create a Set
```bash
curl -X POST http://localhost:8080/api/v1/sets \
  -H "Content-Type: application/json" \
  -d '{"set_num": "10294-1"}'
```

### Sync Set from Rebrickable
```bash
curl -X POST http://localhost:8080/api/v1/sets/sync \
  -H "Content-Type: application/json" \
  -d '{"set_num": "10294-1"}'
```

### Get All Sets
```bash
curl http://localhost:8080/api/v1/sets
```

## Project Structure

```
backend/
├── cmd/
│   └── main.go                 # Application entry point
├── internal/
│   ├── config/
│   │   └── config.go          # Configuration management
│   ├── database/
│   │   └── database.go        # Database connection and migration
│   ├── entity/
│   │   ├── set.go             # Set entity/model
│   │   └── part.go            # Part and MissingPart entities
│   ├── repository/
│   │   ├── set_repository.go          # Set data access layer
│   │   ├── part_repository.go         # Part data access layer
│   │   └── missing_part_repository.go # Missing part data access layer
│   ├── service/
│   │   ├── rebrickable_service.go     # Rebrickable API client
│   │   └── set_service.go             # Set business logic
│   ├── handler/
│   │   └── set_handler.go             # HTTP handlers/controllers
│   └── router/
│       └── router.go                  # Route definitions
├── go.mod                            # Go modules file
└── README.md                         # This file
```

## Architecture

The application follows the Clean Architecture pattern:

- **Entities**: Core business models (`entity/`)
- **Repository**: Data access layer (`repository/`)
- **Service**: Business logic layer (`service/`)
- **Handler**: HTTP handlers/controllers (`handler/`)
- **Router**: HTTP routing (`router/`)

## Next Steps

This is a basic skeleton. You can extend it by:

1. Adding more handlers for parts and missing parts
2. Implementing user authentication
3. Adding input validation
4. Adding unit tests
5. Adding logging middleware
6. Adding rate limiting
7. Adding caching
8. Creating a frontend application

## Contributing

Feel free to submit issues and enhancement requests!
# MissingBrick
