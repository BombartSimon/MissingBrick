package repository

import (
	"github.com/BombartSimon/MissingBrick/internal/entity"
	"gorm.io/gorm"
)

// PartRepository defines the interface for part data operations
type PartRepository interface {
	Create(part *entity.Part) error
	GetByID(id uint) (*entity.Part, error)
	GetByPartNum(partNum string) (*entity.Part, error)
	GetAll() ([]entity.Part, error)
	Update(part *entity.Part) error
	Delete(id uint) error
	Search(query string) ([]entity.Part, error)
}

// partRepository implements PartRepository interface
type partRepository struct {
	db *gorm.DB
}

// NewPartRepository creates a new part repository
func NewPartRepository(db *gorm.DB) PartRepository {
	return &partRepository{db: db}
}

// Create creates a new part
func (r *partRepository) Create(part *entity.Part) error {
	return r.db.Create(part).Error
}

// GetByID retrieves a part by its ID
func (r *partRepository) GetByID(id uint) (*entity.Part, error) {
	var part entity.Part
	err := r.db.First(&part, id).Error
	if err != nil {
		return nil, err
	}
	return &part, nil
}

// GetByPartNum retrieves a part by its part number
func (r *partRepository) GetByPartNum(partNum string) (*entity.Part, error) {
	var part entity.Part
	err := r.db.Where("part_num = ?", partNum).First(&part).Error
	if err != nil {
		return nil, err
	}
	return &part, nil
}

// GetAll retrieves all parts
func (r *partRepository) GetAll() ([]entity.Part, error) {
	var parts []entity.Part
	err := r.db.Find(&parts).Error
	return parts, err
}

// Update updates a part
func (r *partRepository) Update(part *entity.Part) error {
	return r.db.Save(part).Error
}

// Delete soft deletes a part
func (r *partRepository) Delete(id uint) error {
	return r.db.Delete(&entity.Part{}, id).Error
}

// Search searches parts by name or part number
func (r *partRepository) Search(query string) ([]entity.Part, error) {
	var parts []entity.Part
	err := r.db.Where("name LIKE ? OR part_num LIKE ?", "%"+query+"%", "%"+query+"%").Find(&parts).Error
	return parts, err
}
