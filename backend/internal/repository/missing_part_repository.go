package repository

import (
	"github.com/BombartSimon/MissingBrick/internal/entity"
	"gorm.io/gorm"
)

type ShoppingListItem struct {
	PartID        uint   `json:"part_id"`
	PartNum       string `json:"part_num"`
	PartName      string `json:"part_name"`
	PartImageURL  string `json:"part_img_url"`
	PartURL       string `json:"part_url"`
	ColorID       int    `json:"color_id"`
	ColorName     string `json:"color_name"`
	ColorHex      string `json:"color_hex"`
	TotalQuantity int    `json:"total_quantity"`
	SetCount      int    `json:"set_count"`
	SetNames      string `json:"set_names"`
}

// MissingPartsRepository defines the interface for missing part data operations
type MissingPartsRepository interface {
	Create(missingPart *entity.MissingPart) error
	GetByID(id uint) (*entity.MissingPart, error)
	GetBySetID(setID uint) ([]entity.MissingPart, error)
	GetAll() ([]entity.MissingPart, error)
	GetActiveByIdentity(setID uint, partID uint, colorID int) (*entity.MissingPart, error)
	GetShoppingList() ([]ShoppingListItem, error)
	Update(missingPart *entity.MissingPart) error
	Delete(id uint) error
	MarkAsFound(setID uint, partID uint) error
	MarkAsMissing(setID uint, partID uint) error
	GetMissingBySetID(setID uint) ([]entity.MissingPart, error)
}

type missingPartRepository struct {
	db *gorm.DB
}

func NewMissingPartRepository(db *gorm.DB) MissingPartsRepository {
	return &missingPartRepository{db: db}
}

func (r *missingPartRepository) Create(missingPart *entity.MissingPart) error {
	return r.db.Create(missingPart).Error
}

func (r *missingPartRepository) GetByID(id uint) (*entity.MissingPart, error) {
	var missingPart entity.MissingPart
	err := r.db.Preload("Set").Preload("Part").First(&missingPart, id).Error
	if err != nil {
		return nil, err
	}
	return &missingPart, nil
}

func (r *missingPartRepository) GetBySetID(setID uint) ([]entity.MissingPart, error) {
	var missingParts []entity.MissingPart
	err := r.db.Where("set_id = ? AND is_missing = ?", setID, true).Preload("Part").Find(&missingParts).Error
	return missingParts, err
}

func (r *missingPartRepository) GetAll() ([]entity.MissingPart, error) {
	var missingParts []entity.MissingPart
	err := r.db.Where("is_missing = ?", true).Preload("Set").Preload("Part").Find(&missingParts).Error
	return missingParts, err
}

func (r *missingPartRepository) GetActiveByIdentity(setID uint, partID uint, colorID int) (*entity.MissingPart, error) {
	var missingPart entity.MissingPart
	err := r.db.Where("set_id = ? AND part_id = ? AND color_id = ?", setID, partID, colorID).First(&missingPart).Error
	if err != nil {
		return nil, err
	}
	return &missingPart, nil
}

func (r *missingPartRepository) GetShoppingList() ([]ShoppingListItem, error) {
	var items []ShoppingListItem
	err := r.db.Table("missing_parts mp").
		Select(`mp.part_id, p.part_num, p.name AS part_name, p.part_image_url, p.part_url, mp.color_id, mp.color_name, mp.color_hex, SUM(mp.quantity) AS total_quantity, COUNT(DISTINCT mp.set_id) AS set_count, GROUP_CONCAT(DISTINCT s.name) AS set_names`).
		Joins("JOIN parts p ON p.id = mp.part_id").
		Joins("JOIN sets s ON s.id = mp.set_id").
		Where("mp.deleted_at IS NULL AND mp.is_missing = ?", true).
		Group("mp.part_id, p.part_num, p.name, p.part_image_url, p.part_url, mp.color_id, mp.color_name, mp.color_hex").
		Order("p.name ASC, mp.color_name ASC").
		Scan(&items).Error
	return items, err
}

func (r *missingPartRepository) Update(missingPart *entity.MissingPart) error {
	return r.db.Save(missingPart).Error
}

func (r *missingPartRepository) Delete(id uint) error {
	return r.db.Delete(&entity.MissingPart{}, id).Error
}

func (r *missingPartRepository) MarkAsFound(setID uint, partID uint) error {
	return r.db.Model(&entity.MissingPart{}).Where("set_id = ? AND part_id = ?", setID, partID).Update("is_missing", false).Error
}

func (r *missingPartRepository) MarkAsMissing(setID uint, partID uint) error {
	return r.db.Model(&entity.MissingPart{}).Where("set_id = ? AND part_id = ?", setID, partID).Update("is_missing", true).Error
}

func (r *missingPartRepository) GetMissingBySetID(setID uint) ([]entity.MissingPart, error) {
	var missingParts []entity.MissingPart
	err := r.db.Where("set_id = ? AND is_missing = ?", setID, true).Preload("Part").Find(&missingParts).Error
	return missingParts, err
}
