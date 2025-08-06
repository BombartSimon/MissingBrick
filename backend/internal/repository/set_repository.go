package repository

import (
	"github.com/BombartSimon/MissingBrick/internal/entity"
	"gorm.io/gorm"
)

// SetRepository defines the interface for set data operations
type SetRepository interface {
	Create(set *entity.Set) error
	GetByID(id uint) (*entity.Set, error)
	GetBySetNum(setNum string) (*entity.Set, error)
	GetAll() ([]entity.Set, error)
	Update(set *entity.Set) error
	Delete(id uint) error
	GetWithMissingParts(id uint) (*entity.Set, error)
}

// setRepository implements SetRepository interface
type setRepository struct {
	db *gorm.DB
}

// NewSetRepository creates a new set repository
func NewSetRepository(db *gorm.DB) SetRepository {
	return &setRepository{db: db}
}

// Create creates a new set
func (r *setRepository) Create(set *entity.Set) error {
	return r.db.Create(set).Error
}

// GetByID retrieves a set by its ID
func (r *setRepository) GetByID(id uint) (*entity.Set, error) {
	var set entity.Set
	err := r.db.First(&set, id).Error
	if err != nil {
		return nil, err
	}
	return &set, nil
}

// GetBySetNum retrieves a set by its set number
func (r *setRepository) GetBySetNum(setNum string) (*entity.Set, error) {
	var set entity.Set
	err := r.db.Where("set_num = ?", setNum).First(&set).Error
	if err != nil {
		return nil, err
	}
	return &set, nil
}

// GetAll retrieves all sets
func (r *setRepository) GetAll() ([]entity.Set, error) {
	var sets []entity.Set
	err := r.db.Find(&sets).Error
	return sets, err
}

// Update updates a set
func (r *setRepository) Update(set *entity.Set) error {
	return r.db.Save(set).Error
}

// Delete soft deletes a set
func (r *setRepository) Delete(id uint) error {
	return r.db.Delete(&entity.Set{}, id).Error
}

// GetWithMissingParts retrieves a set with its missing parts
func (r *setRepository) GetWithMissingParts(id uint) (*entity.Set, error) {
	var set entity.Set
	err := r.db.Preload("MissingParts.Part").First(&set, id).Error
	if err != nil {
		return nil, err
	}
	return &set, nil
}
