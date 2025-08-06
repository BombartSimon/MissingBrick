# MissingBrick - LEGO Set and Parts Tracker

A Go-based application to track LEGO sets and missing parts using the Rebrickable API. The application is fully functional and ready to use through its REST API endpoints.

## Status

✅ **Ready to use** - The backend API is fully functional and can be used with Bruno API client or any HTTP client. No graphical interface is currently available, but all features are accessible through the API endpoints.

## Features

- Manage LEGO sets in your collection
- Track missing parts for each set
- Sync set data from Rebrickable API
- Create sets with all their parts automatically
- Assign missing parts to sets
- RESTful API with JSON responses
- SQLite database with GORM
- Clean architecture with repository pattern
- Complete Bruno API collection for testing and usage

## Prerequisites

- Go 1.24+ 
- Rebrickable API Key (get one from https://rebrickable.com/api/)
- Bruno API Client (optional but recommended - download from https://www.usebruno.com/)

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
- `POST /api/v1/sets` - Create a new set with all its parts from Rebrickable
- `POST /api/v1/sets/sync` - Sync set from Rebrickable (deprecated, use with-parts instead)
- `GET /api/v1/sets/:id` - Get set by ID
- `GET /api/v1/sets/:id/with-parts` - Get set by ID with all its parts
- `GET /api/v1/sets/:id/missing-parts` - Get set with missing parts only
- `GET /api/v1/sets/by-num/:setNum` - Get set by set number
- `PUT /api/v1/sets/:id` - Update set
- `DELETE /api/v1/sets/:id` - Delete set

### Missing Parts
- `POST /api/v1/missing-parts` - Assign missing parts to a set
- `GET /api/v1/missing-parts/:set_id` - Get missing parts for a specific set

### Health Check
- `GET /health` - Health check endpoint

## How to Use

### Option 1: Using Bruno API Client (Recommended)

1. Download and install Bruno from https://www.usebruno.com/
2. Open Bruno and import the collection from `backend/docs/api/`
3. Set the environment to "LOCAL" 
4. Start making requests to the API

The Bruno collection includes all available endpoints with example requests and proper authentication setup.

### Option 2: Using curl or any HTTP client

  ## Example Usage

### Create a Set
```bash
curl -X POST http://localhost:8080/api/v1/sets \
  -H "Content-Type: application/json" \
  -d '{"set_num": "75349-1"}'
```

### Assign Missing Parts to a Set
```bash
curl -X POST http://localhost:8080/api/v1/missing-parts \
  -H "Content-Type: application/json" \
  -d '{
    "set_id": 1,
    "part_requests": [
      {
        "set_part_id": 9,
        "quantity": 5
      }
    ]
  }'
```

### Get Missing Parts for a Set
```bash
curl http://localhost:8080/api/v1/missing-parts/1
```

### Get All Sets
```bash
curl http://localhost:8080/api/v1/sets
```

## Project Structure

```
backend/
├── cmd/
│   └── main.go                         # Application entry point
├── docs/
│   └── api/                           # Bruno API collection
│       ├── bruno.json                 # Bruno collection configuration
│       ├── environments/              # API environments (LOCAL)
│       ├── SETS/                      # Set-related API requests
│       └── MISSING_PARTS/             # Missing parts API requests
├── internal/
│   ├── config/
│   │   └── config.go                  # Configuration management
│   ├── database/
│   │   └── database.go                # Database connection and migration
│   ├── entity/
│   │   ├── set.go                     # Set entity/model
│   │   └── part.go                    # Part and MissingPart entities
│   ├── repository/
│   │   ├── set_repository.go          # Set data access layer
│   │   ├── part_repository.go         # Part data access layer
│   │   ├── set_part_repository.go     # Set-Part relationship data access
│   │   └── missing_part_repository.go # Missing part data access layer
│   ├── service/
│   │   ├── rebrickable_service.go     # Rebrickable API client
│   │   ├── set_service.go             # Set business logic
│   │   ├── part_service.go            # Part business logic
│   │   ├── set_part_service.go        # Set-Part relationship logic
│   │   └── mission_parts_service.go   # Missing parts business logic
│   ├── handler/
│   │   ├── set_handler.go             # Set HTTP handlers/controllers
│   │   ├── missing_parts_handler.go   # Missing parts HTTP handlers
│   │   └── set_part_handler.go        # Set-Part relationship handlers
│   └── router/
│       └── router.go                  # Route definitions
├── go.mod                            # Go modules file
└── missing_brick.db                  # SQLite database file
```

## Architecture

The application follows the Clean Architecture pattern:

- **Entities**: Core business models (`entity/`)
- **Repository**: Data access layer (`repository/`)
- **Service**: Business logic layer (`service/`)
- **Handler**: HTTP handlers/controllers (`handler/`)
- **Router**: HTTP routing (`router/`)
- **Documentation**: Bruno API collection (`docs/api/`)

## Current Features

✅ **Fully implemented and working:**
- Complete CRUD operations for LEGO sets
- Automatic synchronization with Rebrickable API
- Missing parts tracking and assignment
- Bruno API collection for easy testing
- Clean architecture with separation of concerns
- SQLite database with proper relationships

## Testing with Bruno

The project includes a complete Bruno API collection located in `backend/docs/api/`. This collection provides:

- Pre-configured requests for all endpoints
- Example payloads and responses
- Environment variables for easy switching between environments
- Organized folders by feature (SETS, MISSING_PARTS)

To use the Bruno collection:
1. Install Bruno from https://www.usebruno.com/
2. Open the collection from `backend/docs/api/`
3. Select the LOCAL environment
4. Start the backend server
5. Execute requests directly from Bruno

## Next Steps

Possible future enhancements:

1. **Frontend Development**: Create a web or mobile interface
2. **User Authentication**: Implement user accounts and authentication
3. **Advanced Features**: 
   - Bulk import/export functionality
   - Parts inventory management
   - Collection statistics and reports
   - Photo attachments for sets and parts
4. **Technical Improvements**:
   - Add comprehensive unit tests
   - Implement caching for better performance
   - Add logging middleware
   - Add rate limiting
   - Deploy to cloud infrastructure

## Contributing

Feel free to submit issues and enhancement requests! The API is stable and ready for frontend development or integration with other tools.
# MissingBrick
