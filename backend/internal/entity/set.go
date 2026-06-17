package entity

import (
	"time"

	"gorm.io/gorm"
)

// Set represents a LEGO set
type Set struct {
	ID              uint           `gorm:"primaryKey" json:"id"`
	SetNum          string         `gorm:"uniqueIndex;not null" json:"set_num"`
	Name            string         `gorm:"not null" json:"name"`
	Year            int            `json:"year"`
	ThemeID         int            `json:"theme_id"`
	NumParts        int            `json:"num_parts"`
	SetImageURL     string         `json:"set_img_url"`
	SetURL          string         `json:"set_url"`
	Notes           string         `gorm:"type:text" json:"notes"`
	StorageLocation string         `json:"storage_location"`
	BuildStatus     string         `gorm:"not null;default:not_started" json:"build_status"`
	LastModified    time.Time      `json:"last_modified_dt"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`

	// Relations
	MissingParts []MissingPart `gorm:"foreignKey:SetID" json:"missing_parts,omitempty"`
	SetParts     []SetPart     `gorm:"foreignKey:SetID" json:"set_parts,omitempty"`
	Photos       []SetPhoto    `gorm:"foreignKey:SetID" json:"photos,omitempty"`
}

// TableName overrides the table name used by GORM
func (Set) TableName() string {
	return "sets"
}

// SetPhoto represents a user-uploaded photo for a LEGO set.
type SetPhoto struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	SetID        uint           `gorm:"not null;index" json:"set_id"`
	FileName     string         `gorm:"not null" json:"file_name"`
	OriginalName string         `json:"original_name"`
	ContentType  string         `json:"content_type"`
	SizeBytes    int64          `json:"size_bytes"`
	URL          string         `gorm:"not null" json:"url"`
	Title        string         `json:"title"`
	PhotoType    string         `gorm:"not null;default:other" json:"photo_type"`
	IsPrimary    bool           `gorm:"default:false" json:"is_primary"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`

	Set Set `gorm:"foreignKey:SetID" json:"-"`
}

func (SetPhoto) TableName() string {
	return "set_photos"
}
