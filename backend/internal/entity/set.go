package entity

import (
	"time"

	"gorm.io/gorm"
)

// Set represents a LEGO set
type Set struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	SetNum       string         `gorm:"uniqueIndex;not null" json:"set_num"`
	Name         string         `gorm:"not null" json:"name"`
	Year         int            `json:"year"`
	ThemeID      int            `json:"theme_id"`
	NumParts     int            `json:"num_parts"`
	SetImageURL  string         `json:"set_img_url"`
	SetURL       string         `json:"set_url"`
	LastModified time.Time      `json:"last_modified_dt"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`

	// Relations
	MissingParts []MissingPart `gorm:"foreignKey:SetID" json:"missing_parts,omitempty"`
	SetParts     []SetPart     `gorm:"foreignKey:SetID" json:"set_parts,omitempty"`
}

// TableName overrides the table name used by GORM
func (Set) TableName() string {
	return "sets"
}
