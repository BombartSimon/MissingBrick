package main

import (
	"log"

	"github.com/BombartSimon/MissingBrick/internal/config"
	"github.com/BombartSimon/MissingBrick/internal/database"
	"github.com/BombartSimon/MissingBrick/internal/handler"
	"github.com/BombartSimon/MissingBrick/internal/repository"
	"github.com/BombartSimon/MissingBrick/internal/router"
	"github.com/BombartSimon/MissingBrick/internal/service"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()

	// Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Check if Rebrickable API key is provided
	if cfg.RebrickableAPIKey == "" {
		log.Fatal("REBRICKABLE_API_KEY environment variable is required")
	}

	// Initialize database
	db, err := database.NewDatabase(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Initialize repositories
	setRepo := repository.NewSetRepository(db.DB)
	partRepo := repository.NewPartRepository(db.DB)
	setPartRepo := repository.NewSetPartRepository(db.DB)
	missingPartsRepo := repository.NewMissingPartRepository(db.DB)

	// Initialize services
	rebrickableService := service.NewRebrickableService(cfg.RebrickableAPIKey)
	setPartService := service.NewSetPartService(setPartRepo, partRepo, rebrickableService)
	setService := service.NewSetService(setRepo, setPartService, rebrickableService)
	missingPartsService := service.NewMissingPartsService(missingPartsRepo, setPartRepo)

	// Initialize handlers
	setHandler := handler.NewSetHandler(setService)
	missingPartsHandler := handler.NewMissingPartsHandler(missingPartsService)
	setPartsHandler := handler.NewSetPartsHandler(setPartService)

	// Initialize router
	r := router.NewRouter(
		setHandler,
		setPartsHandler,
		missingPartsHandler,
	)
	engine := r.SetupRoutes()

	// Start server
	log.Printf("Starting server on port %s", cfg.Port)
	log.Printf("Database: %s", cfg.DatabaseURL)
	log.Printf("Rebrickable API Key: %s...", cfg.RebrickableAPIKey[:min(10, len(cfg.RebrickableAPIKey))])

	if err := engine.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// min returns the minimum of two integers
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
