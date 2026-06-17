package repository

import (
	"github.com/BombartSimon/MissingBrick/internal/entity"
	"gorm.io/gorm"
)

type SetPhotoRepository interface {
	Create(photo *entity.SetPhoto) error
	GetByID(id uint) (*entity.SetPhoto, error)
	GetBySetID(setID uint) ([]entity.SetPhoto, error)
	Update(photo *entity.SetPhoto) error
	Delete(id uint) error
	ClearPrimary(setID uint) error
}

type setPhotoRepository struct {
	db *gorm.DB
}

func NewSetPhotoRepository(db *gorm.DB) SetPhotoRepository {
	return &setPhotoRepository{db: db}
}

func (r *setPhotoRepository) Create(photo *entity.SetPhoto) error {
	return r.db.Create(photo).Error
}

func (r *setPhotoRepository) GetByID(id uint) (*entity.SetPhoto, error) {
	var photo entity.SetPhoto
	err := r.db.First(&photo, id).Error
	if err != nil {
		return nil, err
	}
	return &photo, nil
}

func (r *setPhotoRepository) GetBySetID(setID uint) ([]entity.SetPhoto, error) {
	var photos []entity.SetPhoto
	err := r.db.Where("set_id = ?", setID).Order("is_primary DESC, created_at DESC").Find(&photos).Error
	return photos, err
}

func (r *setPhotoRepository) Update(photo *entity.SetPhoto) error {
	return r.db.Save(photo).Error
}

func (r *setPhotoRepository) Delete(id uint) error {
	return r.db.Delete(&entity.SetPhoto{}, id).Error
}

func (r *setPhotoRepository) ClearPrimary(setID uint) error {
	return r.db.Model(&entity.SetPhoto{}).Where("set_id = ?", setID).Update("is_primary", false).Error
}
