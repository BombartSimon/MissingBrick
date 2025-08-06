package repository

import (
	"github.com/BombartSimon/MissingBrick/internal/entity"
	"gorm.io/gorm"
)

// MissingPartsRepository defines the interface for missing part data operations
type MissingPartsRepository interface {
	Create(missingPart *entity.MissingPart) error
	GetByID(id uint) (*entity.MissingPart, error)
	GetBySetID(setID uint) ([]entity.MissingPart, error)
	GetAll() ([]entity.MissingPart, error)
	Update(missingPart *entity.MissingPart) error
	Delete(id uint) error
	MarkAsFound(id uint) error
	MarkAsMissing(id uint) error
	GetMissingBySetID(setID uint) ([]entity.MissingPart, error)
}

// missingPartRepository implements MissingPartRepository interface
type missingPartRepository struct {
	db *gorm.DB
}

// NewMissingPartRepository creates a new missing part repository
func NewMissingPartRepository(db *gorm.DB) MissingPartsRepository {
	return &missingPartRepository{db: db}
}

// Create creates a new missing part
func (r *missingPartRepository) Create(missingPart *entity.MissingPart) error {
	return r.db.Create(missingPart).Error
}

// GetByID retrieves a missing part by its ID
func (r *missingPartRepository) GetByID(id uint) (*entity.MissingPart, error) {
	var missingPart entity.MissingPart
	err := r.db.Preload("Set").Preload("Part").First(&missingPart, id).Error
	if err != nil {
		return nil, err
	}
	return &missingPart, nil
}

// GetBySetID retrieves all missing parts for a specific set
func (r *missingPartRepository) GetBySetID(setID uint) ([]entity.MissingPart, error) {
	var missingParts []entity.MissingPart
	err := r.db.Where("set_id = ?", setID).Preload("Part").Find(&missingParts).Error
	return missingParts, err
}

// GetAll retrieves all missing parts
func (r *missingPartRepository) GetAll() ([]entity.MissingPart, error) {
	var missingParts []entity.MissingPart
	err := r.db.Preload("Set").Preload("Part").Find(&missingParts).Error
	return missingParts, err
}

// Update updates a missing part
func (r *missingPartRepository) Update(missingPart *entity.MissingPart) error {
	return r.db.Save(missingPart).Error
}

// Delete soft deletes a missing part
func (r *missingPartRepository) Delete(id uint) error {
	return r.db.Delete(&entity.MissingPart{}, id).Error
}

// MarkAsFound marks a missing part as found
func (r *missingPartRepository) MarkAsFound(id uint) error {
	return r.db.Model(&entity.MissingPart{}).Where("id = ?", id).Update("is_missing", false).Error
}

// MarkAsMissing marks a part as missing
func (r *missingPartRepository) MarkAsMissing(id uint) error {
	return r.db.Model(&entity.MissingPart{}).Where("id = ?", id).Update("is_missing", true).Error
}

// GetMissingBySetID retrieves only the missing parts for a specific set
func (r *missingPartRepository) GetMissingBySetID(setID uint) ([]entity.MissingPart, error) {
	var missingParts []entity.MissingPart
	err := r.db.Where("set_id = ? AND is_missing = ?", setID, true).Preload("Part").Find(&missingParts).Error
	return missingParts, err
}
