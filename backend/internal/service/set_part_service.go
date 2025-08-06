package service

import (
	"encoding/json"
	"fmt"

	"github.com/BombartSimon/MissingBrick/internal/entity"
	"github.com/BombartSimon/MissingBrick/internal/repository"
)

// SetPartService handles business logic for set parts
type SetPartService interface {
	SyncSetPartsFromRebrickable(setID uint, setNum string) error
	GetSetParts(setID uint) ([]entity.SetPart, error)
	CreateSetPart(setPart *entity.SetPart) error
	UpdateSetPart(setPart *entity.SetPart) error
	DeleteSetPart(id uint) error
	ReplaceSetParts(setID uint, setNum string) error
}

// setPartService implements SetPartService interface
type setPartService struct {
	setPartRepo        repository.SetPartRepository
	partRepo           repository.PartRepository
	rebrickableService RebrickableService
}

// NewSetPartService creates a new set part service
func NewSetPartService(setPartRepo repository.SetPartRepository, partRepo repository.PartRepository, rebrickableService RebrickableService) SetPartService {
	return &setPartService{
		setPartRepo:        setPartRepo,
		partRepo:           partRepo,
		rebrickableService: rebrickableService,
	}
}

// SyncSetPartsFromRebrickable syncs set parts from Rebrickable API
func (s *setPartService) SyncSetPartsFromRebrickable(setID uint, setNum string) error {
	// Get parts from Rebrickable
	rbSetParts, err := s.rebrickableService.GetSetParts(setNum)
	if err != nil {
		return fmt.Errorf("failed to fetch set parts from Rebrickable: %w", err)
	}

	var setParts []entity.SetPart

	for _, rbSetPart := range rbSetParts {
		// Check if part exists in our database
		part, err := s.partRepo.GetByPartNum(rbSetPart.Part.PartNum)
		if err != nil {
			// Part doesn't exist, create it
			externalIDsJSON, _ := json.Marshal(rbSetPart.Part.ExternalIDs)
			part = &entity.Part{
				PartNum:      rbSetPart.Part.PartNum,
				Name:         rbSetPart.Part.Name,
				PartCatID:    rbSetPart.Part.PartCatID,
				PartImageURL: rbSetPart.Part.PartImageURL,
				PartURL:      rbSetPart.Part.PartURL,
				ExternalIDs:  string(externalIDsJSON),
				PrintOf:      rbSetPart.Part.PrintOf,
			}

			err = s.partRepo.Create(part)
			if err != nil {
				return fmt.Errorf("failed to create part %s: %w", rbSetPart.Part.PartNum, err)
			}
		}

		// Create SetPart entry
		setPart := entity.SetPart{
			SetID:     setID,
			PartID:    part.ID,
			ColorID:   rbSetPart.Color.ID,
			ColorName: rbSetPart.Color.Name,
			ColorHex:  rbSetPart.Color.RGB,
			Quantity:  rbSetPart.Quantity,
			IsSpare:   rbSetPart.IsSpare,
		}

		setParts = append(setParts, setPart)
	}

	// Create all set parts in batch
	if len(setParts) > 0 {
		err = s.setPartRepo.CreateBatch(setParts)
		if err != nil {
			return fmt.Errorf("failed to create set parts: %w", err)
		}
	}

	return nil
}

// ReplaceSetParts replaces all parts for a set with fresh data from Rebrickable
func (s *setPartService) ReplaceSetParts(setID uint, setNum string) error {
	// Delete existing set parts
	err := s.setPartRepo.DeleteBySetID(setID)
	if err != nil {
		return fmt.Errorf("failed to delete existing set parts: %w", err)
	}

	// Sync new parts from Rebrickable
	return s.SyncSetPartsFromRebrickable(setID, setNum)
}

// GetSetParts retrieves all parts for a set
func (s *setPartService) GetSetParts(setID uint) ([]entity.SetPart, error) {
	return s.setPartRepo.GetBySetID(setID)
}

// CreateSetPart creates a new set part
func (s *setPartService) CreateSetPart(setPart *entity.SetPart) error {
	return s.setPartRepo.Create(setPart)
}

// UpdateSetPart updates a set part
func (s *setPartService) UpdateSetPart(setPart *entity.SetPart) error {
	return s.setPartRepo.Update(setPart)
}

// DeleteSetPart deletes a set part
func (s *setPartService) DeleteSetPart(id uint) error {
	return s.setPartRepo.Delete(id)
}
