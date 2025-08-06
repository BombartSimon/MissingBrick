package entity

import (
	"time"

	"gorm.io/gorm"
)

// Part represents a LEGO part from Rebrickable API
type Part struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	PartNum      string         `gorm:"uniqueIndex;not null" json:"part_num"`
	Name         string         `gorm:"not null" json:"name"`
	PartCatID    int            `json:"part_cat_id"`
	PartImageURL string         `json:"part_img_url"`
	PartURL      string         `json:"part_url"`
	ExternalIDs  string         `gorm:"type:text" json:"external_ids"`
	PrintOf      string         `json:"print_of"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

// MissingPart represents a missing part for a specific set
type MissingPart struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	SetID     uint           `gorm:"not null;index" json:"set_id"`
	PartID    uint           `gorm:"not null;index" json:"part_id"`
	ColorID   int            `gorm:"not null" json:"color_id"`
	ColorName string         `json:"color_name"`
	ColorHex  string         `json:"color_hex"`
	Quantity  int            `gorm:"not null;default:1" json:"quantity"`
	IsMissing bool           `gorm:"default:true" json:"is_missing"`
	Notes     string         `gorm:"type:text" json:"notes"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Relations
	Set  Set  `gorm:"foreignKey:SetID" json:"set,omitempty"`
	Part Part `gorm:"foreignKey:PartID" json:"part,omitempty"`
}

// SetPart represents a part that belongs to a specific set with quantity and color
type SetPart struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	SetID     uint           `gorm:"not null;index" json:"set_id"`
	PartID    uint           `gorm:"not null;index" json:"part_id"`
	ColorID   int            `gorm:"not null" json:"color_id"`
	ColorName string         `json:"color_name"`
	ColorHex  string         `json:"color_hex"`
	Quantity  int            `gorm:"not null;default:1" json:"quantity"`
	IsSpare   bool           `gorm:"default:false" json:"is_spare"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Relations
	Set  Set  `gorm:"foreignKey:SetID" json:"-"`
	Part Part `gorm:"foreignKey:PartID" json:"part,omitempty"`
}

// TableName overrides the table name used by GORM
func (Part) TableName() string {
	return "parts"
}

// TableName overrides the table name used by GORM
func (MissingPart) TableName() string {
	return "missing_parts"
}

// TableName overrides the table name used by GORM
func (SetPart) TableName() string {
	return "set_parts"
}
