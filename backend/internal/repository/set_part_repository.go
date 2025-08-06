package repository

import (
	"github.com/BombartSimon/MissingBrick/internal/entity"
	"gorm.io/gorm"
)

// SetPartRepository defines the interface for set part data operations
type SetPartRepository interface {
	Create(setPart *entity.SetPart) error
	CreateBatch(setParts []entity.SetPart) error
	GetBySetID(setID uint) ([]entity.SetPart, error)
	GetByID(id uint) (*entity.SetPart, error)
	Update(setPart *entity.SetPart) error
	Delete(id uint) error
	DeleteBySetID(setID uint) error
}

// setPartRepository implements SetPartRepository interface
type setPartRepository struct {
	db *gorm.DB
}

// NewSetPartRepository creates a new set part repository
func NewSetPartRepository(db *gorm.DB) SetPartRepository {
	return &setPartRepository{db: db}
}

// Create creates a new set part
func (r *setPartRepository) Create(setPart *entity.SetPart) error {
	return r.db.Create(setPart).Error
}

// CreateBatch creates multiple set parts in a batch
func (r *setPartRepository) CreateBatch(setParts []entity.SetPart) error {
	return r.db.CreateInBatches(setParts, 100).Error
}

// GetBySetID retrieves all parts for a specific set
func (r *setPartRepository) GetBySetID(setID uint) ([]entity.SetPart, error) {
	var setParts []entity.SetPart
	err := r.db.Where("set_id = ?", setID).Preload("Part").Find(&setParts).Error
	return setParts, err
}

// GetByID retrieves a set part by its ID
func (r *setPartRepository) GetByID(id uint) (*entity.SetPart, error) {
	var setPart entity.SetPart
	err := r.db.Preload("Set").Preload("Part").First(&setPart, id).Error
	if err != nil {
		return nil, err
	}
	return &setPart, nil
}

// Update updates a set part
func (r *setPartRepository) Update(setPart *entity.SetPart) error {
	return r.db.Save(setPart).Error
}

// Delete soft deletes a set part
func (r *setPartRepository) Delete(id uint) error {
	return r.db.Delete(&entity.SetPart{}, id).Error
}

// DeleteBySetID deletes all parts for a specific set
func (r *setPartRepository) DeleteBySetID(setID uint) error {
	return r.db.Where("set_id = ?", setID).Delete(&entity.SetPart{}).Error
}
