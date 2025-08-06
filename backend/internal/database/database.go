package database

import (
	"log"

	"github.com/BombartSimon/MissingBrick/internal/entity"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// Database holds the database connection
type Database struct {
	DB *gorm.DB
}

// NewDatabase creates a new database connection
func NewDatabase(databaseURL string) (*Database, error) {
	db, err := gorm.Open(sqlite.Open(databaseURL), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	// Auto migrate the schema
	err = db.AutoMigrate(
		&entity.Set{},
		&entity.Part{},
		&entity.MissingPart{},
		&entity.SetPart{},
	)
	if err != nil {
		return nil, err
	}

	log.Println("Database connected and migrated successfully")

	return &Database{DB: db}, nil
}

// Close closes the database connection
func (d *Database) Close() error {
	sqlDB, err := d.DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}
